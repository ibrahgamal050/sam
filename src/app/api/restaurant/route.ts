import { NextResponse } from "next/server"
import { normalizeHost } from "@/lib/host-utils"
import { getRestaurantByHost } from "@/lib/services/restaurant-service"

export async function GET(request: Request) {
  try {
    const hostname = normalizeHost(request.headers.get("host"))

    if (!hostname) {
      return NextResponse.json({ error: "Host header is required" }, { status: 400 })
    }

    const restaurant = await getRestaurantByHost(hostname)

    if (!restaurant) {
      return NextResponse.json({ error: `Restaurant not found for host: ${hostname}` }, { status: 404 })
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
