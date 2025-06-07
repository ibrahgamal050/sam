"use client"

import type React from "react"

import type { ReactNode } from "react"
import { DesktopMenu } from "./desktop-menu"
import { MobileMenu } from "./mobile-menu"
import { MenuGallery } from "./menu-gallery"
import { MenuCategories } from "./menu-categories"
import type { IMenu, ICategory, CategoryRef } from "@/types/menu"

interface MenuLayoutProps {
  menuData: IMenu
  categories: ICategory[]
  activeCategory: string
  categoryRefs: { [key: string]: CategoryRef }
  scrollToCategory: (categoryId: string) => void
  headerRef: React.RefObject<HTMLDivElement>
  footerRef: React.RefObject<HTMLDivElement>
  sidebarRef: React.RefObject<HTMLDivElement>
  sidebarBottom: number
  currency: string
  children: ReactNode
}

export function MenuLayout({
  menuData,
  categories,
  activeCategory,
  categoryRefs,
  scrollToCategory,
  headerRef,
  sidebarRef,
  sidebarBottom,
  currency,
  children,
}: MenuLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row">
      {/* Main Content Area */}
      <div className="w-full lg:mr-64">
        <MenuGallery images={menuData.menuImages} />

        {/* Mobile Header with Category Tabs */}
        <MobileMenu
          headerRef={headerRef}
          categories={categories}
          activeCategory={activeCategory}
          scrollToCategory={scrollToCategory}
        />

        {/* Main Content Container */}
        <div className="container mx-auto px-4 py-4 lg:py-8">
          {children}

          {/* Category Sections - Only shown when not searching */}
          <div id="menu-categories">
            <MenuCategories categories={categories} categoryRefs={categoryRefs} currency={currency} />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <DesktopMenu
        ref={sidebarRef}
        categories={categories}
        activeCategory={activeCategory}
        scrollToCategory={scrollToCategory}
        sidebarBottom={sidebarBottom}
      />
    </div>
  )
}
