"use client"

import { Home, Menu, MapPin, ShoppingCart } from 'lucide-react'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCart } from "@/contexts/cart-context"

export function BottomNavigation() {
  const pathname = usePathname()
  const { items } = useCart()

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const navItems = [
    { name: "الرئيسية", href: `/ar/`, icon: Home },
    { name: "المنيو", href: `/ar/menu`, icon: Menu },
    { name: "الفروع", href: `/ar/branches`, icon: MapPin },
    { name: "السلة", href: `/ar/cart`, icon: ShoppingCart, badge: cartCount },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-full",
                "transition-all duration-300 ease-out",
                "rounded-xl mx-1 group",
                "hover:bg-gray-50/80 active:scale-95",
                isActive && "bg-gradient-to-br from-[#6C5CE7]/10 to-[#6C5CE7]/5"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-full" />
              )}
              
              {/* Icon with animation */}
              <div className={cn(
                "relative transition-all duration-300 ease-out",
                isActive ? "transform -translate-y-0.5 scale-110" : "group-hover:scale-105"
              )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-300",
                    isActive
                      ? "text-[#6C5CE7] drop-shadow-sm"
                      : "text-gray-500 group-hover:text-[#6C5CE7]"
                  )}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full bg-[#6C5CE7] text-white text-[11px] leading-none flex items-center justify-center px-1">
                    {item.badge}
                  </span>
                )}
              </div>
              
              {/* Label with improved typography */}
              <span className={cn(
                "text-xs mt-1.5 font-medium transition-all duration-300",
                "leading-tight text-center",
                isActive 
                  ? "text-[#6C5CE7] font-semibold" 
                  : "text-gray-600 group-hover:text-[#6C5CE7]"
              )}>
                {item.name}
              </span>

              {/* Ripple effect on tap */}
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-[#6C5CE7]/0 group-active:bg-[#6C5CE7]/10 transition-colors duration-150" />
              </div>
            </Link>
          )
        })}
      </div>
      
      {/* Bottom safe area for mobile devices */}
      <div className="h-safe-area-inset-bottom bg-white/95" />
    </div>
  )
}
