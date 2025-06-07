import type { IMenu, ICategory, IMenuItem, IMenuImage } from "@/types/menu"

/**
 * Service class for interacting with the menu API
 * This provides a clean interface for components to use
 */
export class MenuService {
  /**
   * Fetch a menu by ID
   */
  static async getMenu(menuId: string): Promise<IMenu> {
    const response = await fetch(`/api/menus/${menuId}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to fetch menu")
    }

    return response.json()
  }

  /**
   * Save the entire menu (used by the MenuEditor component)
   */
  static async saveMenu(menu: IMenu): Promise<IMenu> {
    const response = await fetch(`/api/menus/${menu._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(menu),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to save menu")
    }

    return response.json()
  }

  /**
   * Add a new category to a menu
   */
  static async addCategory(menuId: string, category: Partial<ICategory>): Promise<ICategory> {
    const response = await fetch(`/api/menus/${menuId}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(category),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to add category")
    }

    return response.json()
  }

  /**
   * Update a category
   */
  static async updateCategory(menuId: string, categoryId: string, category: Partial<ICategory>): Promise<ICategory> {
    const response = await fetch(`/api/menus/${menuId}/categories/${categoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(category),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to update category")
    }

    return response.json()
  }

  /**
   * Delete a category
   */
  static async deleteCategory(menuId: string, categoryId: string): Promise<void> {
    const response = await fetch(`/api/menus/${menuId}/categories/${categoryId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to delete category")
    }
  }

  /**
   * Add a new item to a category
   */
  static async addMenuItem(menuId: string, categoryId: string, item: Partial<IMenuItem>): Promise<IMenuItem> {
    const response = await fetch(`/api/menus/${menuId}/categories/${categoryId}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to add item")
    }

    return response.json()
  }

  /**
   * Update a menu item
   */
  static async updateMenuItem(
    menuId: string,
    categoryId: string,
    itemId: string,
    item: Partial<IMenuItem>,
  ): Promise<IMenuItem> {
    const response = await fetch(`/api/menus/${menuId}/categories/${categoryId}/items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to update item")
    }

    return response.json()
  }

  /**
   * Delete a menu item
   */
  static async deleteMenuItem(menuId: string, categoryId: string, itemId: string): Promise<void> {
    const response = await fetch(`/api/menus/${menuId}/categories/${categoryId}/items/${itemId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to delete item")
    }
  }

  /**
   * Add a new image to a menu
   */
  static async addMenuImage(menuId: string, image: Partial<IMenuImage>): Promise<IMenuImage> {
    const response = await fetch(`/api/menus/${menuId}/images`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(image),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to add image")
    }

    return response.json()
  }

  /**
   * Delete a menu image
   */
  static async deleteMenuImage(menuId: string, imageId: string): Promise<void> {
    const response = await fetch(`/api/menus/${menuId}/images/${imageId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to delete image")
    }
  }
}
