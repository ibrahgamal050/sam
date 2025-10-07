// src/app/sites/ar/posts/page.tsx
import type { Metadata } from "next"
import Script from "next/script"
import { notFound } from "next/navigation"

import dbConnect from "@/lib/db"
import { resolveRestaurantFromHeaders } from "@/lib/domain/restaurant-context"
import { getRootDomain, resolveRestaurantHost } from "@/lib/host-utils"
import Post from "@/models/post"
import type { IRestaurant } from "@/types/restaurant"
import { PostsPage } from "@/components/ar/posts-page"

/* ---------------- Image Helpers ---------------- */
const trimSlash = (s: string) => s.replace(/\/+$/, "")
const leadingSlash = (s: string) => (s?.startsWith("/") ? s : `/${s}`)

/** يدعم: http(s), /images/*, relative + CDN عبر NEXT_PUBLIC_IMAGE_BASE_URL */
const resolveImageSrc = (path?: unknown, fallback = "/placeholder.jpg"): string => {
  const base = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "").trim()
  if (!path || typeof path !== "string") return fallback
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  if (path.startsWith("/images/")) return path
  const normalized = leadingSlash(path)
  return base ? `${trimSlash(base)}${normalized}` : normalized
}

/** حوّل أي مسار لصورة إلى URL مطلق للميتا */
const toAbsoluteImage = (src: string | undefined, host: string, protocol: "http" | "https") => {
  if (!src) return undefined
  if (src.startsWith("http://") || src.startsWith("https://")) return src
  const normalized = leadingSlash(src)
  return `${protocol}://${host}${normalized}`
}

/* ---------------- Text Helpers ---------------- */
const stripHtml = (value: unknown) =>
  typeof value === "string"
    ? value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    : ""

const extractTextFromContent = (content: any): string => {
  if (!content) return ""
  if (typeof content === "string") return stripHtml(content)
  if (Array.isArray(content)) {
    const pieces = content.map((block) => {
      if (!block) return ""
      if (typeof block === "string") return block
      if (block?.type === "text" && typeof block?.text === "string") return block.text
      if (typeof block?.title === "string") return block.title
      if (typeof block?.subtitle === "string") return block.subtitle
      if (typeof block?.description === "string") return block.description
      return ""
    })
    return stripHtml(pieces.join(" "))
  }
  if (typeof content === "object") {
    const pieces = [
      (content as any).title,
      (content as any).subtitle,
      (content as any).text,
      (content as any).description,
    ].filter(Boolean)
    return stripHtml(pieces.join(" "))
  }
  return ""
}

/* ---------------- URL Helpers ---------------- */
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

const toIso = (d: any) => {
  try {
    const dt = d instanceof Date ? d : new Date(d)
    return isNaN(dt.getTime()) ? undefined : dt.toISOString()
  } catch {
    return undefined
  }
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

    const postSnippets = latestPosts.map((post: any) => extractTextFromContent(post.content)).filter(Boolean)

    const keywords: string[] = [
      restaurantName,
      "مقالات",
      "أخبار المطعم",
      "مدونة",
      "نصائح الطعام",
    ]
    if (postSnippets.length > 0) {
      keywords.push(...postSnippets.flatMap((s: string) => s.split(" ").slice(0, 3)))
    }

    // اختر صورة أول بوست/الكفر، مرّر عبر CDN/relative → ثم اجعلها absolute للميتا
    const rawPrimary =
      (Array.isArray(latestPosts?.[0]?.image) ? latestPosts?.[0]?.image?.[0] : latestPosts?.[0]?.image) ||
      typedRestaurant.coverImage ||
      "/placeholder.jpg"

    const primaryCdn = resolveImageSrc(rawPrimary, "/placeholder.jpg")
    const primaryImage = toAbsoluteImage(primaryCdn, resolvedHost, protocol)

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
  const { restaurant, hostHeader } = await resolveRestaurantFromHeaders()
  const typedRestaurant = restaurant as IRestaurant | null

  if (!typedRestaurant) {
    return notFound()
  }

  const resolvedHost = resolveRestaurantHost(typedRestaurant, hostHeader, getRootDomain())
  const protocol = resolveProtocol(hostHeader)
  const canonicalUrl = `${protocol}://${resolvedHost}/ar/posts`
  const restaurantName = typedRestaurant.name?.ar || typedRestaurant.name?.en || typedRestaurant.subdomain

  // شعار المطعم عبر نفس نظام الصور ثم مطلق لـ JSON-LD
  const logoCdn = resolveImageSrc(typedRestaurant.logo || undefined, "/images/logo.png")
  const logoAbs = ensureAbsoluteUrl(logoCdn, resolvedHost, protocol)

  const basicStructuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `مدونة ${restaurantName}`,
    url: canonicalUrl,
    publisher: {
      "@type": "Organization",
      name: restaurantName,
      ...(logoAbs ? { logo: logoAbs } : {}),
    },
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      <Script
        id="posts-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(basicStructuredData) }}
      />
      <PostsPage />
    </div>
  )
}
