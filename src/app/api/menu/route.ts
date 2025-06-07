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

// Transform menu data to a format suitable for the frontend
function transformMenuData(menu: any) {
  if (!menu) return null
  
  // Create a flattened array of menu items with category information
  const menuItems = menu.categories.flatMap((category: any) => {
    return category.menuItems.map((item: any) => ({
      _id: item._id.toString(),
      name: item.name.en || item.name.ar || "Unnamed Item",
      description: item.description?.en || item.description?.ar || "",
      price: item.price || 0,
      image: item.image,
      category: category.name.en || category.name.ar,
      categoryId: category._id.toString(),
      available: true, // You may want to add an 'available' field to your schema
      sizes: item.sizes?.map((size: any) => ({
        name: size.name.en || size.name.ar,
        price: size.price
      })) || []
    }))
  })
  
  return menuItems
}

export async function GET(request: Request) {
  try {
    await connectToDatabase()
    
    // Get restaurant ID from query params or use a default for testing
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get("restaurantId")
    
    // Query to find the menu
    const query = restaurantId 
      ? { restaurantId: new mongoose.Types.ObjectId(restaurantId) }
      : {}  // If no ID provided, get the first menu (for testing)
    
    // Find the menu
    const menu = await Menu.findOne(query).lean()
    
    if (!menu) {
      return NextResponse.json(
        { error: "Menu not found" },
        { status: 404 }
      )
    }
    
    // Transform the data for frontend use
    const menuItems = transformMenuData(menu)
    
    return NextResponse.json(menuItems)
  } catch (error: any) {
    console.error("Error fetching menu:", error)
    
    return NextResponse.json(
      { error: error.message || "Failed to fetch menu" },
      { status: 500 }
    )
  }
}
