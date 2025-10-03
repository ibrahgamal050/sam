import { type NextRequest, NextResponse } from "next/server"
import dbconnect from "@/lib/db"
import { User, type GlobalRole } from "@/models/User"
import { logger } from "@/lib/logger"
import mongoose from "mongoose"
import { z } from "zod"

// Validation schema for registration
const baseSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  type: z.enum(["customer", "manager"]).default("customer"),
})

const managerSchema = baseSchema.extend({
  type: z.literal("manager"),
  restaurantId: z.string().min(1, { message: "Restaurant ID is required" }),
  role: z.enum(["admin", "manager", "staff"]).default("manager"),
})

const customerSchema = baseSchema.extend({
  type: z.literal("customer"),
})

const registerSchema = z.union([managerSchema, customerSchema])

/**
 * POST handler to register a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 })
    }

    const { name, email, password, type } = result.data

    await dbconnect()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    if (type === "customer") {
      const user = new User({
        name,
        email,
        passwordHash: password,
        roles: ["customer" as GlobalRole],
      })

      await user.save()

      logger.info("Customer registered", { userId: user._id, email: user.email })

      return NextResponse.json(
        {
          id: user._id,
          name: user.name,
          email: user.email,
          roles: user.roles,
        },
        { status: 201 },
      )
    }

    const { restaurantId, role } = result.data

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return NextResponse.json({ error: "Invalid restaurant ID format" }, { status: 400 })
    }

    const roles: GlobalRole[] = ["customer"]
    if (role === "admin") {
      roles.push("restaurant_manager", "admin")
    } else if (role === "manager") {
      roles.push("restaurant_manager")
    }

    const user = new User({
      name,
      email,
      passwordHash: password,
      roles,
    })

    user.addOrUpdateRestaurantLink({
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      role,
    })

    await user.save()

    logger.info("Manager registered", {
      userId: user._id,
      email: user.email,
      restaurantId,
      role,
    })

    return NextResponse.json(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        restaurants: user.restaurants,
      },
      { status: 201 },
    )
  } catch (error: any) {
    logger.error("Error registering user", { error: error.message })
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}
