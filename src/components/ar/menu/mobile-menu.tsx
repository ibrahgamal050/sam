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
      className="lg:hidden fixed top-16 left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-sm"
    >
      <CategoryTabs categories={categories} activeCategory={activeCategory} scrollToCategory={scrollToCategory} />
    </div>
  )
}
