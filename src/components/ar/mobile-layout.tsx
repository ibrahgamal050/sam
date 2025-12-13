import type { ReactNode } from "react"
import { BottomNavigation } from "./bottom-navigation"
import type { IRestaurant } from "@/types"

interface MobileLayoutProps {
  children: ReactNode
  restaurant: IRestaurant
}

export function MobileLayout({ restaurant, children }: MobileLayoutProps) {
  return (
    <div className="mobile-container flex min-h-screen flex-col">
      <div>{children}</div>
      <BottomNavigation />
    </div>
  )
}
