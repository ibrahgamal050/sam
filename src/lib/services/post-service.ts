import mongoose from "mongoose"

import dbConnect from "@/lib/db"
import Post from "@/models/post"

export type PostSummary = {
  _id: string
  title: string
  content: string
  image: string
  createdAt: string
  updatedAt: string
}

const toPostSummary = (doc: any): PostSummary => ({
  _id: doc._id.toString(),
  title: doc.title,
  content: doc.content,
  image: doc.image,
  createdAt: new Date(doc.createdAt).toISOString(),
  updatedAt: new Date(doc.updatedAt).toISOString(),
})

export async function getPostsByRestaurantId(restaurantId: string): Promise<PostSummary[]> {
  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    return []
  }

  await dbConnect()

  const posts = await Post.find({ restaurantId: new mongoose.Types.ObjectId(restaurantId) })
    .sort({ createdAt: -1 })
    .lean()

  return posts.map(toPostSummary)
}
