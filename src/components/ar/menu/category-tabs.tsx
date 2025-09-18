"use client"

import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { ICategory } from "@/types/menu" // Adjusted import path
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

interface CategoryTabsProps {
  categories: ICategory[]
  activeCategory: string
  scrollToCategory: (categoryId: string) => void
  className?: string
}

export function CategoryTabs({ categories, activeCategory, scrollToCategory, className }: CategoryTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)
  const { items } = useCart()
  const count = items.reduce((s, i) => s + i.quantity, 0)

  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      const tab = activeTabRef.current
      const tabsContainer = tabsRef.current
      const { offsetLeft, offsetWidth } = tab
      const { scrollLeft, clientWidth } = tabsContainer

      // Scroll to center the active tab if it's not fully visible
      const scrollTarget = offsetLeft - clientWidth / 2 + offsetWidth / 2

      tabsContainer.scrollTo({
        left: scrollTarget,
        behavior: "smooth",
      })
    }
  }, [activeCategory]) // Rerun when activeCategory changes

  return (
    <nav
      className={cn(
        "sticky top-0 z-10 bg-white pt-3 shadow-sm", // Added pt-3 for spacing
        className,
      )}
      aria-label="Category Navigation"
    >
      <div
        ref={tabsRef}
        className="overflow-x-auto scrollbar-hide pb-2 px-4 touch-pan-x"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex space-x-4">
          {categories.map((category) => {
            const categoryId = category._id ? category._id.toString() : ""
            const categoryName =
              typeof category.name === "object"
                ? category.name.ar || Object.values(category.name)[0] // Fallback to 'en' or first available
                : category.name
            const isActive = activeCategory === categoryId

            return (
              <button
                key={categoryId}
                ref={isActive ? activeTabRef : null}
                data-value={categoryId}
                className={cn(
                  "whitespace-nowrap text-sm font-medium py-2 px-3 rounded-md transition-all border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-700 focus-visible:ring-offset-2",
                  isActive
                    ? "border-gray-800 text-gray-900 font-semibold bg-violet-100"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-violet-50",
                )}
                onClick={() => scrollToCategory(categoryId)}
                aria-current={isActive ? "page" : undefined}
              >
                {categoryName}
              </button>
            )
          })}
          {/* Cart entry at the end */}
          <Link
            href="/ar/cart"
            className="ml-2 inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold py-2 px-3 rounded-full bg-[#6C5CE7] text-white shadow-sm hover:bg-[#5A4BD1]"
            aria-label="الذهاب إلى السلة"
          >
            <div className="relative">
              <ShoppingCart className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 text-[10px] bg-white text-[#6C5CE7] rounded-full px-1.5 py-0.5 font-bold">
                  {count}
                </span>
              )}
            </div>
            السلة
          </Link>
        </div>
      </div>
    </nav>
  )
}
