import type { Types } from 'mongoose'

export interface IOrderItem {
  productId: Types.ObjectId | string
  name: string
  quantity: number
  price: number
}

export interface IGuestInfo {
  name?: string
  phone?: string
  email?: string
  address?: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled'

export interface IOrder {
  _id?: Types.ObjectId
  restaurantId: Types.ObjectId
  userId?: Types.ObjectId | null
  guest?: IGuestInfo
  items: IOrderItem[]
  totalPrice: number
  status: OrderStatus
  createdAt?: Date
  updatedAt?: Date
}

