import { type NextRequest, NextResponse } from "next/server"
import dbconnect  from "@/lib/db"
import  Menu  from "@/models/menu"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"
import mongoose from "mongoose"
import type { IMenuItem } from "@/types/menu"

/**
 * PUT handler to update a menu item
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { menuId: string; categoryId: string; itemId: string } },
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { menuId, categoryId, itemId } = params

    if (
      !mongoose.Types.ObjectId.isValid(menuId) ||
      !mongoose.Types.ObjectId.isValid(categoryId) ||
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const itemData: Partial<IMenuItem> = await request.json()

    // Validate the item data
    if (itemData.name && !itemData.name.en && !itemData.name.ar) {
      return NextResponse.json({ error: "Item name is required in at least one language" }, { status: 400 })
    }

    await dbconnect()

    // Find the menu
    const menu = await Menu.findById(menuId)

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 })
    }

    // Find the category
    const category = menu.categories.find((cat: any) => cat._id && cat._id.toString() === categoryId)

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Find the item
    const itemIndex = category.menuItems.findIndex((item: any) => item._id && item._id.toString() === itemId)

    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Update only the fields that were provided
    if (itemData.name) category.menuItems[itemIndex].name = itemData.name
    if (itemData.description) category.menuItems[itemIndex].description = itemData.description
    if (itemData.price !== undefined) category.menuItems[itemIndex].price = itemData.price
    if (itemData.image !== undefined) category.menuItems[itemIndex].image = itemData.image
    if (itemData.sizes) category.menuItems[itemIndex].sizes = itemData.sizes
    if (itemData.visible !== undefined) category.menuItems[itemIndex].visible = itemData.visible

    await menu.save()

    // Log the action for audit purposes
    logger.info("Item updated", {
      menuId,
      categoryId,
      itemId,
      userId: session.user.id,
    })

    return NextResponse.json(category.menuItems[itemIndex])
  } catch (error: any) {
    logger.error("Error updating item", {
      error: error.message,
      menuId: params.menuId,
      categoryId: params.categoryId,
      itemId: params.itemId,
    })
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}

/**
 * DELETE handler to remove a menu item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { menuId: string; categoryId: string; itemId: string } },
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { menuId, categoryId, itemId } = params

    if (
      !mongoose.Types.ObjectId.isValid(menuId) ||
      !mongoose.Types.ObjectId.isValid(categoryId) ||
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    await dbconnect()

    // Find the menu and update the specific category to remove the item
    const result = await Menu.updateOne(
      { _id: menuId, "categories._id": categoryId },
      { $pull: { "categories.$.menuItems": { _id: itemId } } },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Menu or category not found" }, { status: 404 })
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Item not found or already removed" }, { status: 404 })
    }

    // Log the action for audit purposes
    logger.info("Item deleted", {
      menuId,
      categoryId,
      itemId,
      userId: session.user.id,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    logger.error("Error deleting item", {
      error: error.message,
      menuId: params.menuId,
      categoryId: params.categoryId,
      itemId: params.itemId,
    })
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
}
