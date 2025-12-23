export function assertMinOrder(subtotal: number, settings: any) {
  const minOrder = Number(settings.minOrderAmount ?? 0)
  if (minOrder > 0 && subtotal < minOrder) {
    const err: any = new Error(`Minimum order is ${minOrder}`)
    err.status = 400
    err.code = "INVALID_DATA"
    throw err
  }
}

export function calculateTotals(params: {
  subtotal: number
  type: "DELIVERY" | "PICKUP"
  restaurant: any
  settings: any
}) {
  const { subtotal, type, restaurant, settings } = params

  const taxPct = Number(restaurant.taxes?.percentage ?? 0)
  const tax = Math.round(subtotal * (taxPct / 100) * 100) / 100

  const serviceFee = Number(restaurant.serviceFee ?? 0)

  let deliveryFee = 0
  if (type === "DELIVERY" && settings.delivery?.enabled) {
    deliveryFee = Number(settings.delivery.baseFee ?? 0)
    const freeAbove = settings.delivery.freeDeliveryAbove
    if (typeof freeAbove === "number" && subtotal >= freeAbove) deliveryFee = 0
  }

  const total = Math.round((subtotal + tax + serviceFee + deliveryFee) * 100) / 100

  return { tax, serviceFee, deliveryFee, total }
}

export function assertDeliveryAddress(type: "DELIVERY" | "PICKUP", addressLine?: string) {
  if (type !== "DELIVERY") return
  if (!addressLine || addressLine.trim().length < 3) {
    const err: any = new Error("Address is required for delivery (min 3 chars)")
    err.status = 422
    err.code = "INVALID_DATA"
    throw err
  }
}
