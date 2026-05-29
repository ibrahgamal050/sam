// src/app/sites/ar/posts/[slug]/page.tsx
import type { Metadata } from "next"
import Script from "next/script"
import { notFound } from "next/navigation"

import dbConnect from "@/lib/db"
import { resolveRestaurantFromHeaders } from "@/lib/domain/restaurant-context"
import { getRootDomain, resolveRestaurantHost } from "@/lib/host-utils"
import Post from "@/models/post"
import type { IRestaurant } from "@/types/restaurant"
import PostRenderer from "@/components/ru/posts/PostRenderer"

// ---------- Image helpers ----------
const trimSlash = (s: string) => s.replace(/\/+$/,"")
const leadingSlash = (s: string) => (s.startsWith("/") ? s : `/${s}`)

export const resolveImageSrc = (path?: string | null, fallback = "/placeholder.jpg") => {
  const base = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "").trim()
  if (!path) return fallback
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  if (path.startsWith("/images/")) return path
  const normalized = leadingSlash(path)
  return base ? `${trimSlash(base)}${normalized}` : normalized
}

// ---------- General helpers ----------
const resolveProtocol = (hostHeader: string): "http" | "https" => {
  const normalized = (hostHeader || "").toLowerCase()
  return normalized.includes("localhost") || normalized.includes("127.0.0.1") ? "http" : "https"
}

const ensureAbsoluteUrl = (
  path: unknown,
  host: string,
  protocol: "http" | "https"
): string | undefined => {
  if (!path || typeof path !== "string") return undefined
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  const normalized = leadingSlash(path)
  return `${protocol}://${host}${normalized}`
}

const extractPlainText = (content: any): string => {
  if (!content) return ""
  const strip = (s: string) => s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  if (typeof content === "string") return strip(content).slice(0, 300)
  if (Array.isArray(content)) {
    const pick = (b: any) =>
      [
        b?.heading,
        b?.title,
        b?.subtitle,
        b?.text,
        typeof b?.button?.label === "string" ? b.button.label : "",
        typeof b?.description === "string" ? b.description : "",
      ]
        .filter(Boolean)
        .join(" ")
    return strip(content.map(pick).join(" • ")).slice(0, 300)
  }
  if (typeof content === "object") {
    const any = content as any
    return strip([any.title, any.subtitle, any.text, any.description].filter(Boolean).join(" ")).slice(0, 300)
  }
  return ""
}

const pickImage = (img: unknown): string | undefined => {
  if (!img) return undefined
  if (Array.isArray(img)) return img.find(Boolean)
  if (typeof img === "string") return img
  return undefined
}

const toIsoSafe = (d: unknown): string | undefined => {
  try {
    if (!d) return undefined
    const date = d instanceof Date ? d : new Date(d as any)
    const t = date.getTime()
    if (isNaN(t)) return undefined
    return date.toISOString()
  } catch {
    return undefined
  }
}

// ---------- Static ----------
export const dynamic = "force-dynamic"
export const revalidate = 0

