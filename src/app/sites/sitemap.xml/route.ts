// src/app/sites/sitemap.xml/route.ts
import { NextResponse } from "next/server"
import { getRestaurantByHost } from "@/lib/services/restaurant-service"
import { getRootDomain, normalizeHost, resolveRestaurantHost } from "@/lib/host-utils"

const LOCALE_SEGMENT = "ar"
const CHANGE_FREQUENCY = "daily"
const PRIORITY = "0.8"
const STATIC_PATHS = ["", "menu", "branches", "about","contact"]

const escapeXml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;")

const buildUrl = (base: string, path: string) => (path ? `${base}/${path}` : base)

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  // ✅ استخدم req.headers بدل headers()
  const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || ""
  const normalizedHost = normalizeHost(forwardedHost)
  const proto =
    req.headers.get("x-forwarded-proto") ||
    (normalizedHost.includes("localhost") ? "http" : "https")

  const restaurant = await getRestaurantByHost(normalizedHost)

  if (!restaurant) {
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`
    return new NextResponse(emptyXml, {
      status: 404,
      headers: { "Content-Type": "application/xml" },
    })
  }

  const rootDomain = getRootDomain()
  const resolvedHost = resolveRestaurantHost(restaurant, forwardedHost, rootDomain)
  const baseUrl = `${proto}://${resolvedHost}/${LOCALE_SEGMENT}`
  const lastmod = new Date(restaurant.updatedAt ?? new Date()).toISOString()

  const urlsXml = STATIC_PATHS.map((p) => {
    const loc = escapeXml(buildUrl(baseUrl, p))
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${CHANGE_FREQUENCY}</changefreq>
    <priority>${PRIORITY}</priority>
  </url>`
  }).join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  })
}
