import mongoose from "mongoose"
import { ICategory, IMenuItem } from "@/types/menu"
import Menu from "@/models/menu"

import connectToDatabase from "@/lib/db"
import type { Menu as MenuType, MenuCategory as MenuCategoryType, MenuItem as MenuItemType } from "@/lib/types"

// Helper function to convert Mongoose document to plain object
function convertToPlainObject<T>(doc: T): any {
  return JSON.parse(JSON.stringify(doc))
}

// Helper function to get localized text with priority: ru -> ar -> en -> fallback
function getLocalizedText(textObj: any, fallback: string = ""): string {
  if (!textObj) return fallback
  if (typeof textObj === "string") return textObj
  
  // Priority: Russian -> Arabic -> English -> any other key -> fallback
  return textObj.ru || textObj.ar || textObj.en || Object.values(textObj)[0] || fallback
}

export interface MenuItemSummary {
  _id?: string
  id?: string
  categoryId?: string
  name?: string
  description?: string
  price?: number
  image?: string
  tags?: string[]
  isAvailable?: boolean
  position?: number
  badge?: string
}

export const flattenMenuItems = (menu: MenuType | null): MenuItemSummary[] => {
  if (!menu) return []
  const items: MenuItemSummary[] = []
  menu.categories?.forEach((cat: any) => {
    const catId = cat._id?.toString?.() ?? cat.id
    const catKey = cat.slug ?? cat.key ?? (typeof cat.name === "string" ? cat.name : undefined)
    cat.menuItems?.forEach((item: any) => {
      items.push({
        _id: item._id?.toString?.(),
        id: item.id,
        categoryId: catId,
        categoryKey: catKey,
        // Get name with Russian priority
        name: getLocalizedText(item.name, "Без названия"),
        // Get description with Russian priority
        description: getLocalizedText(item.description, ""),
        price: item.price,
        image: item.image,
        tags: item.tags ?? [],
        isAvailable: item.isAvailable,
        position: item.position ?? item.order ?? 0,
        badge: item.badge,
      })
    })
  })
  return items
}

// لو جالك menu عبر API كـ plain object بنفس الهيكل
export const flattenMenuPayload = (menuPayload: any): MenuItemSummary[] => {
  if (!menuPayload) return []
  const categories = (menuPayload.categories as any[]) ?? []
  const items: MenuItemSummary[] = []
  categories.forEach((cat) => {
    const catId = cat._id?.toString?.() ?? cat.id
    const catKey = cat.slug ?? cat.key ?? (typeof cat.name === "string" ? cat.name : undefined)
    ;(cat.menuItems as any[] | undefined)?.forEach((item) => {
      items.push({
        _id: item._id?.toString?.(),
        id: item.id,
        categoryId: catId,
        categoryKey: catKey,
        // Get name with Russian priority
        name: getLocalizedText(item.name, "Без названия"),
        // Get description with Russian priority
        description: getLocalizedText(item.description, ""),
        price: item.price,
        image: item.image,
        tags: item.tags ?? [],
        isAvailable: item.isAvailable,
        position: item.position ?? item.order ?? 0,
        badge: item.badge,
      })
    })
  })
  return items
}

// New function to get menu with Russian localization
export async function getMenuByRestaurantIdWithRussian(restaurantId: string): Promise<MenuType | null> {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return null
    }

    const menu = await Menu.findOne({ restaurantId: new mongoose.Types.ObjectId(restaurantId) })
    if (!menu) return null

    const plainMenu = convertToPlainObject(menu)
    
    // Transform categories to use Russian names and descriptions
    if (plainMenu.categories) {
      plainMenu.categories = plainMenu.categories.map((category: any) => ({
        ...category,
        // Transform category name
        name: typeof category.name === "object" 
          ? getLocalizedText(category.name, "Без категории")
          : category.name,
        // Transform category description
        description: typeof category.description === "object"
          ? getLocalizedText(category.description, "")
          : category.description,
        // Transform menu items
        menuItems: category.menuItems?.map((item: any) => ({
          ...item,
          name: typeof item.name === "object"
            ? getLocalizedText(item.name, "Без названия")
            : item.name,
          description: typeof item.description === "object"
            ? getLocalizedText(item.description, "")
            : item.description,
          // Transform size names if they exist
          sizes: item.sizes?.map((size: any) => ({
            ...size,
            name: typeof size.name === "object"
              ? getLocalizedText(size.name, "Порция")
              : size.name
          })) || []
        }))
      }))
    }

    return plainMenu
  } catch (error) {
    console.error(`Error fetching menu for restaurant ${restaurantId}:`, error)
    throw new Error("Failed to fetch menu")
  }
}

