export type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE'
export type OrderType = 'DELIVERY' | 'PICKUP'

export type OrderSettingsDTO = {
  minOrderAmount: number
  deliveryFeeFixed: number
  freeDeliveryThreshold?: number
  defaultPreparationMinutes: number
  allowPickup: boolean
  allowDelivery: boolean
  paymentMethods: PaymentMethod[]
  taxRate?: number // 0.14 = 14%
}