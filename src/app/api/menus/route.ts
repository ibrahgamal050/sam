import { type NextRequest, NextResponse } from "next/server"
import dbconnect from "@/lib/db"
import  Menu  from "@/models/menu"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"
import type { IMenu } from "@/types/menu"

/**
 * GET handler to fetch all menus for the current user's restaurant
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbconnect()

    // Get the restaurant ID from the session or query parameter
    const restaurantId = session.user.restaurantId

    const menus = await Menu.find({ restaurantId })
      .select("_id name updatedAt") // Only fetch necessary fields for listing
      .sort({ updatedAt: -1 })

    return NextResponse.json(menus)
  } catch (error: any) {
    logger.error("Error fetching menus", { error: error.message })
    return NextResponse.json({ error: "Failed to fetch menus" }, { status: 500 })
  }
}

/**
 * POST handler to create a new menu
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const menuData: Partial<IMenu> = await request.json()

    // Validate the menu data
    if (!menuData.name) {
      return NextResponse.json({ error: "Menu name is required" }, { status: 400 })
    }

    await dbconnect()

    // Create a new menu with default values
    const newMenu = new Menu({
      name: menuData.name,
      restaurantId: session.user.restaurantId,
      currency: menuData.currency || { en: "$", ar: "$" },
      categories: menuData.categories || [],
      menuImages: menuData.menuImages || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await newMenu.save()

    // Log the action for audit purposes
    logger.info("Menu created", {
      menuId: newMenu._id,
      userId: session.user.id,
      menuName: menuData.name,
    })

    return NextResponse.json(newMenu, { status: 201 })
  } catch (error: any) {
    logger.error("Error creating menu", { error: error.message })
    return NextResponse.json({ error: "Failed to create menu" }, { status: 500 })
  }
}
