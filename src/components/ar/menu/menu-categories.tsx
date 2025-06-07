"use client"

import type { ICategory, CategoryRef } from "@/types/menu"
import { MenuItemCard } from "./menu-item-card"
import { Info } from "lucide-react"
import { motion } from "framer-motion"

interface MenuCategoriesProps {
  categories: ICategory[]
  categoryRefs: { [key: string]: CategoryRef }
  currency: string
  activeCategory: string | null
}

export function MenuCategories({ categories, categoryRefs, currency, activeCategory }: MenuCategoriesProps) {
  return (
    <div className="w-full" itemScope itemType="https://schema.org/Menu">
      {categories.length > 0 ? (
        categories.map((category) => {
          const categoryName = category.name.ar || category.name.en || ""
          const categoryId = category._id ? category._id.toString() : ""
          const isActive = categoryId === activeCategory

          return (
            <section
              id={categoryId}
              key={categoryId}
              ref={(el) => categoryId && (categoryRefs[categoryId] = el)}
              className={`mb-12 scroll-mt-[100px] lg:scroll-mt-16 relative ${isActive ? "category-active" : ""}`}
              itemScope
              itemType="https://schema.org/MenuSection"
            >
              {/* Category heading with animation */}
              <div className="sticky top-[100px] lg:top-16 z-10 -mx-4 px-4 py-2 bg-white/95 backdrop-blur-sm border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center" itemProp="name">
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryIndicator"
                      className="w-1.5 h-6 bg-primary-600 rounded-full mr-2"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {categoryName}
                </h2>
              </div>

              {/* Menu items grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {category.menuItems &&
                  category.menuItems.map((item) => (
                    <MenuItemCard
                      key={item._id ? item._id.toString() : Math.random().toString()}
                      item={item}
                      currency={currency}
                    />
                  ))}
              </div>
            </section>
          )
        })
      ) : (
        <EmptyMenuState />
      )}
    </div>
  )
}

function EmptyMenuState() {
  return (
    <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
      <Info className="h-16 w-16 mx-auto text-gray-300 mb-4" aria-hidden="true" />
      <p className="text-xl font-medium text-gray-700 mb-2">القائمة غير متوفرة</p>
      <p className="text-gray-500">يرجى التحقق لاحقًا</p>
    </div>
  )
}
