"use client"

import { Home, MapPin, Menu, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { useCart } from "@/contexts/cart-context"
import { cn } from "@/lib/utils"

type Locale = "ar" | "en"

const SUPPORTED_LOCALES: Locale[] = ["ar", "en"]

const resolveLocale = (pathname: string): Locale => {
  const segments = pathname.split("/").filter(Boolean)
  const candidate = segments[0]?.toLowerCase()
  return SUPPORTED_LOCALES.includes(candidate as Locale) ? (candidate as Locale) : "ar"
}

const buildNavItems = (locale: Locale) => {
  const prefix = `/${locale}`
  return [
    { name: locale === "ar" ? "الرئيسية" : "Home", href: prefix, icon: Home },
    { name: locale === "ar" ? "المنيو" : "Menu", href: `${prefix}/menu`, icon: Menu },
    { name: locale === "ar" ? "الفروع" : "Branches", href: `${prefix}/branches`, icon: MapPin },
    { name: locale === "ar" ? "السلة" : "Cart", href: `${prefix}/cart`, icon: ShoppingCart, withBadge: true },
  ] as const
}

const normalizePath = (path: string) => {
  if (!path) return "/"
  const normalized = path.replace(/\/+$/, "")
  return normalized === "" ? "/" : normalized
}

export function BottomNavigation() {
  const pathnameRaw = usePathname()
  const pathname = normalizePath(pathnameRaw)
  const locale = resolveLocale(pathnameRaw)
  const navItems = buildNavItems(locale)
  // احتياطي في حال تم استخدامه خارج مزود السلة (مثلاً في بيئات معاينة)
  let cartCount = 0
  try {
    const { items } = useCart()
    cartCount = items.reduce((total, item) => total + item.quantity, 0)
  } catch {
    cartCount = 0
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 block md:hidden" aria-label={locale === "ar" ? "التنقل السفلي" : "Bottom navigation"}>
      <div className="mx-auto flex w-screen flex-col">
        <div className="relative overflow-hidden border border-gray-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.4)]">
          <div className="grid pb-2 mt-2 grid-cols-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === normalizePath(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex h-16 flex-col items-center justify-center gap-1 rounded-[26px] px-2 text-xs font-medium transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c5ce7]/60",
                    isActive ? "text-[#6c5ce7]" : "text-gray-500 hover:text-[#6c5ce7]",
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-x-4 top-2 h-[3px] rounded-full bg-gradient-to-r from-[#6c5ce7] via-[#8a7ff5] to-[#6c5ce7]" />
                  )}

                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-2xl transition-all",
                      isActive ? "bg-[#6c5ce7]/10 text-[#6c5ce7]" : "bg-gray-100/60 text-gray-500",
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>

                  <span className={cn("leading-none", isActive && "font-semibold")}>{item.name}</span>

                  {item.withBadge && cartCount > 0 && (
                    <span className="absolute right-5 top-[10px] grid min-h-[18px] min-w-[18px] place-items-center rounded-full bg-[#f7c325] px-1 text-[11px] font-semibold text-black shadow">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="h-safe-area-inset-bottom" />
      </div>
    </nav>
  )
}
