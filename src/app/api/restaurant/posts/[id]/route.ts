import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Restaurant from "@//models/restaurant"
import Post from "@/models/post"

export async function GET(request: Request, { params }: { params: { slug: string; id: string } }) {
  try {
    await dbConnect()

    const { slug, id } = params

    // Find restaurant by slug
    const restaurant = await Restaurant.findOne({ slug })

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    // Query post by id and restaurant
    const post = await Post.findOne({
      _id: id,
      restaurantId: restaurant._id,
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 })
  }
}
