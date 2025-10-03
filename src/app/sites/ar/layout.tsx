import type React from "react"
import { Inter, Amiri } from "next/font/google"
import "@/app/globals.css"
import { MobileLayout } from "@/components/ar/mobile-layout"
import { Footer } from "@/components/ar/footer"
import { CartProvider } from "@/contexts/cart-context"
import { resolveRestaurantFromHeaders } from "@/lib/domain/restaurant-context"
import type { IRestaurant } from "@/types/restaurant"

export default async function RestaurantLayout({ children }: { children: React.ReactNode }) {
  const { restaurant } = await resolveRestaurantFromHeaders()
  const typedRestaurant = restaurant as IRestaurant | null

  if (!typedRestaurant) {
    return <div className="p-4">المطعم غير موجود</div>
  }

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col" dir="rtl">
        <div className="block lg:hidden">
          <MobileLayout restaurant={typedRestaurant}>{children}</MobileLayout>
        </div>
        <div className="hidden lg:block">
          {children}
        </div>
        <Footer />
      </div>
    </CartProvider>
  )
}
