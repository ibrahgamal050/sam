import type { ReactNode } from "react"
import { CartProvider } from "@/contexts/cart-context"
import { DeliveryAddressProvider } from "@/contexts/delivery-address-context"
import { RestaurantProvider } from "@/contexts/restaurant-context"
import { resolveRestaurantFromHeaders } from "@/lib/domain/restaurant-context"
import { extractPlatformSubdomain, getRootDomain } from "@/lib/host-utils"
import type { IRestaurant } from "@/types/restaurant"
import { MainNav } from "@/components/ar/header/main-nav"
import { MobileLayout } from "@/components/ar/mobile-layout"

const SUPPORTED_LOCALES = new Set(["ar", "en"])

type LocaleLayoutProps = {
  children: ReactNode
  params: Promise<{
    lng: string
  }>
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { lng } = await params
  const locale = lng?.toLowerCase?.() ?? "ar"
  if (!SUPPORTED_LOCALES.has(locale)) {
    return <>{children}</>
  }

  let typedRestaurant: IRestaurant | null = null
  let resolvedSubdomain: string | null = null
  try {
    const { restaurant, hostname } = await resolveRestaurantFromHeaders()
    typedRestaurant = (restaurant as IRestaurant) ?? null
    const rootDomain = getRootDomain()
    resolvedSubdomain = typedRestaurant?.subdomain ?? extractPlatformSubdomain(hostname, rootDomain) ?? null
  } catch (error) {
    console.warn("[layout] failed to resolve restaurant from headers:", error)
    typedRestaurant = null
    resolvedSubdomain = null
  }

  const direction = locale === "ar" ? "rtl" : "ltr"

  return (
    <RestaurantProvider initialRestaurant={typedRestaurant} initialSubdomain={resolvedSubdomain}>
      <DeliveryAddressProvider>
        <CartProvider>
          
             
          
          <div className="  flex min-h-screen flex-col" dir={direction}>

            <div className="block lg:hidden">
             {children}
            </div>
            <div className="hidden lg:block flex-1">{children}</div>
           
          </div>
        </CartProvider>
      </DeliveryAddressProvider>
    </RestaurantProvider>
  )
}
