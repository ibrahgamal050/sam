"use client"

import { FileText, Home, Menu, MapPin, Navigation, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { useCart } from "@/contexts/cart-context"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { name: "الرئيسية", href: "/ar", icon: Home },
  { name: "المنيو", href: "/ar/menu", icon: Menu },
  { name: "الفروع", href: "/ar/branches", icon: MapPin },
  { name: "السلة", href: "/ar/cart", icon: ShoppingCart, withBadge: true },
] as const

const normalizePath = (path: string) => {
  if (!path) return "/"
  const normalized = path.replace(/\/+$/, "")
  return normalized === "" ? "/" : normalized
}

export function BottomNavigation() {
  const pathname = normalizePath(usePathname())
  const { items } = useCart()
  const cartCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 block lg:hidden" aria-label="التنقل السفلي">
      <div className="mx-auto flex max-w-md flex-col gap-2 px-4 pb-4">
        <div className="relative overflow-hidden rounded-[26px] border border-gray-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.4)]">
          <div className="grid grid-cols-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = pathname === normalizePath(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex h-16 flex-col items-center justify-center gap-1 rounded-[26px] px-2 text-xs font-medium transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c5ce7]/60",
                    isActive
                      ? "text-[#6c5ce7]"
                      : "text-gray-500 hover:text-[#6c5ce7]"
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-x-4 top-2 h-[3px] rounded-full bg-gradient-to-r from-[#6c5ce7] via-[#8a7ff5] to-[#6c5ce7]" />
                  )}

                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-2xl transition-all",
                      isActive
                        ? "bg-[#6c5ce7]/10 text-[#6c5ce7]"
                        : "bg-gray-100/60 text-gray-500"
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
