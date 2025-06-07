import { type NextRequest, NextResponse } from "next/server"
import  dbconnect from "@/lib/db"
import { User } from "@/models/User"
import { logger } from "@/lib/logger"
import mongoose from "mongoose"
import { z } from "zod"

// Validation schema for registration
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  restaurantId: z.string().min(1, { message: "Restaurant ID is required" }),
  role: z.enum(["admin", "manager", "staff"]).optional(),
})

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

    const { name, email, password, restaurantId, role = "staff" } = result.data

    // Validate restaurantId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return NextResponse.json({ error: "Invalid restaurant ID format" }, { status: 400 })
    }

    await dbconnect()

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    // Create the new user
    const user = new User({
      name,
      email,
      password, // Will be hashed by the pre-save hook
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await user.save()

    // Log the action
    logger.info("User registered", {
      userId: user._id,
      email: user.email,
      restaurantId: user.restaurantId,
    })

    // Return success without exposing the password
    return NextResponse.json(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        restaurantId: user.restaurantId,
        role: user.role,
      },
      { status: 201 },
    )
  } catch (error: any) {
    logger.error("Error registering user", { error: error.message })
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}
