// src/app/sites/sitemap.xml/route.ts
import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import Restaurant from "@/models/restaurant"

type RestaurantRecord = { subdomain: string; updatedAt: Date }

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "meelza.com").toLowerCase()
const SITES_DOMAIN = (process.env.NEXT_PUBLIC_SITES_DOMAIN ?? "meelza.com").toLowerCase()
const LOCALE_SEGMENT = "ar"
const CHANGE_FREQUENCY = "daily"
const PRIORITY = "0.8"
const STATIC_PATHS = ["", "menu", "branches", "about","contact"]

const escapeXml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;")

function normalizeHost(rawHost: string) {
  return (rawHost || "").toLowerCase().replace(/\.$/, "").replace(/:\d+$/, "")
}

function extractSubdomain(host: string): string | null {
  if (host.endsWith(".localhost")) {
    const left = host.slice(0, -".localhost".length)
    return left || null
  }
  if (host.endsWith(`.${SITES_DOMAIN}`)) {
    const left = host.slice(0, -(SITES_DOMAIN.length + 1))
    if (left === "www") return null
    return left || null
  }
  if (host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`) return null
  return null
}

const buildUrl = (base: string, path: string) => (path ? `${base}/${path}` : base)

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  // ✅ استخدم req.headers بدل headers()
  const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || ""
  const host = normalizeHost(forwardedHost)
  const proto =
    req.headers.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https")

  const subdomain = extractSubdomain(host)

  if (!subdomain) {
    // مفيش سب دومين → رجع فاضي/404 حسب ما تحب
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`
    return new NextResponse(emptyXml, {
      status: 404,
      headers: { "Content-Type": "application/xml" },
    })
  }

  await dbConnect()

  const restaurant = (await Restaurant.findOne(
    { subdomain },
    { subdomain: 1, updatedAt: 1 }
  )
    .lean<RestaurantRecord>()
    .catch(() => null)) as RestaurantRecord | null

  if (!restaurant) {
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`
    return new NextResponse(emptyXml, {
      status: 404,
      headers: { "Content-Type": "application/xml" },
    })
  }

  // دعم localhost subdomain بشكل صحيح
  const baseDomain = host.endsWith(".localhost") ? "localhost" : SITES_DOMAIN
  const baseUrl = `${proto}://${subdomain}.${baseDomain}/${LOCALE_SEGMENT}`
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
