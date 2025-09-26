import mongoose from "mongoose"
import { NextResponse } from "next/server"

import dbConnect from "@/lib/db"
import Restaurant from "@/models/restaurant"
import Post from "@/models/post"

const toSerializable = (doc: any) => ({
  _id: doc._id.toString(),
  title: doc.title,
  content: doc.content,
  image: doc.image,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
})

export async function GET(
  request: Request,
  { params }: { params: { restaurantId: string } },
) {
  try {
    if (!mongoose.Types.ObjectId.isValid(params.restaurantId)) {
      return NextResponse.json({ error: "Invalid restaurant id" }, { status: 400 })
    }

    await dbConnect()

    const posts = await Post.find({ restaurantId: new mongoose.Types.ObjectId(params.restaurantId) })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(posts.map(toSerializable))
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { restaurantId: string } },
) {
  try {
    if (!mongoose.Types.ObjectId.isValid(params.restaurantId)) {
      return NextResponse.json({ error: "Invalid restaurant id" }, { status: 400 })
    }

    await dbConnect()

    const restaurant = await Restaurant.findById(params.restaurantId)

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    const body = await request.json()
    const { title, content, image } = body ?? {}

    if (!title || !content || !image) {
      return NextResponse.json(
        { error: "title, content, and image are required" },
        { status: 400 },
      )
    }

    const post = await Post.create({
      restaurantId: restaurant._id,
      title,
      content,
      image,
    })

    return NextResponse.json(toSerializable(post.toObject()), { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
