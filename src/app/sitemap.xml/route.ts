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

export const dynamic = "force-dynamic"

export async function GET() {
  await dbConnect()

  const restaurants = await Restaurant.find({}, { subdomain: 1, updatedAt: 1 })
    .lean<RestaurantRecord[]>()
    .catch(() => [])

  const publishedRestaurants = restaurants.filter(
    (r) => typeof r?.subdomain === "string" && r.subdomain.trim().length > 0
  )

  // سايت ماب الصفحات الرئيسية
  const sitemaps = [
    {
      loc: `https://meelza.com/sitemap-root.xml`,
      lastmod: new Date().toISOString(),
    },
    // سايت ماب كل مطعم
    ...publishedRestaurants.map((r) => ({
      loc: `https://${r.subdomain}.${SUBDOMAIN_HOST}/sitemap.xml`,
      lastmod: new Date(r.updatedAt ?? new Date()).toISOString(),
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (s) => `  <sitemap>
    <loc>${s.loc}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  })
}
