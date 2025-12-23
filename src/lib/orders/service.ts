import Restaurant from "@/models/restaurant"
import Order from "@/models/order"

import { loadOrderSettings, assertOrderTypeAllowed, assertPaymentAllowed } from "./settings.service"
import { normalizeOrderItems } from "./items.service"
import { assertMinOrder, calculateTotals, assertDeliveryAddress } from "./pricing.service"
import { generateOrderNumberRandom } from "@/lib/orders/order-number.service"

export async function createPublicOrderService(params: {
  restaurantId: string
  type: "DELIVERY" | "PICKUP"
  pm: "CASH" | "CARD" | "ONLINE"
  addrLine?: string
  items: Array<{ productId: string; name: string; qty?: number; quantity?: number }>
  customer?: { name?: string; phone?: string; address?: string }
}) {
  const { restaurantId, type, pm, addrLine, items, customer } = params

  const restaurant = await Restaurant.findById(restaurantId).lean()
  if (!restaurant) {
    const err: any = new Error("Restaurant not found")
    err.status = 404
    err.code = "RESTAURANT_NOT_FOUND"
    throw err
  }

  const settings = await loadOrderSettings((restaurant as any)._id)

  assertOrderTypeAllowed(type, settings)
  assertPaymentAllowed(pm, settings)

  const effectiveAddrLine =
    type === "DELIVERY" ? (addrLine?.trim() || customer?.address?.trim() || "") : ""

  assertDeliveryAddress(type, effectiveAddrLine)

  const itemsFixed = items.map((i: any) => ({
    productId: i.productId,
    name: i.name,
    quantity: Number(i.quantity ?? i.qty ?? 0),
  }))

  const { normalizedItems, subtotal } = await normalizeOrderItems({
    restaurantId: (restaurant as any)._id,
    items: itemsFixed,
  })

  assertMinOrder(subtotal, settings)

  const totals = calculateTotals({ subtotal, type, restaurant, settings })

  const orderNumber = await generateOrderNumberRandom(restaurantId)
  console.log("orderNumber"+ orderNumber )

  const typeDb = type === "DELIVERY" ? "delivery" : "pickup"
  const pmDb = pm === "CASH" ? "cash" : pm === "CARD" ? "card" : "online"
console.log("[Order model file]", Order?.modelName)
console.log("[Schema has orderNumber?]", Boolean((Order as any).schema?.path("orderNumber")))

  const created = await Order.create({
    orderNumber,
    restaurantId: (restaurant as any)._id,
    type: typeDb,
    customer: {
      name: customer?.name,
      phone: customer?.phone,
      address: typeDb === "delivery" ? effectiveAddrLine : undefined,
    },
    items: normalizedItems,
    subtotal,
    deliveryFee: totals.deliveryFee,
    totalPrice: totals.total,
    payment: { method: pmDb, status: "unpaid" },
    status: "pending",
  })

  return {
    id: String(created._id),
    orderNumber: created.orderNumber,
    status: created.status,
    totals,
  }
}
