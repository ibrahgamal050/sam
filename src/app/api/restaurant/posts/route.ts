import { NextResponse } from "next/server"

import dbConnect from "@/lib/db"
import { normalizeHost } from "@/lib/host-utils"
import { getRestaurantByHost } from "@/lib/services/restaurant-service"
import Post from "@/models/post"

export async function GET(request: Request) {
  try {
    const hostname = normalizeHost(request.headers.get("host"))

    if (!hostname) {
      return NextResponse.json({ error: "Host header is required" }, { status: 400 })
    }

    const restaurant = await getRestaurantByHost(hostname)

    if (!restaurant?._id) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    await dbConnect()

    const posts = await Post.find({ restaurantId: restaurant._id }).sort({ createdAt: -1 }).lean()

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}
