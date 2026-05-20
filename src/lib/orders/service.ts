import Restaurant from "@/models/restaurant"
import Order from "@/models/order"

import mongoose from "mongoose"
import { loadOrderSettings, assertOrderTypeAllowed, assertPaymentAllowed } from "./settings.service"
import { normalizeOrderItems } from "./items.service"
import { assertMinOrder, calculateTotals, assertDeliveryAddress } from "./pricing.service"
import { generateOrderNumberRandom } from "@/lib/orders/order-number.service"

export async function createPublicOrderService(params: {
  restaurantId: string
  type: "DELIVERY" | "PICKUP"
  pm: "CASH" | "CARD" | "ONLINE"
  addrLine?: string
  deliveryZoneId?: string
  items: Array<{ productId: string; name: string; qty?: number; quantity?: number }>
  customer?: { name?: string; phone?: string; address?: string }
}) {
  const { restaurantId, type, pm, addrLine, items, customer, deliveryZoneId } = params

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

  let resolvedBranchId: string | undefined
  let resolvedDeliveryFee: number | undefined

  if (type === "DELIVERY" && deliveryZoneId && mongoose.isValidObjectId(deliveryZoneId)) {
    const DeliveryZoneLegacy = (await import("@/models/delivery-zone-legacy")).default
    const zone = await DeliveryZoneLegacy.findById(deliveryZoneId).lean()
    if (zone) {
      resolvedBranchId = zone.branchId ? zone.branchId.toString() : undefined
      resolvedDeliveryFee = typeof zone.delivery_fee === "number" ? zone.delivery_fee : undefined
    }
  }

  const orderNumber = await generateOrderNumberRandom(restaurantId)
  console.log("orderNumber"+ orderNumber )

  const typeDb = type === "DELIVERY" ? "delivery" : "pickup"
  const pmDb = pm === "CASH" ? "cash" : pm === "CARD" ? "card" : "online"
console.log("[Order model file]", Order?.modelName)
console.log("[Schema has orderNumber?]", Boolean((Order as any).schema?.path("orderNumber")))

  const deliveryFeeFinal = typeDb === "delivery" ? (resolvedDeliveryFee ?? totals.deliveryFee ?? 0) : 0
  const totalPriceFinal = totals.total - (totals.deliveryFee ?? 0) + deliveryFeeFinal

  const created = await Order.create({
    orderNumber,
    restaurantId: (restaurant as any)._id,
    branchId: resolvedBranchId,
    deliveryZoneId: deliveryZoneId && mongoose.isValidObjectId(deliveryZoneId) ? deliveryZoneId : undefined,
    type: typeDb,
    customer: {
      name: customer?.name,
      phone: customer?.phone,
      address: typeDb === "delivery" ? effectiveAddrLine : undefined,
    },
    items: normalizedItems,
    subtotal,
    deliveryFee: deliveryFeeFinal,
    totalPrice: totalPriceFinal,
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
