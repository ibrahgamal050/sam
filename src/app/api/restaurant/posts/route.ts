import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Restaurant from "@/models/restaurant"
import Post from "@/models/post"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    await dbConnect()

    const { slug } = params

    // Find restaurant by slug
    const restaurant = await Restaurant.findOne({ slug })

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    // Query posts for this restaurant
    const posts = await Post.find({ restaurantId: restaurant._id }).sort({ createdAt: -1 })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}
