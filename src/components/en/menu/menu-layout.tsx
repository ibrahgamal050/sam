"use client"

import type React from "react"

import type { ReactNode } from "react"
import { DesktopMenu } from "./desktop-menu"
import { MobileMenu } from "./mobile-menu"
import { MenuGallery } from "./menu-gallery"
import { convertToMenuImages } from "@/types/menu-components"
import { MenuCategories } from "./menu-categories"
import { DesktopCart } from "./desktop-cart"
import { MenuHeader } from "./menu-header"
import type { IMenu, ICategory, CategoryRef } from "@/types/menu"

interface MenuLayoutProps {
  menuData: IMenu
  categories: ICategory[]
  activeCategory: string
  categoryRefs: { [key: string]: CategoryRef }
  scrollToCategory: (categoryId: string) => void
  headerRef: React.RefObject<HTMLDivElement | null>
  sidebarRef: React.RefObject<HTMLDivElement | null>
  sidebarBottom: number | null
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
  const galleryImages = convertToMenuImages(menuData.menuImages)
  const categoriesCount = categories.length
  const itemsCount = categories.reduce((total, category) => total + (category.menuItems?.length || 0), 0)
  const menuName = menuData.name || "Menu"
  return (
    <>
      {/* Mobile layout */}
      <div className="lg:hidden">
        
        

        <MobileMenu
          headerRef={headerRef}
          categories={categories}
          activeCategory={activeCategory}
          scrollToCategory={scrollToCategory}
        />
        <div className="px-4 pb-6 space-y-6 pt-3">
          <MenuCategories
            categories={categories}
            categoryRefs={categoryRefs}
            currency={currency}
            activeCategory={activeCategory}
          />
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:grid min-h-screen grid-cols-[260px_minmax(0,1fr)_320px] gap-6 px-6 pb-24">
        <DesktopMenu
          ref={sidebarRef}
          categories={categories}
          activeCategory={activeCategory}
          scrollToCategory={scrollToCategory}
          sidebarBottom={sidebarBottom}
        />
        <div className="space-y-6">
         

          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.35)]">
            
            <MenuCategories
              categories={categories}
              categoryRefs={categoryRefs}
              currency={currency}
              activeCategory={activeCategory}
            />
          </div>
        </div>

        <DesktopCart currency={currency} />
      </div>
    </>
  )
}
