"use client"

import { forwardRef } from "react"
import type { ICategory } from "@/types/menu"

interface CategorySidebarProps {
  categories: ICategory[]
  activeCategory: string 
  scrollToCategory: (categoryId: string) => void
  sidebarBottom: number | null
}

export const CategorySidebar = forwardRef<HTMLDivElement | null, CategorySidebarProps>(function CategorySidebar(
  { categories, activeCategory, scrollToCategory, sidebarBottom },
  ref,
) {
  return (
    <aside
      ref={ref}
      className="hidden lg:flex sticky top-6 self-start max-h-[calc(100vh-3rem)] w-[260px] flex-col overflow-y-auto rounded-[32px] border border-gray-200 bg-white p-6 text-gray-900 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.35)]"
      style={sidebarBottom ? { marginBottom: `${sidebarBottom}px` } : {}}
    >
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Menu</p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">Categories</h2>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {categories.map((category, index) => {
            const categoryId = category._id ? category._id.toString() : `category-${index}`
            const categoryName = typeof category.name === "object" ? category.name.en || category.name.ar : category.name
            const isActive = activeCategory === categoryId

            return (
              <li key={categoryId}>
                <button
                  onClick={() => scrollToCategory(categoryId)}
                  className={`w-full text-left px-4 py-2.5 text-sm font-semibold rounded-2xl transition-all duration-200 ${
                    isActive
                      ? "bg-[#6c5ce7]/10 text-[#6c5ce7] border border-[#6c5ce7]/30 shadow-[0_15px_35px_-25px_rgba(108,92,231,0.45)]"
                      : "border border-transparent text-gray-600 hover:border-[#6c5ce7]/40 hover:bg-[#f7f9fc] hover:text-[#6c5ce7]"
                  }`}
                >
                  {categoryName}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="mt-8 rounded-2xl border border-gray-100 bg-[#f7f9fc] px-4 py-5 text-sm text-gray-600">
        <p className="mb-2 font-semibold text-gray-800">Tip</p>
        <p>Select a category to quickly navigate between available dishes and add them to your cart.</p>
      </div>
    </aside>
  )
})
