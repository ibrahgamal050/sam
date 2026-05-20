"use client"

import type React from "react"

import { CategoryTabs } from "./category-tabs"
import type { ICategory } from "@/types/menu"

interface MobileMenuProps {
  headerRef: React.RefObject<HTMLDivElement | null>
  categories: ICategory[]
  activeCategory: string
  scrollToCategory: (categoryId: string) => void
}

export function MobileMenu({ headerRef, categories, activeCategory, scrollToCategory }: MobileMenuProps) {
  return (
    <div
      ref={headerRef}
      data-mobile-menu="true"
      data-offset="12"
      className="lg:hidden sticky top-[80px] z-40 border-b border-gray-200 bg-white/95 backdrop-blur shadow-[0_15px_35px_-30px_rgba(15,23,42,0.4)]"
    >
      <div className="px-4 py-3">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Menu</p>
            <h2 className="mt-1 text-base font-semibold text-gray-900">Choose a category</h2>
          </div>
        </div>
        <CategoryTabs categories={categories} activeCategory={activeCategory} scrollToCategory={scrollToCategory} />
      </div>
    </div>
  )
}