// Original function without transformation (kept for backward compatibility)
export async function getMenuByRestaurantId(restaurantId: string): Promise<MenuType | null> {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return null
    }

    const menu = await Menu.findOne({ restaurantId: new mongoose.Types.ObjectId(restaurantId) })
    return menu ? convertToPlainObject(menu) : null
  } catch (error) {
    console.error(`Error fetching menu for restaurant ${restaurantId}:`, error)
    throw new Error("Failed to fetch menu")
  }
}

export async function createMenu(data: Omit<MenuType, "_id" | "createdAt" | "updatedAt">): Promise<MenuType> {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(data.restaurantId)) {
      throw new Error("Invalid restaurant ID")
    }

    // Check if menu already exists for this restaurant
    const existingMenu = await Menu.findOne({ restaurantId: data.restaurantId })
    if (existingMenu) {
      throw new Error("Menu already exists for this restaurant")
    }

    const menu = new Menu({
      ...data,
      restaurantId: new mongoose.Types.ObjectId(data.restaurantId),
    })

    await menu.save()
    return convertToPlainObject(menu)
  } catch (error: any) {
    console.error("Error creating menu:", error)
    throw new Error(error.message || "Failed to create menu")
  }
}

export async function updateMenu(id: string, data: Partial<MenuType>): Promise<MenuType | null> {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null
    }

    const menu = await Menu.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })

    return menu ? convertToPlainObject(menu) : null
  } catch (error) {
    console.error(`Error updating menu with id ${id}:`, error)
    throw new Error("Failed to update menu")
  }
}

// Category operations
export async function addCategory(
  menuId: string,
  categoryData: Omit<MenuCategoryType, "_id" | "createdAt" | "updatedAt" | "menuItems">,
): Promise<MenuCategoryType> {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(menuId)) {
      throw new Error("Invalid menu ID")
    }

    const menu = await Menu.findById(menuId)
    if (!menu) {
      throw new Error("Menu not found")
    }

    // Create new category
    const newCategory: ICategory = {
      ...categoryData,
      menuItems: [],
      order: menu.categories.length, // Set order to the end of the list
    } as any

    // Add category to menu
    menu.categories.push(newCategory)
    await menu.save()

    // Return the newly created category
    const addedCategory = menu.categories[menu.categories.length - 1]
    return convertToPlainObject(addedCategory)
  } catch (error: any) {
    console.error(`Error adding category to menu ${menuId}:`, error)
    throw new Error(error.message || "Failed to add category")
  }
}

export async function updateCategory(
  menuId: string,
  categoryId: string,
  data: Partial<MenuCategoryType>,
): Promise<MenuCategoryType | null> {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(menuId)) {
      return null
    }

    // Find the menu and update the specific category
    const menu = await Menu.findOneAndUpdate(
      { _id: menuId, "categories._id": categoryId },
      {
        $set: Object.entries(data).reduce(
          (acc, [key, value]) => {
            acc[`categories.$.${key}`] = value
            return acc
          },
          {} as Record<string, any>,
        ),
      },
      { new: true },
    )

    if (!menu) {
      return null
    }

    // Find the updated category
    const updatedCategory = menu.categories.find((cat) => cat._id.toString() === categoryId)
    return updatedCategory ? convertToPlainObject(updatedCategory) : null
  } catch (error) {
    console.error(`Error updating category ${categoryId} in menu ${menuId}:`, error)
    throw new Error("Failed to update category")
  }
}

export async function deleteCategory(menuId: string, categoryId: string): Promise<boolean> {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(menuId)) {
      return false
    }

    const result = await Menu.updateOne({ _id: menuId }, { $pull: { categories: { _id: categoryId } } })

    return result.modifiedCount > 0
  } catch (error) {
    console.error(`Error deleting category ${categoryId} from menu ${menuId}:`, error)
    throw new Error("Failed to delete category")
  }
}

// Menu item operations

