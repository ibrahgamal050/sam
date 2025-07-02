import type React from "react"
import { Inter, Amiri } from "next/font/google"
import "@/app/globals.css"
import { RestaurantProvider } from "@/contexts/restaurant-context"
import { MobileLayout } from "@/components/ar/mobile-layout"
import { Footer } from "@/components/ar/footer"
import Restaurant from "@/models/restaurant"
import { dbConnect } from "@/lib/db" // ← استورد الدالة

import { IRestaurant } from "@/types/restaurant"
import { headers } from 'next/headers';


export default async function RestaurantLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const host = headersList.get("host")
  const subdomain = host?.split(".")[0]

  await dbConnect() // ✅ الحل هنا

  const restaurant = await Restaurant.findOne({ subdomain }).lean() as IRestaurant | null

  if (!restaurant) {
    return <div className="p-4">المطعم غير موجود</div>
  }

  return (
    <RestaurantProvider>
      <div className="min-h-screen flex flex-col" dir="rtl">
        <div className="block lg:hidden">
          <MobileLayout restaurant={restaurant}>{children}</MobileLayout>
        </div>
        <div className="hidden lg:block">
          {children}
        </div>
        <Footer />
      </div>
    </RestaurantProvider>
  )
}
