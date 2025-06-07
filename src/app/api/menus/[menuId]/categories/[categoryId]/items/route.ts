import { type NextRequest, NextResponse } from "next/server"
import dbconnect from "@/lib/db"
import  Menu  from "@/models/menu"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"
import mongoose from "mongoose"
import type { IMenuItem } from "@/types/menu"

/**
 * POST handler to add a new item to a category
 */
export async function POST(request: NextRequest, { params }: { params: { menuId: string; categoryId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { menuId, categoryId } = params

    if (!mongoose.Types.ObjectId.isValid(menuId) || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const itemData: Partial<IMenuItem> = await request.json()

    // Validate the item data
    if (!itemData.name || (!itemData.name.en && !itemData.name.ar)) {
      return NextResponse.json({ error: "Item name is required in at least one language" }, { status: 400 })
    }

    await dbconnect()

    // Find the menu
    const menu = await Menu.findById(menuId)

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 })
    }

    // Find the category
    const categoryIndex = menu.categories.findIndex((cat: any) => cat._id && cat._id.toString() === categoryId)

    if (categoryIndex === -1) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Create a new item with a MongoDB ObjectId
    const newItem: IMenuItem = {
      _id: new mongoose.Types.ObjectId(),
      name: itemData.name,
      description: itemData.description || { en: "", ar: "" },
      price: itemData.price || 0,
      image: itemData.image || "",
      sizes: itemData.sizes || [],
      visible: itemData.visible !== undefined ? itemData.visible : true,
    }

    // Add the item to the category
    menu.categories[categoryIndex].menuItems.push(newItem)
    await menu.save()

    // Log the action for audit purposes
    logger.info("Item added to category", {
      menuId,
      categoryId,
      itemId: newItem._id,
      userId: session.user.id,
    })

    return NextResponse.json(newItem, { status: 201 })
  } catch (error: any) {
    logger.error("Error adding item", {
      error: error.message,
      menuId: params.menuId,
      categoryId: params.categoryId,
    })
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 })
  }
}
