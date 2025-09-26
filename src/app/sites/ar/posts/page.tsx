import type { Metadata } from "next"
import { notFound } from "next/navigation"

import dbConnect from "@/lib/db"
import { resolveRestaurantFromHeaders } from "@/lib/domain/restaurant-context"
import { getRootDomain, resolveRestaurantHost } from "@/lib/host-utils"
import Post from "@/models/post"
import type { IRestaurant } from "@/types/restaurant"
import { PostsPage } from "@/components/ar/posts-page"

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()

const resolveProtocol = (hostHeader: string): "http" | "https" => {
  const normalized = hostHeader.toLowerCase()
  return normalized.includes("localhost") || normalized.includes("127.0.0.1") ? "http" : "https"
}

const ensureAbsoluteUrl = (path: string | undefined | null, host: string, protocol: "http" | "https") => {
  if (!path) return undefined
  if (path.startsWith("http")) return path
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${protocol}://${host}${normalized}`
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { restaurant, hostHeader } = await resolveRestaurantFromHeaders()
    const typedRestaurant = restaurant as IRestaurant | null

    if (!typedRestaurant) {
      return {
        title: "المقالات",
        description: "اكتشف أحدث المقالات والأخبار من مطاعم Meelza.",
      }
    }

    await dbConnect()

    const latestPosts = await Post.find({ restaurantId: typedRestaurant._id })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean()

    const resolvedHost = resolveRestaurantHost(typedRestaurant, hostHeader, getRootDomain())
    const protocol = resolveProtocol(hostHeader)
    const canonicalUrl = `${protocol}://${resolvedHost}/ar/posts`
    const restaurantName = typedRestaurant.name?.ar || typedRestaurant.name?.en || typedRestaurant.subdomain

    const postSnippets = latestPosts.map((post) => stripHtml(post.content ?? "")).filter(Boolean)
    const keywords = [restaurantName, "مقالات", "أخبار المطعم", "مدونة", "نصائح الطعام"]
    if (postSnippets.length > 0) {
      keywords.push(...postSnippets.flatMap((snippet) => snippet.split(" ").slice(0, 3)))
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: `مدونة ${restaurantName}`,
      description:
        latestPosts.length > 0
          ? `اطلع على أحدث ${latestPosts.length} مقالات من ${restaurantName}.`
          : `تابع أحدث مقالات ${restaurantName} حول العروض والأخبار.`,
      url: canonicalUrl,
      publisher: {
        "@type": "Organization",
        name: restaurantName,
        logo: ensureAbsoluteUrl(typedRestaurant.logo, resolvedHost, protocol),
      },
      blogPost: latestPosts.map((post) => ({
        "@type": "BlogPosting",
        headline: post.title,
        datePublished: post.createdAt?.toISOString?.() ?? new Date(post.createdAt).toISOString(),
        image: ensureAbsoluteUrl(post.image, resolvedHost, protocol),
        url: `${canonicalUrl}/${post._id}`,
        description: stripHtml(post.content ?? "").slice(0, 160),
      })),
    }

    const primaryImage = ensureAbsoluteUrl(latestPosts[0]?.image ?? typedRestaurant.coverImage, resolvedHost, protocol)
    const description =
      latestPosts.length > 0
        ? `تعرف على أحدث المقالات والأخبار من ${restaurantName} لتحسين تجربة زوارك.`
        : `تابع مقالات ${restaurantName} حول أحدث الأخبار والعروض.`

    return {
      title: `مقالات ${restaurantName}`,
      description,
      keywords,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `مقالات ${restaurantName}`,
        description,
        type: "website",
        url: canonicalUrl,
        images: primaryImage ? [{ url: primaryImage }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: `مقالات ${restaurantName}`,
        description,
        images: primaryImage ? [primaryImage] : undefined,
      },
      other: {
        "ld+json": JSON.stringify(structuredData),
      },
    }
  } catch (error) {
    console.error("Error generating posts metadata", error)
    return {
      title: "مقالات المطعم",
      description: "اطلع على أحدث المقالات والأخبار من المطعم.",
    }
  }
}

export default async function PostsRoute() {
  const { restaurant } = await resolveRestaurantFromHeaders()
  const typedRestaurant = restaurant as IRestaurant | null

  if (!typedRestaurant) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      <PostsPage />
    </div>
  )
}
