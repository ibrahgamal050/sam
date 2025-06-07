"use client"

import type React from "react"

import { forwardRef } from "react"
import { CategorySidebar } from "./category-sidebar"
import type { ICategory } from "@/types/menu"
import type { ObjectId } from "mongodb" // Assuming ObjectId is from MongoDB

interface DesktopMenuProps {
  categories: ICategory[]
  activeCategory: string
  scrollToCategory: (categoryId: string) => void
  sidebarBottom: number
}

export const DesktopMenu = forwardRef<HTMLDivElement, DesktopMenuProps>(function DesktopMenu(
  { categories, activeCategory, scrollToCategory, sidebarBottom },
  ref,
) {
  // Filter out categories without _id and assert the type
  const categoriesWithId = categories.filter(
    (category): category is ICategory & { _id: ObjectId } => category._id !== undefined,
  ) as unknown as (ICategory & { _id: ObjectId })[]

  return (
    <CategorySidebar
      ref={ref as React.RefObject<HTMLDivElement>}
      categories={categoriesWithId}
      activeCategory={activeCategory}
      scrollToCategory={scrollToCategory}
      sidebarBottom={sidebarBottom}
    />
  )
})
