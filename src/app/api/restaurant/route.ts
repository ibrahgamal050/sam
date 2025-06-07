import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Restaurant from "@/models/restaurant"

export async function GET(request: Request) {
  try {
    await dbConnect()
    
    // Get hostname and extract subdomain
    const hostname = request.headers.get("host") || ""
    let subdomain
    
    if (process.env.NODE_ENV === "development") {
      // For localhost:3000 or similar
      subdomain = hostname.includes("localhost") 
        ? hostname.split(".")[0] 
        : hostname.split(".")[0]
    } else {
      // For production: tenant.yourdomain.com
      const parts = hostname.split(".")
      subdomain = parts.length >= 3 ? parts[0] : null
    }
    
    console.log("Extracted subdomain:", subdomain)  // Debug log

    // If no subdomain was found, return an error
    if (!subdomain) {
      return NextResponse.json(
        { error: "No subdomain provided" }, 
        { status: 400 }
      )
    }
    
    // Find restaurant by subdomain
    const restaurant = await Restaurant.findOne({ subdomain })

    if (!restaurant) {
      return NextResponse.json(
        { error: `Restaurant not found for subdomain: ${subdomain}` }, 
        { status: 404 }
      )
    }

    return NextResponse.json(restaurant)
  } catch (error) {
    console.error("Error fetching restaurant:", error)
    return NextResponse.json(
      { error: "Failed to fetch restaurant" }, 
      { status: 500 }
    )
  }
}
