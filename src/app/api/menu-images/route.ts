import { type NextRequest, NextResponse } from "next/server"
import { saveMenuImage, getMenuImages, updateMenuImage, deleteMenuImage } from "@/lib/db"
import { Types } from "mongoose"

// Get all menu images for a restaurant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get("restaurantId")

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 })
    }

    const images = await getMenuImages(restaurantId)
    return NextResponse.json({ images })
  } catch (error) {
    console.error("Error fetching menu images:", error)
    return NextResponse.json({ error: "Error fetching menu images" }, { status: 500 })
  }
}

// Create a new menu image record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, altText, restaurantId, subdomain } = body

    if (!url || !altText || !restaurantId) {
      return NextResponse.json({ error: "URL, alt text, and restaurant ID are required" }, { status: 400 })
    }

    const newImage = {
      _id: new Types.ObjectId().toString(),
      url,
      altText,
      restaurantId,
      subdomain: subdomain || "default",
      createdAt: new Date(),
    }

    const savedImage = await saveMenuImage(newImage)
    return NextResponse.json({ image: savedImage })
  } catch (error) {
    console.error("Error creating menu image:", error)
    return NextResponse.json({ error: "Error creating menu image" }, { status: 500 })
  }
}

// Update a menu image
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageId, updates } = body

    if (!imageId) {
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 })
    }

    const updatedImage = await updateMenuImage(imageId, updates)
    return NextResponse.json({ image: updatedImage })
  } catch (error) {
    console.error("Error updating menu image:", error)
    return NextResponse.json({ error: "Error updating menu image" }, { status: 500 })
  }
}

// Delete a menu image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get("imageId")

    if (!imageId) {
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 })
    }

    await deleteMenuImage(imageId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting menu image:", error)
    return NextResponse.json({ error: "Error deleting menu image" }, { status: 500 })
  }
}
