import mongoose, { Schema, model, type Model } from "mongoose"
import type { IMenuImage } from "@/types/menu"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }
  cached.conn = await cached.promise
  return cached.conn
}

// Define the MenuImage schema
const MenuImageSchema = new Schema<IMenuImage>(
  {
    url: { type: String, required: true },
    altText: { type: String, required: true },
    subdomain: { type: String, default: "default" },
    originalName: String,
    fileSize: Number,
    width: Number,
    height: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  },
)

// Get the MenuImage model (creating it if it doesn't exist)
export const MenuImage: Model<IMenuImage> = mongoose.models.MenuImage || model<IMenuImage>("MenuImage", MenuImageSchema)

// Image CRUD functions
export async function saveMenuImage(image: Omit<IMenuImage, "_id">) {
  await dbConnect()
  const menuImage = new MenuImage(image)
  await menuImage.save()
  return menuImage
}

export async function getMenuImages(restaurantId: string) {
  await dbConnect()
  return MenuImage.find({ restaurantId }).sort({ createdAt: -1 }).exec()
}

export async function updateMenuImage(imageId: string, updates: Partial<IMenuImage>) {
  await dbConnect()
  return MenuImage.findByIdAndUpdate(
    imageId,
    { ...updates, updatedAt: new Date() },
    { new: true }, // Return the updated document
  ).exec()
}

export async function deleteMenuImage(imageId: string) {
  await dbConnect()
  return MenuImage.findByIdAndDelete(imageId).exec()
}

export default dbConnect
