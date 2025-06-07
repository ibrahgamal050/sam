"use client"

import { forwardRef } from "react"
import type { ICategory } from "@/types/menu"

interface CategorySidebarProps {
  categories: (ICategory & { _id: NonNullable<ICategory["_id"]> })[]
  activeCategory: string | null
  scrollToCategory: (categoryId: string) => void
  sidebarBottom: number | null
}

export const CategorySidebar = forwardRef<HTMLDivElement | null, CategorySidebarProps>(function CategorySidebar(
  { categories, activeCategory, scrollToCategory, sidebarBottom },
  ref,
) {
  return (
    <div
      ref={ref}
      className="hidden lg:block fixed right-0 top-0 w-64 h-screen overflow-y-auto bg-white border-l border-gray-200 pt-4"
      style={sidebarBottom ? { bottom: `${sidebarBottom}px`, height: "auto" } : {}}
    >
      <div className="px-4 mb-4">
        <h2 className="text-xl font-bold">الأقسام</h2>
      </div>
      <nav>
        <ul className="space-y-1">
          {categories.map((category) => {
            const categoryId = category._id.toString()
            const categoryName = typeof category.name === "object" ? category.name.ar : category.name
            const isActive = activeCategory === categoryId

            return (
              <li key={categoryId}>
                <button
                  onClick={() => scrollToCategory(categoryId)}
                  className={`w-full text-right px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary border-r-4 border-primary"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {categoryName}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
})
