import mongoose from 'mongoose'
import { dbConnect } from '@/lib/db'
import Order from '@/models/order'
import type { IOrder, IOrderItem } from '@/types'

export async function createOrder(data: {
  restaurantId: string
  userId?: string | null
  guest?: IOrder['guest']
  items: Array<{ productId: string; name: string; quantity: number; price: number }>
  totalPrice?: number
}): Promise<IOrder> {
  await dbConnect()

  const { restaurantId, userId = null, guest, items } = data
  if (!restaurantId) throw new Error('restaurantId is required')
  if (!Array.isArray(items) || items.length === 0) throw new Error('items are required')

  const rid = new mongoose.Types.ObjectId(restaurantId)
  const uid = userId ? new mongoose.Types.ObjectId(userId) : null

  // Sanitize items and compute total on server
  const cleanItems: IOrderItem[] = items.map((it) => {
    if (!mongoose.isValidObjectId(it.productId)) {
      throw new Error('Invalid productId in items')
    }
    return {
      productId: new mongoose.Types.ObjectId(it.productId),
      name: it.name,
      quantity: Math.max(1, Math.floor(it.quantity)),
      price: Number(it.price) || 0,
    }
  })

  const totalPrice = cleanItems.reduce((s, i) => s + i.price * i.quantity, 0)

  const order = await Order.create({
    restaurantId: rid,
    userId: uid,
    guest,
    items: cleanItems,
    totalPrice,
    status: 'pending',
  })

  return order.toObject() as IOrder
}

export async function getOrdersByRestaurantId(restaurantId: string): Promise<IOrder[]> {
  await dbConnect()
  const rid = new mongoose.Types.ObjectId(restaurantId)
  const orders = await Order.find({ restaurantId: rid }).sort({ createdAt: -1 }).lean()
  return orders as unknown as IOrder[]
}

export async function updateOrderStatus(id: string, status: IOrder['status']) {
  await dbConnect()
  if (!mongoose.isValidObjectId(id)) throw new Error('Invalid order id')
  const updated = await Order.findByIdAndUpdate(id, { status }, { new: true }).lean()
  return updated as unknown as IOrder | null
}
