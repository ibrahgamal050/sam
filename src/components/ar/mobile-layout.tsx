import type { ReactNode } from "react"
import { BottomNavigation } from "./bottom-navigation"
import { MobileMenu } from "./mobile-menu"
import Link from "next/link"
import restaurant from "@/models/restaurant"
import type { IRestaurant } from "@/types"

interface MobileLayoutProps {
  children: ReactNode
  restaurant: IRestaurant

}

export function MobileLayout({restaurant, children }: MobileLayoutProps) {
  return (
    <div className="mobile-container flex flex-col min-h-screen">
      

      {/* Main Content */}
      <div >{children}</div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
