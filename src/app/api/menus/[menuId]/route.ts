import { type NextRequest, NextResponse } from "next/server"
import dbonnect from "@/lib/db"
import Menu  from "@/models/menu"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"
import mongoose from "mongoose"
import type { IMenu } from "@/types/menu"

/**
 * GET handler to fetch a specific menu by ID
 */
export async function GET(request: NextRequest, { params }: { params: { menuId: string } }) {
  try {
    const { menuId } = params

    if (!mongoose.Types.ObjectId.isValid(menuId)) {
      return NextResponse.json({ error: "Invalid menu ID format" }, { status: 400 })
    }

    await dbonnect()

    const menu = await Menu.findById(menuId)

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 })
    }

    return NextResponse.json(menu)
  } catch (error: any) {
    logger.error("Error fetching menu", { error: error.message, menuId: params.menuId })
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 })
  }
}

/**
 * PUT handler to update a menu
 * This is the main endpoint that saves all changes from the menu editor
 */
export async function PUT(request: NextRequest, { params }: { params: { menuId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { menuId } = params

    if (!mongoose.Types.ObjectId.isValid(menuId)) {
      return NextResponse.json({ error: "Invalid menu ID format" }, { status: 400 })
    }

    const menuData: IMenu = await request.json()

    // Validate the menu data
    if (!menuData.categories) {
      return NextResponse.json({ error: "Menu data is invalid" }, { status: 400 })
    }

    await dbonnect()

    // Find the menu first to check if it exists and if the user has access
    const existingMenu = await Menu.findById(menuId)

    if (!existingMenu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 })
    }

    // Optional: Check if the user has permission to edit this menu
    // if (existingMenu.restaurantId.toString() !== session.user.restaurantId) {
    //   return NextResponse.json({ error: "Unauthorized to edit this menu" }, { status: 403 })
    // }

    // Update the menu with the new data
    // We're using findByIdAndUpdate to ensure atomicity
    const updatedMenu = await Menu.findByIdAndUpdate(
      menuId,
      {
        $set: {
          categories: menuData.categories,
          menuImages: menuData.menuImages,
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    )

    // Log the action for audit purposes
    logger.info("Menu updated", {
      menuId,
      userId: session.user.id,
      categoriesCount: menuData.categories.length,
      imagesCount: menuData.menuImages?.length || 0,
    })

    // Revalidate the menu page to update any cached data
    revalidatePath(`/menus/${menuId}`)

    return NextResponse.json(updatedMenu)
  } catch (error: any) {
    logger.error("Error updating menu", { error: error.message, menuId: params.menuId })
    return NextResponse.json({ error: "Failed to update menu" }, { status: 500 })
  }
}

/**
 * DELETE handler to delete a menu
 */
export async function DELETE(request: NextRequest, { params }: { params: { menuId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { menuId } = params

    if (!mongoose.Types.ObjectId.isValid(menuId)) {
      return NextResponse.json({ error: "Invalid menu ID format" }, { status: 400 })
    }

    await dbonnect()

    // Find the menu first to check if it exists and if the user has access
    const existingMenu = await Menu.findById(menuId)

    if (!existingMenu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 })
    }

    // Optional: Check if the user has permission to delete this menu
    // if (existingMenu.restaurantId.toString() !== session.user.restaurantId) {
    //   return NextResponse.json({ error: "Unauthorized to delete this menu" }, { status: 403 })
    // }

    await Menu.findByIdAndDelete(menuId)

    // Log the action for audit purposes
    logger.info("Menu deleted", {
      menuId,
      userId: session.user.id,
    })

    // Revalidate the menus list page
    revalidatePath("/menus")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    logger.error("Error deleting menu", { error: error.message, menuId: params.menuId })
    return NextResponse.json({ error: "Failed to delete menu" }, { status: 500 })
  }
}
