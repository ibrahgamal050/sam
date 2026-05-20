export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth"
import { resolveRestaurantFromHeaders } from "@/lib/domain/restaurant-context"
import { getOrdersForCustomer } from "@/lib/services/order-service"
import { getPageBySlug } from "@/lib/services/page-service"
import { getPageBuilderSections, sortSections } from "@/lib/builder-sections"
import { renderSection } from "@/lib/builder"
import { DEFAULT_ORDERS_SECTIONS, DEFAULT_ORDERS_THEME } from "@/lib/builder/orders-page"
import type { IRestaurant } from "@/types/restaurant"
import type { OrderStatus } from "@/types/order"
import type { Section } from "@/types/builder"
import OrdersClient from "./OrdersClient"

export type OrdersUIItem = {
  id: string
  branchId?: string
  status: OrderStatus
  totalPrice: number
  createdAtISO: string | null
  guest: { name: string; phone: string; address: string }
  items: { id: string; name: string; quantity: number; price: number }[]
  orderNumber?: string
}

type Locale = "ar" | "en"

const resolveLocale = (value?: string): Locale => {
  if (!value) return "ar"
  const normalized = value.toLowerCase()
  return normalized === "en" ? "en" : "ar"
}

export default async function OrdersPage({ params }: { params: Promise<{ lng?: string }> }) {
  const { lng } = await params
  const locale = resolveLocale(lng)
  const session = await getServerSession()
  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/${locale}/orders`)}`)
  }

  const { restaurant } = await resolveRestaurantFromHeaders()
  const typedRestaurant = restaurant as IRestaurant | null

  if (!typedRestaurant) {
    return <div className="p-6 text-center text-gray-600">المطعم غير موجود أو غير متاح حالياً.</div>
  }

  const rawOrdersRes = await getOrdersForCustomer({
    userId: session.user.id,
    restaurantId: typedRestaurant._id?.toString(),
    select: "full",
    sort: "newest" 
  })
  console.log(rawOrdersRes)
  const safeOrders = Array.isArray((rawOrdersRes as any)?.data) ? ((rawOrdersRes as any).data as any[]) : []
  const orders: OrdersUIItem[] = safeOrders.map((order) => ({
    id: order._id?.toString() ?? order.id ?? "",
    branchId: order.branchId ? order.branchId.toString() : undefined,
    status: order.status,
    totalPrice: Number(order.totalPrice ?? 0),
    createdAtISO: order.createdAt ? new Date(order.createdAt).toISOString() : null,
    guest: {
      name: order.guest?.name ?? session.user?.name ?? "",
      phone: order.guest?.phone ?? "",
      address: order.guest?.address ?? "",
    },
    items: (order.items ?? []).map((item) => ({
      id: typeof item.productId === "string" ? item.productId : item.productId?.toString?.() ?? "",
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    orderNumber: order.orderNumber ?? order.orderId ?? order._id?.toString() ?? "",
  }))

  const restaurantId = typedRestaurant._id?.toString()
  const builderPage = restaurantId ? await getPageBySlug(restaurantId, "orders", locale) : null
  const builderSections = getPageBuilderSections(builderPage) ?? DEFAULT_ORDERS_SECTIONS
  const builderTheme = builderPage?.theme ?? DEFAULT_ORDERS_THEME
  const hasBuilder = builderSections?.length > 0
  const orderedSections: Section[] = hasBuilder ? sortSections(builderSections) : DEFAULT_ORDERS_SECTIONS
  const direction = locale === "ar" ? "rtl" : "ltr"
  const accent = builderTheme?.palette?.primary ?? "#16a34a"

  if (hasBuilder) {
    return (
      <main dir={direction} className="min-h-screen bg-neutral-50 text-stone-900">
        <div className="h-1 w-full" style={{ backgroundColor: accent }} />
        {orderedSections.map((section) =>
          renderSection(section, {
            theme: builderTheme,
            dataSources: { orders, restaurant: typedRestaurant },
            locale,
          })
        )}
      </main>
    )
  }

  return <OrdersClient restaurantName={typedRestaurant.name?.ar ?? "مطعمنا"} orders={orders} />
}
