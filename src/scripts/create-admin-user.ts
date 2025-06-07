/**
 * This script creates an admin user for the restaurant menu system
 * Run it with: npx tsx scripts/create-admin-user.ts
 *
 * Make sure to have the following environment variables set:
 * - MONGODB_URI: Your MongoDB connection string
 * - ADMIN_NAME: Name for the admin user
 * - ADMIN_EMAIL: Email for the admin user
 * - ADMIN_PASSWORD: Password for the admin user
 * - RESTAURANT_ID: MongoDB ObjectId of the restaurant
 */

import mongoose from "mongoose"
import { config } from "dotenv"
import { User } from "../models/User"
import bcrypt from "bcryptjs"

// Load environment variables
config({ path: ".env.local" })

async function createAdminUser() {
  try {
    // Check for required environment variables
    const requiredVars = ["MONGODB_URI", "ADMIN_NAME", "ADMIN_EMAIL", "ADMIN_PASSWORD", "RESTAURANT_ID"]
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        console.error(`Error: ${varName} environment variable is required`)
        process.exit(1)
      }
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!)
    console.log("Connected to MongoDB")

    // Check if user already exists
    const existingUser = await User.findOne({ email: process.env.ADMIN_EMAIL })
    if (existingUser) {
      console.log(`User with email ${process.env.ADMIN_EMAIL} already exists`)
      await mongoose.disconnect()
      return
    }

    // Validate restaurant ID
    if (!mongoose.Types.ObjectId.isValid(process.env.RESTAURANT_ID!)) {
      console.error("Error: RESTAURANT_ID is not a valid MongoDB ObjectId")
      await mongoose.disconnect()
      process.exit(1)
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, salt)

    const adminUser = new User({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      restaurantId: new mongoose.Types.ObjectId(process.env.RESTAURANT_ID),
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await adminUser.save()
    console.log(`Admin user created successfully: ${process.env.ADMIN_EMAIL}`)

    // Disconnect from MongoDB
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  } catch (error) {
    console.error("Error creating admin user:", error)
    process.exit(1)
  }
}

createAdminUser()
