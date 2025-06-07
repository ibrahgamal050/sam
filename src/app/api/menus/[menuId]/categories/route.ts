import { type NextRequest, NextResponse } from "next/server"
import dbconnect from "@/lib/db"
import Menu  from "@/models/menu"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"
import mongoose from "mongoose"
import type { ICategory } from "@/types/menu"

/**
 * POST handler to add a new category to a menu
 */
export async function POST(request: NextRequest, { params }: { params: { menuId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { menuId } = params

    if (!mongoose.Types.ObjectId.isValid(menuId)) {
      return NextResponse.json({ error: "Invalid menu ID format" }, { status: 400 })
    }

    const categoryData: Partial<ICategory> = await request.json()

    // Validate the category data
    if (!categoryData.name || (!categoryData.name.en && !categoryData.name.ar)) {
      return NextResponse.json({ error: "Category name is required in at least one language" }, { status: 400 })
    }

    await dbconnect()

    // Find the menu first to check if it exists and if the user has access
    const existingMenu = await Menu.findById(menuId)

    if (!existingMenu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 })
    }

    // Create a new category with a MongoDB ObjectId
    const newCategory: ICategory = {
      _id: new mongoose.Types.ObjectId(),
      name: categoryData.name,
      description: categoryData.description || { en: "", ar: "" },
      image: categoryData.image || "",
      menuItems: [],
      visible: categoryData.visible !== undefined ? categoryData.visible : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Add the category to the menu
    existingMenu.categories.push(newCategory)
    await existingMenu.save()

    // Log the action for audit purposes
    logger.info("Category added to menu", {
      menuId,
      categoryId: newCategory._id,
      userId: session.user.id,
    })

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error: any) {
    logger.error("Error adding category", { error: error.message, menuId: params.menuId })
    return NextResponse.json({ error: "Failed to add category" }, { status: 500 })
  }
}
