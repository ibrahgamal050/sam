import OrderSettings from "@/models/OrderSettings"

export const DEFAULT_SETTINGS = {
  types: { dine_in: true, pickup: true, delivery: false },
  minOrderAmount: 0,
  scheduledOrders: { enabled: false, minHoursBefore: 2 },
  paymentMethods: { cash: true, card: true, online: false },
  delivery: {
    enabled: false,
    baseFee: 0,
    feePerKm: 0,
    freeDeliveryAbove: null as number | null,
    estimatedTime: "30-45 min",
  },
}

export function withDefaults(doc: any | null) {
  if (!doc) return DEFAULT_SETTINGS
  const obj = typeof doc?.toObject === "function" ? doc.toObject() : doc
  return {
    ...DEFAULT_SETTINGS,
    ...obj,
    types: { ...DEFAULT_SETTINGS.types, ...(obj?.types ?? {}) },
    scheduledOrders: { ...DEFAULT_SETTINGS.scheduledOrders, ...(obj?.scheduledOrders ?? {}) },
    paymentMethods: { ...DEFAULT_SETTINGS.paymentMethods, ...(obj?.paymentMethods ?? {}) },
    delivery: { ...DEFAULT_SETTINGS.delivery, ...(obj?.delivery ?? {}) },
  }
}

export async function loadOrderSettings(restaurantId: any) {
  const settingsDoc = await OrderSettings.findOne({ restaurantId }).lean()
  return withDefaults(settingsDoc)
}

export function assertOrderTypeAllowed(type: "DELIVERY" | "PICKUP", settings: any) {
  if (type === "DELIVERY" && !(settings.types?.delivery && settings.delivery?.enabled)) {
    const err: any = new Error("Delivery not available for this restaurant")
    err.status = 400
    err.code = "DELIVERY_NOT_ALLOWED"
    throw err
  }
  if (type === "PICKUP" && !settings.types?.pickup) {
    const err: any = new Error("Pickup not available for this restaurant")
    err.status = 400
    err.code = "ORDER_TYPE_NOT_ALLOWED"
    throw err
  }
}

export function assertPaymentAllowed(method: "CASH" | "CARD" | "ONLINE", settings: any) {
  if (method === "ONLINE" && !settings.paymentMethods.online) {
    const err: any = new Error("Online payments are disabled")
    err.status = 400
    err.code = "PAYMENT_METHOD_NOT_ALLOWED"
    throw err
  }
  if (method === "CARD" && !settings.paymentMethods.card) {
    const err: any = new Error("Card payments are disabled")
    err.status = 400
    err.code = "PAYMENT_METHOD_NOT_ALLOWED"
    throw err
  }
  if (method === "CASH" && !settings.paymentMethods.cash) {
    const err: any = new Error("Cash payments are disabled")
    err.status = 400
    err.code = "PAYMENT_METHOD_NOT_ALLOWED"
    throw err
  }
}
