"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { usePathname } from "next/navigation"
import { BottomNavigation } from "./bottom-navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Home, Info } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import Link from "next/link"
import type { Locale } from "@/lib/translations"

interface MobileLayoutProps {
  children: React.ReactNode
  locale: Locale
}

export function MobileLayout({ children, locale }: MobileLayoutProps) {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const direction = locale === "ar" ? "rtl" : "ltr"

  useEffect(() => {
    // Load translations on the client side
    const loadTranslations = async () => {
      try {
        const translations = await import(`@/translations/${locale}.json`)
        setTranslations(translations.default)
      } catch (error) {
        console.error("فشل في تحميل الترجمات:", error)
      }
    }

    loadTranslations()
  }, [locale])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Adjust animation direction based on language direction
  const menuInitial = direction === "ltr" ? { x: "-100%" } : { x: "100%" }
  const menuExit = direction === "ltr" ? { x: "-100%" } : { x: "100%" }

  return (
    <div className="mobile-container flex flex-col min-h-screen" dir={direction} lang={locale}>
      {/* الرأس */}
      <header className="fixed top-0 left-0 right-0 flex items-center justify-between bg-black text-white p-3 w-full z-50">
        <Button variant="ghost" size="icon" className="text-white" onClick={toggleMenu}>
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">{isMenuOpen ? translations.close_menu : translations.open_menu}</span>
        </Button>

        <h1 className="text-base font-medium">{translations.restaurant_name}</h1>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </header>

      {/* القائمة المنزلقة */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={menuInitial}
            animate={{ x: 0 }}
            exit={menuExit}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`fixed top-[56px] ${direction === "ltr" ? "left-0" : "right-0"} w-64 h-[calc(100vh-56px)] bg-background border-r z-40 overflow-y-auto`}
          >
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    href={locale === "ar" ? "/ar" : "/"}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Home className="h-5 w-5" />
                    <span>{translations.home}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={locale === "ar" ? "/ar/menu" : "/menu"}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Info className="h-5 w-5" />
                    <span>{translations.menu}</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* الطبقة الشفافة عند فتح القائمة */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-30"
            onClick={toggleMenu}
          />
        )}
      </AnimatePresence>

      {/* المحتوى الرئيسي */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
        className="content-area w-full max-w-md mx-auto pt-16 pb-20 px-4"
      >
        {children}
      </motion.div>

      {/* شريط التنقل السفلي */}
      <BottomNavigation locale={locale} />
    </div>
  )
}