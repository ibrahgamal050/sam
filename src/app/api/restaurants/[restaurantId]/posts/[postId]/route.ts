import mongoose from "mongoose"
import { NextResponse } from "next/server"

import dbConnect from "@/lib/db"
import Post from "@/models/post"
import Restaurant from "@/models/restaurant"

const toSerializable = (doc: any) => ({
  _id: doc._id.toString(),
  title: doc.title,
  content: doc.content,
  image: doc.image,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
})

export async function PATCH(
  request: Request,
  { params }: { params: { restaurantId: string; postId: string } },
) {
  try {
    const { restaurantId, postId } = params

    if (!mongoose.Types.ObjectId.isValid(restaurantId) || !mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid identifier" }, { status: 400 })
    }

    await dbConnect()

    const restaurant = await Restaurant.findById(restaurantId)

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    const body = await request.json()
    const payload: Partial<{ title: string; content: string; image: string }> = {}

    if (typeof body?.title === "string") {
      payload.title = body.title.trim()
    }
    if (typeof body?.content === "string") {
      payload.content = body.content
    }
    if (typeof body?.image === "string") {
      payload.image = body.image.trim()
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 })
    }

    const updated = await Post.findOneAndUpdate(
      { _id: postId, restaurantId: restaurant._id },
      { $set: payload },
      { new: true },
    ).lean()

    if (!updated) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json(toSerializable(updated))
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { restaurantId: string; postId: string } },
) {
  try {
    const { restaurantId, postId } = params

    if (!mongoose.Types.ObjectId.isValid(restaurantId) || !mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid identifier" }, { status: 400 })
    }

    await dbConnect()

    const restaurant = await Restaurant.findById(restaurantId)

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    const deleted = await Post.findOneAndDelete({ _id: postId, restaurantId: restaurant._id }).lean()

    if (!deleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
