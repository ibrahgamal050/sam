import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import Restaurant from "@/models/restaurant"

type RestaurantRecord = {
  subdomain: string
  updatedAt: Date
}

const SUBDOMAIN_HOST = process.env.NEXT_PUBLIC_SITES_DOMAIN ?? "meelza.com"
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "meelza.com"
const LOCALE_SEGMENT = "ar"
const CHANGE_FREQUENCY = "daily"
const PRIORITY = "0.8"

const STATIC_PATHS = ["", "menu", "branches", "about"]

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;")

const buildUrl = (base: string, path: string) =>
  path ? `${base}/${path}` : base

const buildRestaurantBaseUrl = (subdomain: string) =>
  `https://${subdomain}.${SUBDOMAIN_HOST}/${LOCALE_SEGMENT}`

const buildRootBaseUrl = () => `https://${ROOT_DOMAIN}/${LOCALE_SEGMENT}`

export const dynamic = "force-dynamic"

export async function GET() {
  await dbConnect()

  const restaurants = await Restaurant.find({}, { subdomain: 1, updatedAt: 1 })
    .lean<RestaurantRecord[]>()
    .catch(() => [])
  const publishedRestaurants = restaurants.filter((restaurant) =>
    typeof restaurant?.subdomain === "string" && restaurant.subdomain.trim().length > 0
  )

  const locationEntries = publishedRestaurants.length
    ? publishedRestaurants.flatMap((restaurant) => {
        const updatedAt = new Date(restaurant.updatedAt ?? new Date())
        const baseUrl = buildRestaurantBaseUrl(restaurant.subdomain)

        return STATIC_PATHS.map((path) => ({
          loc: buildUrl(baseUrl, path),
          lastmod: updatedAt.toISOString(),
        }))
      })
    : STATIC_PATHS.map((path) => ({
        loc: buildUrl(buildRootBaseUrl(), path),
        lastmod: new Date().toISOString(),
      }))

  const urlSet = locationEntries
    .map(
      ({ loc, lastmod }) => `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${CHANGE_FREQUENCY}</changefreq>
    <priority>${PRIORITY}</priority>
  </url>`
    )
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlSet}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
}
