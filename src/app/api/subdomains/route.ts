// app/api/subdomains/route.ts (أو pages/api/subdomains.ts لو بتستخدم pages router)
import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import Restaurant from "@/models/restaurant"

type DomainAliasDoc = {
  host?: string
  redirectTo?: string
  active?: boolean
}

export async function GET() {
  try {
    await dbConnect()
    const restaurants = await Restaurant.find(
      {},
      { subdomain: 1, canonicalHost: 1, domainAliases: 1 },
    ).lean()

    const domainMap = restaurants.map((restaurant) => ({
      subdomain: restaurant.subdomain,
      canonicalHost: restaurant.canonicalHost ?? null,
      domainAliases: ((restaurant.domainAliases ?? []) as DomainAliasDoc[])
        .filter((alias) => Boolean(alias?.host))
        .map((alias) => ({
          host: alias.host as string,
          redirectTo: alias.redirectTo ?? null,
          active: alias.active ?? false,
        })),
    }))

    return NextResponse.json(domainMap)
  } catch (err) {
    console.error("Failed to fetch subdomains:", err)
    return NextResponse.json([], { status: 500 })
  }
}
