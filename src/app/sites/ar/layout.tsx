import type React from "react"
import { Inter, Amiri } from "next/font/google"
import "@/app/globals.css"
import { RestaurantProvider } from "@/contexts/restaurant-context"
import { MobileLayout } from "@/components/ar/mobile-layout"
import { Footer } from "@/components/ar/footer"
import Restaurant from "@/models/restaurant"

import { IRestaurant } from "@/types/restaurant"
import { headers } from 'next/headers';


export default async function RestaurantLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const headersList = await headers(); // ✅ استخدم await
  const host = headersList.get('host'); // ✅ دلوقتي get هتشتغل
  const subdomain = host?.split('.')[0];

  const restaurant = await Restaurant.findOne({ subdomain }).lean() as IRestaurant | null;

  if (!restaurant) {
    return <div className="p-4">المطعم غير موجود</div>;
  }
  return (
    <RestaurantProvider>
      {/* دي تغلف كل حاجة */}
      <div className="min-h-screen flex flex-col" dir="rtl" >
        <div className="block lg:hidden">
          <MobileLayout restaurant={restaurant} >{children}</MobileLayout>
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
