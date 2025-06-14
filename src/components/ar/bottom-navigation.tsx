"use client"

import { Home, Menu, Info, MapPin, FileText, Phone } from 'lucide-react'
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { cn } from "@/lib/utils"

export function BottomNavigation() {
  const pathname = usePathname()
  const params = useParams()
  const slug = params?.slug as string

  const navItems = [
    { name: "الرئيسية", href: `/ar/`, icon: Home },
    { name: "المنيو", href: `/ar/menu`, icon: Menu },
    { name: "الفروع", href: `/ar/branches`, icon: MapPin },
    { name: "عن المطعم", href: `/ar/about`, icon: FileText },
  ]

  return (
    <div className="bottom-nav">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== `/${slug}` && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}