// ---------- Metadata ----------
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const { restaurant, hostHeader } = await resolveRestaurantFromHeaders()
    const typedRestaurant = restaurant as IRestaurant | null
    if (!typedRestaurant) {
      return { title: "المقال غير متاح", description: "لا يمكن العثور على بيانات المطعم لعرض تفاصيل المقال." }
    }

    await dbConnect()

    const post = await Post.findOne(
      { "seo.slug": params.slug, restaurantId: typedRestaurant._id },
      { title: 1, image: 1, coverImage: 1, content: 1, createdAt: 1, updatedAt: 1, "seo.slug": 1 }
    ).lean()

    if (!post) {
      return {
        title: "المقال غير موجود",
        description: `لم يتم العثور على المقال المطلوب في ${typedRestaurant.name?.ar ?? typedRestaurant.name?.en ?? typedRestaurant.subdomain}.`,
      }
    }

    const resolvedHost = resolveRestaurantHost(typedRestaurant, hostHeader, getRootDomain())
    const protocol = resolveProtocol(hostHeader)
    const slug = (post as any)?.seo?.slug || params.slug
    const canonicalUrl = `${protocol}://${resolvedHost}/ar/posts/${slug}`
    const restaurantName = typedRestaurant.name?.ar || typedRestaurant.name?.en || typedRestaurant.subdomain

    const description = extractPlainText((post as any).content) || `اقرأ مقال ${post.title} من ${restaurantName}.`
    const publishedTime = toIsoSafe((post as any).createdAt)
    const updatedTime = toIsoSafe((post as any).updatedAt)

    const rawImg =
      pickImage((post as any).image) ?? pickImage((post as any).coverImage) ?? typedRestaurant.coverImage ?? "/placeholder.jpg"
    const cdnImg = resolveImageSrc(rawImg, "/placeholder.jpg")
    const imageUrl = ensureAbsoluteUrl(cdnImg, resolvedHost, protocol)

    return {
      title: `${post.title} | ${restaurantName}`,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: post.title,
        description,
        type: "article",
        url: canonicalUrl,
        ...(publishedTime ? { publishedTime } : {}),
        ...(updatedTime ? { modifiedTime: updatedTime } : {}),
        images: imageUrl ? [{ url: imageUrl }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },
    }
  } catch (error) {
    console.error("Error generating post metadata", error)
    return { title: "مقال المطعم", description: "اقرأ أحدث المقالات والأخبار من المطعم." }
  }
}

// ---------- Page ----------
export default async function PostDetailsPage({ params }: { params: { slug: string } }) {
  const { restaurant, hostHeader } = await resolveRestaurantFromHeaders()
  const typedRestaurant = restaurant as IRestaurant | null
  if (!typedRestaurant) return notFound()

  await dbConnect()

  const post = await Post.findOne(
    { "seo.slug": params.slug, restaurantId: typedRestaurant._id },
    {
      title: 1,
      subtitle: 1,
      image: 1,
      coverImage: 1,
      layoutType: 1,
      content: 1,
      createdAt: 1,
      updatedAt: 1,
      "seo.slug": 1,
    }
  ).lean()

  if (!post) return notFound()

  const resolvedHost = resolveRestaurantHost(typedRestaurant, hostHeader, getRootDomain())
  const protocol = resolveProtocol(hostHeader)
  const slug = (post as any)?.seo?.slug || params.slug
  const canonicalUrl = `${protocol}://${resolvedHost}/ar/posts/${slug}`
  const restaurantName = typedRestaurant.name?.ar || typedRestaurant.name?.en || typedRestaurant.subdomain

  const publishedTime = toIsoSafe((post as any).createdAt)
  const updatedTime = toIsoSafe((post as any).updatedAt)

  const rawImg =
    pickImage((post as any).image) ?? pickImage((post as any).coverImage) ?? typedRestaurant.coverImage ?? "/placeholder.jpg"
  const cdnImg = resolveImageSrc(rawImg, "/placeholder.jpg")
  const absoluteImg = ensureAbsoluteUrl(cdnImg, resolvedHost, protocol)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: extractPlainText((post as any).content) || `اقرأ مقال ${post.title} من ${restaurantName}.`,
    ...(publishedTime ? { datePublished: publishedTime } : {}),
    ...(updatedTime ? { dateModified: updatedTime } : {}),
    ...(absoluteImg ? { image: absoluteImg } : {}),
    author: { "@type": "Organization", name: restaurantName },
    publisher: {
      "@type": "Organization",
      name: restaurantName,
      logo: ensureAbsoluteUrl(resolveImageSrc(typedRestaurant.logo || undefined), resolvedHost, protocol),
    },
    mainEntityOfPage: canonicalUrl,
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Script
        id="post-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostRenderer
        title={(post as any).title}
        subtitle={(post as any).subtitle}
        image={cdnImg}
        layoutType={(post as any).layoutType ?? "classic"}
        content={(post as any).content ?? []}
      />
    </div>
  )
}
