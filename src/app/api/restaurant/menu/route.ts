import { NextResponse } from "next/server"
import mongoose from "mongoose"
import Menu from "@/models/menu" // Assuming your Menu model is exported from this path

// Connect to MongoDB
async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState >= 1) {
      return
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MongoDB URI is not defined")
    }

    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw new Error("Database connection failed")
  }
}

export async function GET(request: Request) {
  try {
    await connectToDatabase()

    // Get restaurant ID from query params or use a default for testing
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get("restaurantId")

    // Query to find the menu
    const query = restaurantId ? { restaurantId: new mongoose.Types.ObjectId(restaurantId) } : {} // If no ID provided, get the first menu (for testing)

    // Find the menu
    const menu = await Menu.findOne(query).lean()

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 })
    }

    // Convert MongoDB ObjectIds to strings for JSON serialization
    const serializedMenu = JSON.parse(
      JSON.stringify(menu, (key, value) => {
        if (key === "_id" || key === "restaurantId") {
          return value.toString()
        }
        return value
      }),
    )

    return NextResponse.json(serializedMenu)
  } catch (error: any) {
    console.error("Error fetching menu:", error)

    return NextResponse.json({ error: error.message || "Failed to fetch menu" }, { status: 500 })
  }
}
