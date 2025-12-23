import { Types } from "mongoose"
import Menu from "@/models/menu"

export type IncomingItem = {
  productId: string
  name: string
  quantity: number
}

export type FlatItem = {
  _id: Types.ObjectId
  name: { ar?: string; en?: string }
  price?: number
  sizes?: Array<{ _id?: any; name?: { ar?: string; en?: string }; price: number }>
  isAvailable?: boolean
  stock?: number | null
}

export type NormalizedItem = {
  productId: Types.ObjectId
  name: string
  quantity: number
  price: number
  total: number
}

export function resolveUnitPrice(mi: FlatItem): number {
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

export async function fetchMenuItemsByIds(restaurantId: Types.ObjectId, productIds: Types.ObjectId[]) {
  return Menu.aggregate<FlatItem>([
    { $match: { restaurantId } },
    { $unwind: "$categories" },
    { $unwind: "$categories.menuItems" },
    { $match: { "categories.menuItems._id": { $in: productIds } } },
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
}

export async function normalizeOrderItems(params: {
  restaurantId: Types.ObjectId
  items: IncomingItem[]
}) {
  const { restaurantId, items } = params

  const uniqueProductIds = Array.from(new Set(items.map((i) => String(i.productId))))
  const productObjectIds = uniqueProductIds.map((id) => new Types.ObjectId(id))

  const menuItems = await fetchMenuItemsByIds(restaurantId, productObjectIds)
  const itemMap = new Map<string, FlatItem>()
  for (const mi of menuItems) itemMap.set(String(mi._id), mi)

  let subtotal = 0

  const normalizedItems: NormalizedItem[] = items.map((i) => {
    const db = itemMap.get(String(i.productId))
    if (!db) {
      const err: any = new Error(`Item not found: ${i.productId}`)
      err.status = 404
      err.code = "ITEM_NOT_FOUND"
      throw err
    }

    const nameResolved = db.name?.ar || db.name?.en || i.name || "Item"

    if (db.isAvailable === false) {
      const err: any = new Error(`Item unavailable: ${i.productId}`)
      err.status = 409
      err.code = "ITEM_UNAVAILABLE"
      throw err
    }

    const qty = Number(i.quantity ?? 0)

    if (Number.isFinite(db.stock) && typeof db.stock === "number" && db.stock >= 0 && qty > db.stock) {
      const err: any = new Error(`Item out of stock: ${i.productId}`)
      err.status = 409
      err.code = "ITEM_OUT_OF_STOCK"
      err.details = { requested: qty, available: db.stock }
      throw err
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

  return { normalizedItems, subtotal }
}
