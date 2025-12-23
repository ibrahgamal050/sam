// src/lib/orders/public/errors.ts
export type ErrorCode =
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

export class OrderError extends Error {
  constructor(
    public status: number,
    public code: ErrorCode,
    message: string,
    public details?: any
  ) {
    super(message)
  }
}
