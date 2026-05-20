"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"

import type { ICategory } from "@/types/menu"
import { useCart } from "@/contexts/cart-context"
import { cn } from "@/lib/utils"

interface CategoryTabsProps {
  categories: ICategory[]
  activeCategory: string
  scrollToCategory: (categoryId: string) => void
  className?: string
}

const getCategoryName = (category: ICategory) => {
  if (typeof category.name === "string") return category.name
  return category.name?.en || category.name?.ar || "Untitled"
}

export function CategoryTabs({ categories, activeCategory, scrollToCategory, className }: CategoryTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)
  const { items } = useCart()
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    if (!activeTabRef.current || !tabsRef.current) return

    const tab = activeTabRef.current
    const container = tabsRef.current
    const { offsetLeft, offsetWidth } = tab
    const { clientWidth } = container
    const scrollTarget = offsetLeft - clientWidth / 2 + offsetWidth / 2

    container.scrollTo({ left: scrollTarget, behavior: "smooth" })
  }, [activeCategory])

  const handleTabClick = (categoryId: string) => {
    if (!categoryId) return
    scrollToCategory(categoryId)
  }

  return (
    <nav
      className={cn(
        "bg-white/95 pb-2 pt-3 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.25)] backdrop-blur",
        className,
      )}
      aria-label="Category navigation"
    >
      <div
        ref={tabsRef}
        className="relative flex items-center overflow-x-auto px-4 scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex items-center gap-3">
          {categories.map((category, index) => {
            const categoryId = category._id ? category._id.toString() : `category-${index}`
            const label = getCategoryName(category)
            const isActive = activeCategory === categoryId

            return (
              <button
                key={categoryId}
                ref={isActive ? activeTabRef : null}
                type="button"
                className={cn(
                  "relative flex min-w-[88px] items-center justify-center rounded-2xl border px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "border-[#6c5ce7] bg-[#6c5ce7]/10 text-[#6c5ce7] shadow-[0_10px_25px_-20px_rgba(108,92,231,0.8)]"
                    : "border-gray-200 bg-white text-gray-600 hover:border-[#6c5ce7]/50 hover:text-[#6c5ce7]"
                )}
                onClick={() => handleTabClick(categoryId)}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
