import mongoose from "mongoose"
import { dbConnect } from "@/lib/db"
import Order from "@/models/order"
import type { IOrder, IOrderItem } from "@/types"

const ALLOWED_STATUSES: IOrder["status"][] = ["pending", "confirmed", "preparing", "delivered", "cancelled"]

function toObjectId(id: string, fieldName = "id") {
  if (!mongoose.isValidObjectId(id)) throw new Error(`Invalid ${fieldName}`)
  return new mongoose.Types.ObjectId(id)
}

function sanitizeItems(items: Array<{ productId: string; name: string; quantity: number; price: number }>): IOrderItem[] {
  if (!Array.isArray(items) || items.length === 0) throw new Error("items are required")

  return items.map((it) => {
    if (!mongoose.isValidObjectId(it.productId)) throw new Error("Invalid productId in items")

    return {
      productId: new mongoose.Types.ObjectId(it.productId),
      name: String(it.name ?? "").trim(),
      quantity: Math.max(1, Math.floor(Number(it.quantity) || 1)),
      price: Math.max(0, Number(it.price) || 0),
    }
  })
}

export async function createOrder(data: {
  restaurantId: string
  userId?: string | null
  guest?: IOrder["guest"]
  items: Array<{ productId: string; name: string; quantity: number; price: number }>
}): Promise<IOrder> {
  await dbConnect()

  const rid = toObjectId(data.restaurantId, "restaurantId")
  const uid = data.userId ? toObjectId(data.userId, "userId") : null

  const cleanItems = sanitizeItems(data.items)
  const totalPrice = cleanItems.reduce((s, i) => s + i.price * i.quantity, 0)

  const order = await Order.create({
    restaurantId: rid,
    userId: uid,
    guest: data.guest,
    items: cleanItems,
    totalPrice,
    status: "pending",
  })

  return order.toObject() as IOrder
}

/**
 * ✅ Admin / Restaurant view with pagination + optional status filter
 */
export async function getOrdersByRestaurantId(params: {
  restaurantId: string
  page?: number
  limit?: number
  status?: IOrder["status"]
  from?: string | Date
  to?: string | Date
  search?: string
  select?: "list" | "full"
  sort?: "newest" | "oldest"
}): Promise<{
  data: IOrder[]
  page: number
  limit: number
  total: number
}> {
  await dbConnect()

  const page = Math.max(1, Math.floor(params.page ?? 1))
  const limit = Math.min(50, Math.max(1, Math.floor(params.limit ?? 20)))
  const sortDir = params.sort === "oldest" ? 1 : -1

  const rid = toObjectId(params.restaurantId, "restaurantId")

  const filter: Record<string, any> = {
    restaurantId: rid,
  }

  // ✅ Status filter
  if (params.status) {
    if (!ALLOWED_STATUSES.includes(params.status)) {
      throw new Error("Invalid status")
    }
    filter.status = params.status
  }

  // ✅ Date range filter
  if (params.from || params.to) {
    filter.createdAt = {}
    if (params.from) filter.createdAt.$gte = new Date(params.from)
    if (params.to) filter.createdAt.$lte = new Date(params.to)
  }

  // ✅ Search (orderId / guest name / phone)
  if (params.search) {
    const q = params.search.trim()
    filter.$or = [
      { _id: mongoose.isValidObjectId(q) ? new mongoose.Types.ObjectId(q) : undefined },
      { "guest.name": { $regex: q, $options: "i" } },
      { "guest.phone": { $regex: q, $options: "i" } },
    ].filter(Boolean)
  }

  // ✅ Projection
  const projection =
    params.select === "full"
      ? undefined
      : {
          items: 1,
          totalPrice: 1,
          status: 1,
          createdAt: 1,
          guest: 1,
        }

  const [total, orders] = await Promise.all([
    Order.countDocuments(filter),
    Order.find(filter)
      .select(projection as any)
      .sort({ createdAt: sortDir })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ])

  return {
    data: orders as unknown as IOrder[],
    page,
    limit,
    total,
  }
}


/**
 * ✅ Update status with validation
 */
export async function updateOrderStatus(id: string, status: IOrder["status"]) {
  await dbConnect()

  if (!ALLOWED_STATUSES.includes(status)) throw new Error("Invalid status")
  const _id = toObjectId(id, "order id")

  const updated = await Order.findByIdAndUpdate(_id, { status }, { new: true }).lean()
  return updated as unknown as IOrder | null
}

/**
 * ✅ Customer view with pagination + light projection (better for list)
 * - Optionally filter by restaurantId
 */
export async function getOrdersForCustomer(params: {
  userId: string
  restaurantId?: string
  page?: number
  limit?: number
  status?: IOrder["status"]
  select?: "list" | "full"
  from?: string | Date
  to?: string | Date
  sort?: "newest" | "oldest"
}): Promise<{
  data: IOrder[]
  page: number
  limit: number
  total: number
}> {
  await dbConnect()

  const page = Math.max(1, Math.floor(params.page ?? 1))
  const limit = Math.min(50, Math.max(1, Math.floor(params.limit ?? 20)))
  const sortDir = params.sort === "oldest" ? 1 : -1

  // 🔐 userId لازم يكون valid
  if (!mongoose.isValidObjectId(params.userId)) {
    return { data: [], page, limit, total: 0 }
  }

  const filter: Record<string, any> = {
    userId: new mongoose.Types.ObjectId(params.userId),
  }

  // 🔐 restaurantId لو اتبعت لازم يكون valid
  if (params.restaurantId) {
    if (!mongoose.isValidObjectId(params.restaurantId)) {
      return { data: [], page, limit, total: 0 }
    }
    filter.restaurantId = new mongoose.Types.ObjectId(params.restaurantId)
  }

  // 🟡 Status filter
  if (params.status) {
    if (!ALLOWED_STATUSES.includes(params.status)) {
      throw new Error("Invalid status")
    }
    filter.status = params.status
  }

  // 🕒 Date range filter
  if (params.from || params.to) {
    filter.createdAt = {}
    if (params.from) filter.createdAt.$gte = new Date(params.from)
    if (params.to) filter.createdAt.$lte = new Date(params.to)
  }

  // 🪶 Projection (خفيف للـ list)
  const projection =
    params.select === "full"
      ? undefined
      : {
          items: 1,
          totalPrice: 1,
          status: 1,
          createdAt: 1,
          guest: 1,
          restaurantId: 1,
        }

  const [total, orders] = await Promise.all([
    Order.countDocuments(filter),
    Order.find(filter)
      .select(projection as any)
      .sort({ createdAt: sortDir })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ])

  return {
    data: orders as unknown as IOrder[],
    page,
    limit,
    total,
  }
}

/**
 * ✅ Optional: Guest orders (بدون login) بالهاتف + restaurant
 * مفيد لو عايز صفحة "طلباتي" تعتمد على رقم الموبايل
 */
export async function getOrdersForGuest(params: {
  phone: string
  restaurantId: string
  page?: number
  limit?: number
}): Promise<{ data: IOrder[]; page: number; limit: number; total: number }> {
  await dbConnect()

  const page = Math.max(1, Math.floor(params.page ?? 1))
  const limit = Math.min(50, Math.max(1, Math.floor(params.limit ?? 20)))

  const rid = toObjectId(params.restaurantId, "restaurantId")
  const phone = String(params.phone ?? "").trim()
  if (!phone) return { data: [], page, limit, total: 0 }

  const filter = { restaurantId: rid, "guest.phone": phone }

  const [total, orders] = await Promise.all([
    Order.countDocuments(filter),
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ])

  return { data: orders as unknown as IOrder[], page, limit, total }
}
