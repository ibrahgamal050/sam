// src/app/api/v1/public/orders/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@/lib/auth/auth-server"
import { z } from "zod"
import { Types, startSession } from "mongoose"

import Restaurant from "@/models/restaurant"
import Menu from "@/models/menu"
import Order from "@/models/order"
import OrderSettings from "@/models/OrderSettings"
import { emitOrderEvent } from "@/lib/orderEvents"

// ---------------- Helpers ----------------
const objectId = () =>
  z.string().refine((v) => Types.ObjectId.isValid(v), { message: "Invalid ObjectId" })

type ErrorCode =
  | "UNAUTHORIZED"
  | "INVALID_DATA"
  | "RESTAURANT_NOT_FOUND"
  | "ITEM_NOT_FOUND"
  | "DELIVERY_NOT_ALLOWED"
  | "PAYMENT_METHOD_NOT_ALLOWED"
  | "ORDER_TYPE_NOT_ALLOWED"
  | "INTERNAL_ERROR"
  | "ITEM_UNAVAILABLE"
  | "ITEM_OUT_OF_STOCK"

const err = (status: number, code: ErrorCode, message: string, details?: any) =>
  NextResponse.json({ error: { code, message, details } }, { status })

// OrderSettings defaults
const DEFAULT_SETTINGS = {
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

function withDefaults(doc: any | null) {
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

// enums mapping مقترحة من الفرونت → backend lowercase
const TYPE_MAP: Record<string, string> = { DELIVERY: "delivery", PICKUP: "pickup" }
const STATUS_MAP: Record<string, string> = { PENDING: "pending" }
const PMAP: Record<string, string> = { CASH: "cash", CARD: "card", ONLINE: "online" }

// --------- Zod Schema للبيانات القادمة ----------
const IncomingOrderSchema = z.object({
  restaurantId: objectId(),
  type: z.enum(["DELIVERY", "PICKUP"]),
  userId: objectId().optional(),
  customer: z
    .object({
      name: z.string().min(1).max(200),
      phone: z.string().min(3).max(50),
      address: z.string().min(0).max(500).optional(),
      email: z.string().email().optional(),
      location: z
        .object({
          type: z.literal("Point").optional(),
          coordinates: z.tuple([z.number(), z.number()]).optional(), // [lng, lat]
        })
        .optional(),
    })
    .optional(),
  items: z
    .array(
      z.object({
        productId: objectId(),
        name: z.string().min(1).max(200),
        qty: z.number().int().min(1).max(50),
      })
    )
    .min(1),
  payment: z.object({
    method: z.enum(["CASH", "CARD", "ONLINE"]),
  }),
  meta: z.record(z.any()).optional(),
})

// -------- أدوات تشخيص أخطاء المونجوز --------
function formatMongooseValidation(err: any) {
  try {
    const fields = Object.fromEntries(
      Object.entries(err?.errors || {}).map(([k, v]: any) => [k, v?.message || String(v)])
    )
    return { message: err?._message || err?.message || "validation error", fields }
  } catch {
    return { message: String(err?.message || err) }
  }
}
const hasPath = (p: string) => Boolean((Order as any)?.schema?.path?.(p))
const choose = (...candidates: string[]) => candidates.find(hasPath)!
function enumOf(path: string) {
  const p: any = (Order as any)?.schema?.path?.(path)
  return Array.isArray(p?.enumValues) ? (p.enumValues as string[]) : undefined
}

// ---------------- Route ----------------
export async function POST(req: NextRequest) {
  try {
    // Auth (اختياري)
    const { userId: userIdFromToken } = await getAuth(req)

    // Parse & Validate
    const body = await req.json()
    const parsed = IncomingOrderSchema.safeParse(body)
    if (!parsed.success) {
      return err(422, "INVALID_DATA", "Invalid order payload", parsed.error.flatten())
    }

    const incoming = parsed.data
    const restaurantId = incoming.restaurantId
    const type = incoming.type

    const userIdFinal =
      (userIdFromToken && Types.ObjectId.isValid(userIdFromToken) ? userIdFromToken : null) ||
      (incoming.userId && Types.ObjectId.isValid(incoming.userId) ? incoming.userId : null)

    const addrLine = type === "DELIVERY" ? (incoming.customer?.address || "").trim() : ""
    const address =
      type === "DELIVERY" && addrLine.length >= 3
        ? {
            line1: addrLine,
            lng: incoming.customer?.location?.coordinates?.[0] ?? undefined,
            lat: incoming.customer?.location?.coordinates?.[1] ?? undefined,
          }
        : undefined

    const items = incoming.items.map((i) => ({
      productId: i.productId,
      name: i.name,
      quantity: i.qty,
    }))

    // ---------------- Fetch restaurant & settings ----------------
    const restaurant = await Restaurant.findById(restaurantId).lean()
    if (!restaurant) {
      return err(404, "RESTAURANT_NOT_FOUND", "Restaurant not found")
    }

    const settingsDoc = await OrderSettings.findOne({ restaurantId: restaurant._id }).lean()
    const settings = withDefaults(settingsDoc)

    // Allowed order type
    if (type === "DELIVERY" && !(settings.types?.delivery && settings.delivery?.enabled)) {
      return err(400, "DELIVERY_NOT_ALLOWED", "Delivery not available for this restaurant")
    }
    if (type === "PICKUP" && !settings.types?.pickup) {
      return err(400, "ORDER_TYPE_NOT_ALLOWED", "Pickup not available for this restaurant")
    }

    // Allowed payment method
    const pm = incoming.payment?.method
    if (pm === "ONLINE" && !settings.paymentMethods.online) {
      return err(400, "PAYMENT_METHOD_NOT_ALLOWED", "Online payments are disabled")
    }
    if (pm === "CARD" && !settings.paymentMethods.card) {
      return err(400, "PAYMENT_METHOD_NOT_ALLOWED", "Card payments are disabled")
    }
    if (pm === "CASH" && !settings.paymentMethods.cash) {
      return err(400, "PAYMENT_METHOD_NOT_ALLOWED", "Cash payments are disabled")
    }

    // ---------------- Fetch items from embedded Menu ----------------
    type FlatItem = {
      _id: Types.ObjectId
      name: { ar?: string; en?: string }
      price?: number
      sizes?: Array<{ _id?: any; name?: { ar?: string; en?: string }; price: number }>
      isAvailable?: boolean
      stock?: number | null
    }

    const uniqueProductIds = Array.from(new Set(items.map((i) => String(i.productId))))
    const productObjectIds = uniqueProductIds.map((id) => new Types.ObjectId(id))

    const menuItems = await Menu.aggregate<FlatItem>([
      { $match: { restaurantId: restaurant._id } },
      { $unwind: "$categories" },
      { $unwind: "$categories.menuItems" },
      { $match: { "categories.menuItems._id": { $in: productObjectIds } } },
      {
        $project: {
          _id: "$categories.menuItems._id",
          name: "$categories.menuItems.name",
          price: "$categories.menuItems.price",
          sizes: "$categories.menuItems.sizes",
          isAvailable: "$categories.menuItems.isAvailable",
          stock: "$categories.menuItems.stock",
        },
      },
    ])

    const itemMap = new Map<string, FlatItem>()
    for (const mi of menuItems) {
      itemMap.set(String(mi._id), mi)
    }

    function resolveUnitPrice(mi: FlatItem): number {
      if (typeof mi.price === "number" && Number.isFinite(mi.price)) return Number(mi.price)
      if (Array.isArray(mi.sizes) && mi.sizes.length > 0) {
        const prices = mi.sizes
          .map((s) => Number(s.price))
          .filter((p) => Number.isFinite(p))
          .sort((a, b) => a - b)
        if (prices.length) return prices[0]
      }
      return 0
    }

    let subtotal = 0
    const normalizedItems = items.map((i) => {
      const db = itemMap.get(String(i.productId))
      if (!db) {
        throw { status: 404, code: "ITEM_NOT_FOUND", message: `Item not found: ${i.productId}` }
      }

      const nameResolved = db.name?.ar || db.name?.en || i.name || "Item"
      if (db.isAvailable === false) {
        throw {
          status: 409,
          code: "ITEM_UNAVAILABLE",
          message: `Item unavailable: ${i.productId}`,
        }
      }
      const qty = Number(i.quantity ?? 0)
      if (Number.isFinite(db.stock) && typeof db.stock === "number" && db.stock >= 0 && qty > db.stock) {
        throw {
          status: 409,
          code: "ITEM_OUT_OF_STOCK",
          message: `Item out of stock: ${i.productId}`,
          details: { requested: qty, available: db.stock },
        }
      }
      const unitPrice = resolveUnitPrice(db)
      const lineTotal = unitPrice * qty
      subtotal += lineTotal

      return {
        productId: new Types.ObjectId(i.productId),
        name: nameResolved,
        quantity: qty,
        price: unitPrice,
        total: lineTotal,
      }
    })

    // ---------------- Totals ----------------
    const minOrder = Number(settings.minOrderAmount ?? 0)
    if (minOrder > 0 && subtotal < minOrder) {
      return err(400, "INVALID_DATA", `Minimum order is ${minOrder}`)
    }

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

    if (type === "DELIVERY") {
      if (!address?.line1 || address.line1.trim().length < 3) {
        return err(422, "INVALID_DATA", "Address is required for delivery (min 3 chars)")
      }
    }

    // ---------------- تكيّف تلقائي مع سكيمة Order ----------------
    const fieldRestaurant = choose("restaurantId", "restaurant")
    const fieldUser = choose("userId", "user")
    const fieldTotal = choose("totalPrice", "total")
    const fieldSubtotal = choose("subtotal")
    const fieldStatus = choose("status")
    const fieldType = choose("type")
    const fieldPaymentMethod = choose("payment.method")
    const fieldAddress = choose("address", "shippingAddress")

    const typeEnums = enumOf(fieldType) || ["delivery", "pickup"]
    const statusEnums = enumOf(fieldStatus) || ["pending", "paid", "cancelled", "rejected", "completed"]
    const pmEnums = enumOf("payment.method") || ["cash", "card", "online"]

    const typeFinal =
      typeEnums.includes(TYPE_MAP[type] ?? "") ? (TYPE_MAP[type] as string) : (typeEnums[0] as string)

    const statusFinal =
      statusEnums.includes("pending") ? "pending" : (statusEnums[0] as string)

    const paymentMethodFinal =
      pmEnums.includes(PMAP[incoming.payment?.method] ?? "")
        ? (PMAP[incoming.payment?.method] as string)
        : (pmEnums[0] as string)

    // ---------------- Create order ----------------
    const mongoSession = await startSession()
    let createdOrder: any
    try {
      await mongoSession.withTransaction(async () => {
        const docToCreate: any = {
          [fieldRestaurant]: restaurant._id,
          [fieldType]: typeFinal,
          [fieldStatus]: statusFinal,

          items: normalizedItems,

          // amounts في الجذر
          [fieldSubtotal]: subtotal,
          tax,
          serviceFee,
          deliveryFee,
          [fieldTotal]: total,

          payment: {
            method: paymentMethodFinal,
          },

          [fieldAddress]: address ?? null,

          [fieldUser]: userIdFinal ? new Types.ObjectId(userIdFinal) : null,

          customer: incoming.customer
            ? {
                name: incoming.customer.name,
                phone: incoming.customer.phone,
                email: incoming.customer.email ?? null,
              }
            : null,

          meta: {
            ...(incoming.meta || {}),
            userAgent: req.headers.get("user-agent") || "",
          },
        }

        createdOrder = await Order.create([docToCreate], { session: mongoSession })
      })
    } finally {
      await mongoSession.endSession()
    }

    const order = createdOrder?.[0]
    if (order) {
      emitOrderEvent(String(restaurant._id), "order.created", { orderId: String(order._id) })
    }
    return NextResponse.json(
      {
        data: {
          id: String(order._id),
          status: order[fieldStatus],
          type: order[fieldType],
          items: order.items.map((i: any) => ({
            productId: String(i.productId),
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            total: i.total,
          })),
          payment: order.payment,
          amounts: {
            subtotal: order[fieldSubtotal],
            tax: order.tax,
            serviceFee: order.serviceFee,
            deliveryFee: order.deliveryFee,
            total: order[fieldTotal],
          },
          customer: order.customer || null,
          address: order[fieldAddress] || null,
          userId: order[fieldUser] ? String(order[fieldUser]) : null,
          createdAt: order.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (e: any) {
    if (e?.name === "ValidationError") {
      console.error("[orders:create] validation errors:", formatMongooseValidation(e))
      return err(422, "INVALID_DATA", "Order validation failed", formatMongooseValidation(e))
    }
    if (e?.code && e?.status) {
      return err(e.status, e.code as ErrorCode, e.message)
    }
    console.error("[orders:create] unexpected", e)
    return err(500, "INTERNAL_ERROR", "Unexpected server error")
  }
}
