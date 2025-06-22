import type React from "react"
import { Inter, Amiri } from "next/font/google"
import "@/app/globals.css"
import { RestaurantProvider } from "@/contexts/restaurant-context"
import { MobileLayout } from "@/components/ar/mobile-layout"
import { Footer } from "@/components/ar/footer"




export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RestaurantProvider>
      {/* دي تغلف كل حاجة */}
      <div className="min-h-screen flex flex-col" dir="rtl" >
        <div className="block lg:hidden">
          <MobileLayout>{children}</MobileLayout>
        </div>
        <div className="hidden lg:block">
          {/* نمرر children بنفس الطريقة لكن بدون إعادة تكرار */}
          {children}
        </div>
        <Footer />
      </div>
    </RestaurantProvider>
  )
}
