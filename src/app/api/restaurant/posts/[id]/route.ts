import mongoose from "mongoose"
import { NextResponse } from "next/server"

import dbConnect from "@/lib/db"
import { normalizeHost } from "@/lib/host-utils"
import { getRestaurantByHost } from "@/lib/services/restaurant-service"
import Post from "@/models/post"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const hostname = normalizeHost(request.headers.get("host"))

    if (!hostname) {
      return NextResponse.json({ error: "Host header is required" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid post id" }, { status: 400 })
    }

    const restaurant = await getRestaurantByHost(hostname)

    if (!restaurant?._id) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    await dbConnect()

    const post = await Post.findOne({
      _id: new mongoose.Types.ObjectId(params.id),
      restaurantId: restaurant._id,
    }).lean()

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 })
  }
}
