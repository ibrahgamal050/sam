import type { ReactNode } from "react"
import { BottomNavigation } from "./bottom-navigation"
import { MobileMenu } from "./mobile-menu"
import Link from "next/link"

interface MobileLayoutProps {
  children: ReactNode
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="mobile-container flex flex-col min-h-screen">
      {/* Header */}
      <header dir="ltr" className="fixed bg-purple-50 top-0 left-0 right-0 flex items-center justify-between bg-white shadow-sm border-b border-purple-100 p-3 w-full z-50">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="flex items-center justify-center w-8 h-8 bg-[#6d28d9] text-white text-lg font-bold rounded-lg">
              M
            </span>
            <span className="text-[#6d28d9] text-xl font-bold">Meelza</span>
          </Link>
        </div>

        <div className="flex items-center">{/* Center area - can be used for other elements if needed */}</div>

        <div dir="rtr"className="flex items-center">
          <MobileMenu  />
        </div>
      </header>

      {/* Main Content */}
      <div >{children}</div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
