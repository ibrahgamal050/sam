// src/types/order.ts
import type { Types, HydratedDocument, Model } from 'mongoose'

/* =========================
   Enums
   ========================= */
export type OrderType = 'DELIVERY' | 'PICKUP'
export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PREPARING' | 'ON_THE_WAY' | 'DELIVERED' | 'CANCELLED'
export type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

/* =========================
   Subdocuments
   ========================= */
export interface OrderItem {
  productId: Types.ObjectId
  name: string
  quantity: number
  price: number
  total: number
}

export interface CustomerLocation {
  type?: 'Point'
  coordinates?: [number, number] // [lng, lat]
}

export interface Customer {
  name?: string
  phone?: string
  email?: string
  address?: string
  location?: CustomerLocation
  apt?: string
  intercom?: string
  entrance?: string
  floor?: string
}

export interface Pricing {
  subtotal: number
  deliveryFee?: number
  tax?: number
  discount?: number
  total: number
}

export interface Payment {
  method: PaymentMethod
  status?: PaymentStatus
  provider?: string
  initUrl?: string
}

/* =========================
   Order Document
   ========================= */
export interface Order {
  _id: Types.ObjectId
  restaurantId: Types.ObjectId
  branchId?: Types.ObjectId
  userId?: Types.ObjectId
  type: OrderType

  customer?: Customer
  items: OrderItem[]

  pricing: Pricing
  payment: Payment

  notes?: string
  meta?: Record<string, any>

  status: OrderStatus

  createdAt: Date
  updatedAt: Date
}

/* =========================
   Mongoose Types
   ========================= */
export type OrderDoc = HydratedDocument<Order>
export type OrderLean = Omit<Order, '_id' | 'restaurantId' | 'branchId' | 'userId'> & {
  _id: string
  restaurantId: string
  branchId?: string
  userId?: string
}
export interface OrderModel extends Model<Order> {}

/* =========================
   DTOs (API / Service Contracts)
   ========================= */

// ما تبعته من العميل/الخدمة لإنشاء طلب جديد
export interface CreateOrderItemDTO {
  productId: string // ObjectId as string
  name: string
  quantity: number
  price: number
  total?: number // اختياري؛ السيرفر ممكن يحسبه = price * quantity
}

export interface CreateOrderCustomerDTO extends Omit<Customer, 'location'> {
  location?: {
    type?: 'Point'
    coordinates?: [number, number]
  }
}

export interface CreateOrderPricingDTO {
  subtotal: number
  deliveryFee?: number
  tax?: number
  discount?: number
  total: number
}

export interface CreateOrderPaymentDTO {
  method: PaymentMethod
  status?: PaymentStatus
  provider?: string
  initUrl?: string
}

export interface CreateOrderDTO {
  restaurantId: string
  branchId?: string
  userId?: string
  type: OrderType

  customer?: CreateOrderCustomerDTO
  items: CreateOrderItemDTO[]

  pricing: CreateOrderPricingDTO
  payment: CreateOrderPaymentDTO

  notes?: string
  meta?: Record<string, any>
}

// ما ترجّعه خدمة الإنشاء
export interface CreateOrderResult {
  _id: string
  data: OrderLean
}

/* =========================
   Helpers
   ========================= */

// حارس بسيط لصلاحية ObjectId (24 hex)
export const isObjectIdString = (v?: string): v is string =>
  !!v && /^[0-9a-fA-F]{24}$/.test(v)
