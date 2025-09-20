"use client"

import type { ICategory, CategoryRef } from "@/types/menu"
import { MenuItemCard } from "./menu-item-card"
import { Info } from "lucide-react"
import { motion } from "framer-motion"

interface MenuCategoriesProps {
  categories: ICategory[]
  categoryRefs: { [key: string]: CategoryRef }
  currency: string
  activeCategory: string 
}

export function MenuCategories({ categories, categoryRefs, currency, activeCategory }: MenuCategoriesProps) {
  return (
    <div className="w-full space-y-12" itemScope itemType="https://schema.org/Menu">
      {categories.length > 0 ? (
        categories.map((category, index) => {
          const categoryName = category.name.ar || category.name.en || ""
          const categoryId = category._id ? category._id.toString() : `category-${index}`
          const isActive = categoryId === activeCategory

          return (
            <section
              id={categoryId}
              key={categoryId}
              ref={(el) => {
                if (categoryId) {
                  categoryRefs[categoryId] = el
                }
              }}
              className={`scroll-mt-[100px] lg:scroll-mt-24 relative ${isActive ? "category-active" : ""}`}
              itemScope
              itemType="https://schema.org/MenuSection"
            >
              {/* Category heading with animation */}
              <div className="sticky top-[92px] lg:top-20 z-10 -mx-6 px-6 py-3 bg-white/90 backdrop-blur border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3" itemProp="name">
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryIndicator"
                      className="w-1.5 h-6 rounded-full bg-[#6c5ce7]"
                      transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    />
                  )}
                  {categoryName}
                </h2>
              </div>

              {/* Menu items grid */}
              <div className="grid grid-cols-2 gap-4 mt-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
    <div className="rounded-[32px] border border-gray-200 bg-white p-12 text-center shadow-[0_20px_55px_-40px_rgba(15,23,42,0.45)]">
      <Info className="mx-auto mb-4 h-16 w-16 text-[#6c5ce7]" aria-hidden="true" />
      <p className="mb-2 text-xl font-semibold text-gray-900">القائمة غير متوفرة</p>
      <p className="text-gray-500">يرجى التحقق لاحقًا</p>
    </div>
  )
}
