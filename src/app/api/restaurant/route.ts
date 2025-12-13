// src/app/api/restaurant/route.ts
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { normalizeHost } from "@/lib/host-utils"
import { getRestaurantBySubdomain, getRestaurantByAlias } from "@/lib/services/restaurant-service"

export const dynamic = "force-dynamic"

async function resolveHost(): Promise<string | null> {
  const h = await headers()
  return h.get("x-forwarded-host") || h.get("x-vercel-deployment-url") || h.get("host")
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const subFromQuery = url.searchParams.get("subdomain")
    const h = await headers()
    const subFromHeader = h.get("x-meelza-subdomain")
    const rawHost = await resolveHost()

    if (!rawHost && !subFromQuery && !subFromHeader) {
      return NextResponse.json({ code: "MISSING_HOST", message: "Host header is required" }, { status: 400 })
    }

    // 1) أولوية للـ override (Query ثم Header)
    let sub = subFromQuery || subFromHeader || ""

    // 2) لو فاضي: استخرجه من الـ Host
    if (!sub && rawHost) {
      sub = normalizeHost(rawHost) // sub.domain.tld -> sub | "" لو custom domain
    }

    let restaurant = null

    if (sub) {
      // ابحث بالـ subdomain (نموذجك الأساسي)
      restaurant = await getRestaurantBySubdomain(sub)
    } else if (rawHost) {
      // دومين مخصص بدون subdomain -> استخدم alias mapping
      // مثال: example.com -> ابحث في جدول aliases
      const hostname = rawHost.toLowerCase().split(":")[0]
      restaurant = await getRestaurantByAlias(hostname)
    }

    if (!restaurant) {
      return NextResponse.json(
        { code: "RESTAURANT_NOT_FOUND", message: `Restaurant not found (subdomain: "${sub || "-"}")` },
        { status: 404 }
      )
    }

    return NextResponse.json(restaurant)
  } catch (error) {
    console.error("Error fetching restaurant:", error)
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Failed to fetch restaurant" }, { status: 500 })
  }
}
