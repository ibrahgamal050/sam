import { z } from "zod"
import { Types } from "mongoose"

/**
 * ObjectId validator
 */
export const objectId = () =>
  z.string().refine((v) => Types.ObjectId.isValid(v), {
    message: "Invalid ObjectId",
  })

/**
 * Incoming public order schema
 * (used by Public Orders API)
 */
export const IncomingOrderSchema = z.object({
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
          coordinates: z
            .tuple([z.number(), z.number()]) // [lng, lat]
            .optional(),
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

/**
 * Types
 */
export type IncomingOrderDTO = z.infer<typeof IncomingOrderSchema>

/**
 * Helpers (optional – useful in services)
 */
export type OrderType = IncomingOrderDTO["type"]
export type PaymentMethod = IncomingOrderDTO["payment"]["method"]
