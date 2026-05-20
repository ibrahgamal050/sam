"use client"

import { useRef } from "react"
import { MenuLayout } from "./menu-layout"
import { useMenuScroll } from "@/hooks/use-menu-scroll"
import type { IMenu } from "@/types/menu"

interface MenuPageProps {
  menuData: IMenu | null
}

export function MenuPage({ menuData }: MenuPageProps) {
  const normalizedMenuData = {
    name: "قائمة الطعام",
    currency: { ar: "ج.م" },
    categories: [],
    menuImages: [],
    ...menuData,
  } as IMenu

  // Extract categories from menuData
  const categories = normalizedMenuData.categories || []

  // Get currency from menuData
  const currency = normalizedMenuData.currency?.ar || "ج.م"

  // Refs for layout elements
  const headerRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Use custom hook for scroll handling
  const { activeCategory, categoryRefs, isHeaderSticky, sidebarBottom, scrollToCategory } = useMenuScroll({
    categories,
    headerRef,
    footerRef,
    sidebarRef,
  })

  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-gray-900 pb-16"
      itemScope
      itemType="https://schema.org/Restaurant"
      dir="rtl"
    >
      <MenuLayout
        menuData={normalizedMenuData}
        categories={categories}
        activeCategory={activeCategory}
        categoryRefs={categoryRefs}
        scrollToCategory={scrollToCategory}
        headerRef={headerRef}
        sidebarRef={sidebarRef}
        sidebarBottom={sidebarBottom}
        currency={currency}
      >
      </MenuLayout>

      
    </div>
  )
}
