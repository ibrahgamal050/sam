import { type NextRequest, NextResponse } from "next/server"
import  dbconnect  from "@/lib/db"
import  Menu  from "@/models/menu"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"
import mongoose from "mongoose"
import type { ICategory } from "@/types/menu"

/**
 * PUT handler to update a category
 */
export async function PUT(request: NextRequest, { params }: { params: { menuId: string; categoryId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { menuId, categoryId } = params

    if (!mongoose.Types.ObjectId.isValid(menuId) || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const categoryData: Partial<ICategory> = await request.json()

    // Validate the category data
    if (categoryData.name && !categoryData.name.en && !categoryData.name.ar) {
      return NextResponse.json({ error: "Category name is required in at least one language" }, { status: 400 })
    }

    await dbconnect()

    // Find the menu and update the specific category
    const menu = await Menu.findById(menuId)

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 })
    }

    const categoryIndex = menu.categories.findIndex((cat: ICategory) => cat._id && cat._id.toString() === categoryId)

    if (categoryIndex === -1) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Update only the fields that were provided
    if (categoryData.name) menu.categories[categoryIndex].name = categoryData.name
    if (categoryData.description) menu.categories[categoryIndex].description = categoryData.description
    if (categoryData.image !== undefined) menu.categories[categoryIndex].image = categoryData.image
    if (categoryData.visible !== undefined) menu.categories[categoryIndex].visible = categoryData.visible

    menu.categories[categoryIndex].updatedAt = new Date()

    await menu.save()

    // Log the action for audit purposes
    logger.info("Category updated", {
      menuId,
      categoryId,
      userId: session.user.id,
    })

    return NextResponse.json(menu.categories[categoryIndex])
  } catch (error: any) {
    logger.error("Error updating category", {
      error: error.message,
      menuId: params.menuId,
      categoryId: params.categoryId,
    })
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

/**
 * DELETE handler to remove a category
 */
export async function DELETE(request: NextRequest, { params }: { params: { menuId: string; categoryId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { menuId, categoryId } = params

    if (!mongoose.Types.ObjectId.isValid(menuId) || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    await  dbconnect()

    // Find the menu and remove the specific category
    const result = await Menu.updateOne({ _id: menuId }, { $pull: { categories: { _id: categoryId } } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 })
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Category not found or already removed" }, { status: 404 })
    }

    // Log the action for audit purposes
    logger.info("Category deleted", {
      menuId,
      categoryId,
      userId: session.user.id,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    logger.error("Error deleting category", {
      error: error.message,
      menuId: params.menuId,
      categoryId: params.categoryId,
    })
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
