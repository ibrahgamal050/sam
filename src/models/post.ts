import mongoose, { Schema, type Document } from "mongoose"
import type { Types } from "mongoose"

export interface IPost extends Document {
  restaurantId: Types.ObjectId
  title: string
  content: string
  image: string
  createdAt: Date
  updatedAt: Date
}

const PostSchema: Schema = new Schema(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true },
)

export default mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema)
