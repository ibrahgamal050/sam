"use client"

import { Menu, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useId, useMemo, useState } from "react"

import CustomerAddressPage from "@/components/ar/address/AddressSheet"
import MobileProfileMenu from "@/components/ar/header/mobile-profile-menu"
import { cn } from "@/lib/utils"

type Locale = "ar" | "en"

interface NavItem {
  name: string
  href: string
}

interface MainNavProps {
  logo?: React.ReactNode
  items?: NavItem[]
}

const LOCALE_LABELS: Record<Locale, Record<string, string>> = {
  ar: {
    home: "الرئيسية",
    menu: "المنيو",
    branches: "الفروع",
    posts: "المقالات",
    about: "عن المطعم",
    contact: "تواصل",
  },
  en: {
    home: "Home",
    menu: "Menu",
    branches: "Branches",
    posts: "Posts",
    about: "About",
    contact: "Contact",
  },
}

const SUPPORTED_LOCALES: Locale[] = ["ar", "en"]

const resolveLocale = (pathname: string): Locale => {
  const segments = pathname.split("/").filter(Boolean)
  const candidate = segments[0]?.toLowerCase()
  return SUPPORTED_LOCALES.includes(candidate as Locale) ? (candidate as Locale) : "ar"
}

const normalizePath = (path: string) => {
  if (!path) return "/"
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1)
  return path
}

const isActivePath = (current: string, target: string) => {
  if (!target) return false
  if (current === target) return true
  return current.startsWith(`${target}/`)
}

const buildDefaultItems = (locale: Locale): NavItem[] => {
  const labels = LOCALE_LABELS[locale]
  const prefix = `/${locale}`
  return [
    { name: labels.home, href: prefix },
    { name: labels.menu, href: `${prefix}/menu` },
    { name: labels.branches, href: `${prefix}/branches` },
    { name: labels.posts, href: `${prefix}/posts` },
    { name: labels.about, href: `${prefix}/about` },
    { name: labels.contact, href: `${prefix}/contact` },
  ]
}

export function MainNav({ logo, items }: MainNavProps) {
  const pathname = usePathname()
  const menuId = useId()
  const locale = useMemo(() => resolveLocale(pathname), [pathname])
  const navItems = useMemo(() => items ?? buildDefaultItems(locale), [items, locale])
  const [open, setOpen] = useState(false)
  const currentPath = normalizePath(pathname || "/")

  useEffect(() => {
    // close mobile menu on route change for better UX
    setOpen(false)
  }, [pathname])

  return (
    <header
      data-fixed="true"
      className="relative sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 shadow-[0_10px_30px_-25px_rgba(15,23,42,0.45)] backdrop-blur"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {logo && <div className="flex items-center">{logo}</div>}

        <div className="hidden items-center gap-4 md:flex">
          <CustomerAddressPage />
          <nav className="flex items-center gap-6 text-sm font-medium text-gray-600" aria-label={locale === "ar" ? "التنقل الرئيسي" : "Main navigation"}>
            {navItems.map((item) => {
              const itemHref = normalizePath(item.href)
              const isActive = isActivePath(currentPath, itemHref)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3 py-2 transition",
                    isActive
                      ? "bg-[#6c5ce7]/10 text-[#6c5ce7] font-semibold"
                      : "hover:bg-[#f7f9fc] hover:text-[#6c5ce7]",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <button
          type="button"
          className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 transition hover:border-[#6c5ce7]/40 hover:text-[#6c5ce7] md:inline-flex"
          aria-label={locale === "ar" ? "الملف الشخصي" : "Profile"}
        >
          <User className="h-5 w-5" />
        </button>

        <div className="flex flex-1 items-center gap-3 md:hidden">
          <CustomerAddressPage />
          <MobileProfileMenu />
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6c5ce7] text-white shadow transition hover:bg-[#5a4bd1]"
            aria-label={locale === "ar" ? "قائمة التنقل" : "Toggle navigation"}
            aria-expanded={open}
            aria-controls={menuId}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open && (
        <button
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 md:hidden"
          style={{ WebkitTapHighlightColor: "transparent" }}
        />
      )}

      <div
        id={menuId}
        className={cn(
          "absolute top-full inset-x-0 border-t border-gray-200 bg-white transition-[max-height,opacity] duration-300 md:hidden",
          open ? "max-h-96 opacity-100 pointer-events-auto" : "max-h-0 opacity-0 overflow-hidden pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <nav className="flex flex-col gap-1 px-4 pb-4 pt-2 text-sm font-medium text-gray-600">
          {navItems.map((item) => {
            const itemHref = normalizePath(item.href)
            const isActive = isActivePath(currentPath, itemHref)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2 transition",
                  isActive
                    ? "bg-[#6c5ce7]/10 text-[#6c5ce7] font-semibold"
                    : "hover:bg-[#f7f9fc] hover:text-[#6c5ce7]",
                )}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
