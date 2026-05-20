"use client"

import type React from "react"

import { forwardRef } from "react"
import { CategorySidebar } from "./category-sidebar"
import type { ICategory } from "@/types/menu"

interface DesktopMenuProps {
  categories: ICategory[]
  activeCategory: string
  scrollToCategory: (categoryId: string) => void
  sidebarBottom: number | null
}

export const DesktopMenu = forwardRef<HTMLDivElement, DesktopMenuProps>(function DesktopMenu(
  { categories, activeCategory, scrollToCategory, sidebarBottom },
  ref,
) {
  return (
    <CategorySidebar
      ref={ref as React.RefObject<HTMLDivElement>}
      categories={categories}
      activeCategory={activeCategory}
      scrollToCategory={scrollToCategory}
      sidebarBottom={sidebarBottom}
    />
  )
})