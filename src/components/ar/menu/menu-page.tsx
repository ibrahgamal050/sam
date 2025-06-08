"use client"

import { useRef } from "react"
import { MenuLayout } from "./menu-layout"
import { useMenuScroll } from "@/hooks/use-menu-scroll"
import type { IMenu } from "@/types/menu"

interface MenuPageProps {
  menuData: IMenu
}

export function MenuPage({ menuData }: MenuPageProps) {
  // Extract categories from menuData
  const categories = menuData?.categories || []

  // Get currency from menuData
  const currency = menuData?.currency?.ar || "ج.م"

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
      className="min-h-screen bg-gray-50 text-gray-800 pb-16"
      itemScope
      itemType="https://schema.org/Restaurant"
      dir="rtl"
    >
      <MenuLayout
        menuData={menuData}
        categories={categories}
        activeCategory={activeCategory}
        categoryRefs={categoryRefs}
        scrollToCategory={scrollToCategory}
        headerRef={headerRef}
        footerRef={footerRef}
        sidebarRef={sidebarRef}
        sidebarBottom={sidebarBottom}
        currency={currency}
      >
      </MenuLayout>

      {/* Footer reference for positioning */}
      <div ref={footerRef} className="h-1" aria-hidden="true"></div>
    </div>
  )
}
