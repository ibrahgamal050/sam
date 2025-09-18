import mongoose, { Schema, type Model } from 'mongoose'
import type { IOrder } from '@/types'

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const OrderSchema = new Schema<IOrder>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    guest: {
      name: { type: String },
      phone: { type: String },
      email: { type: String },
      address: { type: String },
    },
    items: { type: [OrderItemSchema], required: true },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
)

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
export default Order

