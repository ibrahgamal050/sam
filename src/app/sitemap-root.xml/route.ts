import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import Restaurant from "@/models/restaurant"

type RestaurantRecord = {
  subdomain: string
  updatedAt: Date
  _id: string
}

const SUBDOMAIN_HOST = process.env.NEXT_PUBLIC_SITES_DOMAIN ?? "meelza.com"
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "meelza.com"
const LOCALE_SEGMENT = "ar"

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;")

const buildRestaurantSitemapUrl = (subdomain: string) =>
  `https://${subdomain}.${SUBDOMAIN_HOST}/sitemap.xml`

const buildRootSitemapUrl = () => `https://${ROOT_DOMAIN}/sitemap.xml`

export const dynamic = "force-dynamic"

export async function GET() {
  await dbConnect()

  const restaurants = await Restaurant.find({}, { subdomain: 1, updatedAt: 1, _id: 1 })
    .lean<RestaurantRecord[]>()
    .catch(() => [])
  const publishedRestaurants = restaurants.filter((restaurant) =>
    typeof restaurant?.subdomain === "string" && restaurant.subdomain.trim().length > 0
  )

  const sitemaps = publishedRestaurants.length
    ? publishedRestaurants.map((restaurant) => ({
        loc: buildRestaurantSitemapUrl(restaurant.subdomain),
        lastmod: new Date(restaurant.updatedAt ?? new Date()).toISOString(),
      }))
    : [
        {
          loc: buildRootSitemapUrl(),
          lastmod: new Date().toISOString(),
        },
      ]

  const indexXml = sitemaps
    .map(
      ({ loc, lastmod }) => `  <sitemap>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`
    )
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexXml}
</sitemapindex>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
}
