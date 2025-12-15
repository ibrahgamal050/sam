// src/app/sites/sitemap.xml/route.ts
import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import { getRestaurantByHost } from "@/lib/services/restaurant-service"
import { getRootDomain, normalizeHost, resolveRestaurantHost } from "@/lib/host-utils"
import Post from "@/models/post"
import Pages from "@/models/page"

// ====== إعدادات عامة ======
const LOCALE_SEGMENT = "ar"

// صفحات ثابتة (بدون /posts)
const STATIC_PATHS = ["", "menu", "branches", "about", "contact","posts"]
const STATIC_CHANGEFREQ = "daily"
const STATIC_PRIORITY = "0.8"

// إعدادات البوستات
const POSTS_CHANGEFREQ = "weekly"
const POSTS_PRIORITY = "0.7"

// إعدادات الصفحات المخصصة
const PAGES_CHANGEFREQ = "weekly"
const PAGES_PRIORITY = "0.7"
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
  const staticEntries = STATIC_PATHS.map((p) => ({
    loc: buildUrl(baseUrl, p),
    lastmod: restaurantLastmod,
    changefreq: STATIC_CHANGEFREQ,
    priority: STATIC_PRIORITY,
  }))

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

  const postEntries = posts.map((post: any) => {
    const slug = (post?.seo?.slug as string) || String(post?._id)
    const postUrl = `${baseUrl}/posts/${slug}`
    const lastmod = toIsoSafe(post?.updatedAt ?? post?.createdAt ?? new Date())
    return {
      loc: postUrl,
      lastmod,
      changefreq: POSTS_CHANGEFREQ,
      priority: POSTS_PRIORITY,
    }
  })

  // ====== روابط صفحات البيلدر ======
  const pagesDoc = await Pages.findOne(
    { restaurantId: restaurant._id },
    { pages: 1 },
  ).lean()

  const pages = (pagesDoc?.pages as any[])?.filter(
    (page) => page?.isPublished && page?.language?.toLowerCase?.() === LOCALE_SEGMENT,
  )

  const pageEntries =
    pages?.map((page) => {
      const slug = page?.slug || ""
      const pageUrl = buildUrl(baseUrl, slug)
      const lastmod = toIsoSafe(page?.metadata?.updated_at ?? page?.metadata?.created_at ?? new Date())
      return {
        loc: pageUrl,
        lastmod,
        changefreq: PAGES_CHANGEFREQ,
        priority: PAGES_PRIORITY,
      }
    }) ?? []

  // Combine and dedupe by loc
  const mergedByLoc = new Map<string, { loc: string; lastmod: string; changefreq: string; priority: string }>()
  for (const entry of [...staticEntries, ...postEntries, ...pageEntries]) {
    const normalizedLoc = escapeXml(entry.loc)
    if (!mergedByLoc.has(normalizedLoc)) {
      mergedByLoc.set(normalizedLoc, { ...entry, loc: normalizedLoc })
    }
  }

  const urlsXml = Array.from(mergedByLoc.values())
    .map(
      (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join("\n")

  // ====== XML النهائي ======
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  })
}
