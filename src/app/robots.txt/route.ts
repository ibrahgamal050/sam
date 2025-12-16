import { NextResponse } from "next/server"

import { normalizeHost, getRootDomain, resolveRestaurantHost } from "@/lib/host-utils"
import { getRestaurantByHost } from "@/lib/services/restaurant-service"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || ""
  const normalizedHost = normalizeHost(forwardedHost)
  const proto = req.headers.get("x-forwarded-proto") || (normalizedHost.includes("localhost") ? "http" : "https")

  const restaurant = await getRestaurantByHost(normalizedHost)
  const rootDomain = getRootDomain()

  const resolvedHost =
    restaurant && normalizedHost
      ? resolveRestaurantHost(restaurant, forwardedHost || normalizedHost, rootDomain)
      : normalizedHost || "localhost"

  const body = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /.env
Disallow: /.git
Disallow: /.svn
Disallow: /.DS_Store

Sitemap: ${proto}://${resolvedHost}/sitemap.xml
`

  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
