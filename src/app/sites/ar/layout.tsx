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
   
        <>
            <div className="block lg:hidden"> {/* شاشات صغيرة */}
              <MobileLayout>
                {children}
              </MobileLayout>
            </div>
            <div className="hidden lg:block"> {/* شاشات كبيرة */}
                {children}
            </div>
            <Footer />
            </>
     
  )
}