export async function addMenuItem(
  menuId: string,
  categoryId: string,
  itemData: Omit<MenuItemType, "_id">,
): Promise<MenuItemType> {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(menuId)) {
      throw new Error("Invalid menu ID")
    }

    const menu = await Menu.findById(menuId)
    if (!menu) {
      throw new Error("Menu not found")
    }

    const category = menu.categories.find((cat: ICategory) => cat._id && cat._id.toString() === categoryId)

    if (!category) {
      throw new Error("Category not found")
    }

    // Create new menu item with all required properties from the IMenuItem interface
    const newItem: IMenuItem = {
      name: {
        en: itemData.name?.en || "",
        ar: itemData.name?.ar || "",
        ru: itemData.name?.ru || "", // Add Russian support
      },
      description: itemData.description || { en: "", ar: "", ru: "" },
      price: itemData.price || 0,
      sizes: itemData.sizes || [],
      image: itemData.image || "",
      ...(itemData.visible !== undefined ? { visible: itemData.visible } : {}),
    }

    // Add item to category
    category.menuItems.push(newItem)
    await menu.save()

    // Return the newly created item
    const addedItem = category.menuItems[category.menuItems.length - 1]
    return convertToPlainObject(addedItem)
  } catch (error: any) {
    console.error(`Error adding item to category ${categoryId} in menu ${menuId}:`, error)
    throw new Error(error.message || "Failed to add menu item")
  }
}

export async function updateMenuItem(
  menuId: string,
  categoryId: string,
  itemId: string,
  data: Partial<MenuItemType>,
): Promise<MenuItemType | null> {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(menuId)) {
      return null
    }

    // Create update object with dot notation for nested fields
    const updateObj = Object.entries(data).reduce(
      (acc, [key, value]) => {
        acc[`categories.$[category].menuItems.$[item].${key}`] = value
        return acc
      },
      {} as Record<string, any>,
    )

    // Find the menu and update the specific item
    const menu = await Menu.findOneAndUpdate(
      { _id: menuId },
      { $set: updateObj },
      {
        arrayFilters: [{ "category._id": categoryId }, { "item._id": itemId }],
        new: true,
      },
    )

    if (!menu) {
      return null
    }

    // Find the updated category and item
    const category = menu.categories.find((cat) => cat._id.toString() === categoryId)
    if (!category) return null

    const item = category.menuItems.find((item) => item._id.toString() === itemId)
    return item ? convertToPlainObject(item) : null
  } catch (error) {
    console.error(`Error updating item ${itemId} in category ${categoryId}:`, error)
    throw new Error("Failed to update menu item")
  }
}

export async function deleteMenuItem(menuId: string, categoryId: string, itemId: string): Promise<boolean> {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(menuId)) {
      return false
    }

    const result = await Menu.updateOne(
      { _id: menuId, "categories._id": categoryId },
      { $pull: { "categories.$.menuItems": { _id: itemId } } },
    )

    return result.modifiedCount > 0
  } catch (error) {
    console.error(`Error deleting item ${itemId} from category ${categoryId}:`, error)
    throw new Error("Failed to delete menu item")
  }
}

// Advanced queries and aggregations
export async function getPopularMenuItems(restaurantId: string, limit = 10): Promise<any[]> {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return []
    }

    const menu = await Menu.findOne({ restaurantId: new mongoose.Types.ObjectId(restaurantId) })
    if (!menu) return []

    // Flatten all menu items from all categories
    const allItems: any[] = []
    menu.categories.forEach((category) => {
      category.menuItems.forEach((item) => {
        allItems.push({
          _id: item._id,
          name: getLocalizedText(item.name), // Use Russian name
          price: item.price,
          image: item.image,
          category: getLocalizedText(category.name), // Use Russian category name
          orderCount: Math.floor(Math.random() * 100), // Simulated order count
        })
      })
    })

    // Sort by our simulated order count
    allItems.sort((a, b) => b.orderCount - a.orderCount)

    // Return the top items
    return allItems.slice(0, limit)
  } catch (error) {
    console.error(`Error getting popular menu items for restaurant ${restaurantId}:`, error)
    throw new Error("Failed to get popular menu items")
  }
}

export async function getMenuItemsByPriceRange(
  restaurantId: string,
  minPrice: number,
  maxPrice: number,
): Promise<any[]> {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return []
    }

    const result = await Menu.aggregate([
      { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
      { $unwind: "$categories" },
      { $unwind: "$categories.menuItems" },
      {
        $match: {
          "categories.menuItems.price": { $gte: minPrice, $lte: maxPrice },
          "categories.menuItems.sizes": { $eq: null }, // Only include items without size variations
        },
      },
      {
        $project: {
          _id: "$categories.menuItems._id",
          name: "$categories.menuItems.name.ru", // Get Russian name
          price: "$categories.menuItems.price",
          image: "$categories.menuItems.image",
          category: "$categories.name.ru", // Get Russian category name
        },
      },
      { $sort: { price: 1 } },
    ])

    return result
  } catch (error) {
    console.error(`Error getting menu items by price range for restaurant ${restaurantId}:`, error)
    throw new Error("Failed to get menu items by price range")
  }
}