// src/app/sites/sitemap.xml/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import { getRestaurantByHost } from "@/lib/services/restaurant-service"
import { getRootDomain, normalizeHost, resolveRestaurantHost } from "@/lib/host-utils"
import Post from "@/models/post"

// ====== إعدادات عامة ======
const LOCALE_SEGMENT = "ar"

// صفحات ثابتة (بدون /posts)
const STATIC_PATHS = ["", "menu", "branches", "about", "contact","posts"]
const STATIC_CHANGEFREQ = "daily"
const STATIC_PRIORITY = "0.8"

// إعدادات البوستات
const POSTS_CHANGEFREQ = "weekly"
const POSTS_PRIORITY = "0.7"
// لو عايز تحد عدد البوستات في السايت ماب (لأداء أفضل)
const POSTS_LIMIT = 1000

// ====== Helpers ======
const escapeXml = (v: string) =>
  v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;")

const buildUrl = (base: string, path: string) => (path ? `${base}/${path}` : base)

const toIsoSafe = (d: unknown): string => {
  try {
    const date = d instanceof Date ? d : new Date(d as any)
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
  } catch {
    return new Date().toISOString()
  }
}

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  // ✅ استخدم req.headers مباشرة
  const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || ""
  const normalizedHost = normalizeHost(forwardedHost)
  const proto = req.headers.get("x-forwarded-proto") || (normalizedHost.includes("localhost") ? "http" : "https")

  const restaurant = await getRestaurantByHost(normalizedHost)

  if (!restaurant) {
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`
    return new NextResponse(emptyXml, {
      status: 404,
      headers: { "Content-Type": "application/xml" },
    })
  }

  // host الأساسي للمطعم (يدعم ساب دوميانات)
  const rootDomain = getRootDomain()
  const resolvedHost = resolveRestaurantHost(restaurant, forwardedHost, rootDomain)
  const baseUrl = `${proto}://${resolvedHost}/${LOCALE_SEGMENT}`

  // ====== روابط الصفحات الثابتة ======
  const restaurantLastmod = toIsoSafe(restaurant.updatedAt ?? new Date())
  const staticUrlsXml = STATIC_PATHS.map((p) => {
    const loc = escapeXml(buildUrl(baseUrl, p))
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${restaurantLastmod}</lastmod>
    <changefreq>${STATIC_CHANGEFREQ}</changefreq>
    <priority>${STATIC_PRIORITY}</priority>
  </url>`
  }).join("\n")

  // ====== روابط البوستات (تلقائي) ======
  await dbConnect()

  // هات آخر POSTS_LIMIT بوست للمطعم
  const posts = await Post.find(
    { restaurantId: restaurant._id },
    { "seo.slug": 1, createdAt: 1, updatedAt: 1, _id: 1 }
  )
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(POSTS_LIMIT)
    .lean()

  const postsUrlsXml = posts
    .map((post: any) => {
      const slug = (post?.seo?.slug as string) || String(post?._id)
      const postUrl = `${baseUrl}/posts/${slug}`
      const lastmod = toIsoSafe(post?.updatedAt ?? post?.createdAt ?? new Date())
      return `  <url>
    <loc>${escapeXml(postUrl)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${POSTS_CHANGEFREQ}</changefreq>
    <priority>${POSTS_PRIORITY}</priority>
  </url>`
    })
    .join("\n")

  // ====== XML النهائي ======
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrlsXml}
${postsUrlsXml ? "\n" + postsUrlsXml : ""}
</urlset>`

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  })
}
