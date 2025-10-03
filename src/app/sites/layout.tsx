import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "@/app/globals.css"
import { MainNav } from "@/components/ar/header/main-nav"
import { DeliveryAddressProvider } from "@/contexts/delivery-address-context"
import { RestaurantProvider } from "@/contexts/restaurant-context"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RestaurantProvider>
      <DeliveryAddressProvider>
        <MainNav />
        <div className="pt-[80px] md:pt-[90px]">{children}</div>
      </DeliveryAddressProvider>
    </RestaurantProvider>
  )
}
