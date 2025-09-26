"use client"

import { Menu, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  href: string
}

interface MainNavProps {
  logo?: React.ReactNode
  items?: NavItem[]
}

const DEFAULT_ITEMS: NavItem[] = [
  { name: "الرئيسية", href: "/ar" },
  { name: "المنيو", href: "/ar/menu" },
  { name: "الفروع", href: "/ar/branches" },
  { name: "المقالات", href: "/ar/posts" },
  { name: "عن المطعم", href: "/ar/about" },
  { name: "تواصل", href: "/ar/contact" },
]

export function MainNav({ logo, items = DEFAULT_ITEMS }: MainNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header
      data-fixed="true"
      className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 shadow-[0_10px_30px_-25px_rgba(15,23,42,0.45)] backdrop-blur"
      dir="rtl"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
       <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-[#6c5ce7]/40 hover:text-[#6c5ce7]"
            aria-label="الملف الشخصي"
          >
            <User className="h-4 w-4" />
          </button>

        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
          {items.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-2 transition",
                  isActive
                    ? "bg-[#6c5ce7]/10 text-[#6c5ce7] font-semibold"
                    : "hover:bg-[#f7f9fc] hover:text-[#6c5ce7]"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>

        <button
          type="button"
          className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 transition hover:border-[#6c5ce7]/40 hover:text-[#6c5ce7] md:inline-flex"
          aria-label="الملف الشخصي"
        >
          <User className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 md:hidden">
         
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6c5ce7] text-white shadow transition hover:bg-[#5a4bd1]"
            aria-label="قائمة التنقل"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={cn(
          "border-t border-gray-200 bg-white transition-[max-height,opacity] duration-300 md:hidden",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
        aria-hidden={!open}
      >
        <nav className="flex flex-col gap-1 px-4 pb-4 pt-2 text-sm font-medium text-gray-600">
          {items.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2 transition",
                  isActive
                    ? "bg-[#6c5ce7]/10 text-[#6c5ce7] font-semibold"
                    : "hover:bg-[#f7f9fc] hover:text-[#6c5ce7]"
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
