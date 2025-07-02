// app/api/subdomains/route.ts (أو pages/api/subdomains.ts لو بتستخدم pages router)
import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import Restaurant from "@/models/restaurant"

export async function GET() {
  try {
    await dbConnect()
    const restaurants = await Restaurant.find({}, { subdomain: 1 })
    const subdomains = restaurants.map((r) => r.subdomain)
    return NextResponse.json(subdomains)
  } catch (err) {
    console.error("Failed to fetch subdomains:", err)
    return NextResponse.json([], { status: 500 })
  }
}
