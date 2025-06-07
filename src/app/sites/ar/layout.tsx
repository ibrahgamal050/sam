import type React from "react"
import { Inter, Amiri } from "next/font/google"
import "@/app/globals.css"
import { RestaurantProvider } from "@/contexts/restaurant-context"
import { MobileLayout } from "@/components/ar/mobile-layout"
import { Footer } from "@/components/ar/footer"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const amiri = Amiri({
  subsets: ["arabic"],
  variable: "--font-amiri",
  weight: ["400", "700"],
  display: "swap",
})

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
}

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable} ${amiri.variable}`} suppressHydrationWarning>
        <RestaurantProvider>
            <div className="block lg:hidden"> {/* شاشات صغيرة */}
              <MobileLayout>
                {children}
              </MobileLayout>
            </div>
            <div className="hidden lg:block"> {/* شاشات كبيرة */}
                {children}
            </div>
            <Footer />
        </RestaurantProvider>
      </body>
    </html>
  )
}
