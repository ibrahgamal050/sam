import mongoose, { Schema, type Document } from "mongoose"
import type { Types } from "mongoose"

export interface IBranch extends Document {
  restaurantId: Types.ObjectId
  name: string
  address: string
  latitude: number
  longitude: number
  phone: string
  openHours: {
    weekdays: string
    weekends: string
  }
  createdAt: Date
  updatedAt: Date
}

const BranchSchema: Schema = new Schema(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    phone: { type: String },
    openHours: {
      weekdays: { type: String },
      weekends: { type: String },
    },
  },
  { timestamps: true },
)

export default mongoose.models.Branch || mongoose.model<IBranch>("Branch", BranchSchema)
