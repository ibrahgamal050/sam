import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Restaurant from "@/models/restaurant"

export async function GET() {
  try {
    await dbConnect()

    // Fetch all restaurant slugs from the database
    const restaurants = await Restaurant.find({}, { subdomain: 1 })

    // Extract slugs into an array
    const subdomains = restaurants.map((restaurant: any) => restaurant.subdomain)

    return NextResponse.json(subdomains)
  } catch (error) {
    console.error("Error fetching subdomains:", error)
    return NextResponse.json({ error: "Failed to fetch subdomains" }, { status: 500 })
  }
}
