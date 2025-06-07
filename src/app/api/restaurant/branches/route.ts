import { NextResponse } from "next/server"
import mongoose from "mongoose"
import Restaurant from "@/models/restaurant"

// This prevents the API from being publicly accessible in production
const isAllowedToSeed = process.env.NODE_ENV !== "production" || process.env.ALLOW_SEEDING === "true"

// Function to seed the database
async function seedDatabase() {
  const existing = await Restaurant.findOne({ subdomain: "restaurant1" })
  if (existing) {
    return { success: false, message: "Restaurant already exists, skipping seed." }
  }

  const newRestaurant = new Restaurant({
    name: {
      ar: "مطعم مثال",
      en: "Example Restaurant",
    },
    subdomain: "restaurant1",
    logo: "/images/example-logo.png",
    coverImage: "/images/example-cover.jpg",
    description: "هذا وصف تجريبي للمطعم.",
    location: {
      address: {
        ar: "١ شارع النيل، الجيزة",
        en: "1 Nile Street, Giza",
      },
      latitude: 30.0131,
      longitude: 31.2089,
    },
    social: {
      facebook: "https://facebook.com/example",
      instagram: "https://instagram.com/example",
    },
    branches: [
      {
        name: { ar: "الفرع الرئيسي", en: "Main Branch" },
        location: {
          address: {
            ar: "١ شارع النيل، الجيزة",
            en: "1 Nile Street, Giza",
          },
          latitude: 30.0131,
          longitude: 31.2089,
        },
        phone: "+201234567890",
        workingHours: "10 AM - 11 PM",
        isMainBranch: true,
      },
      {
        name: { ar: "الفرع الرئيسي", en: "Main Branch" },
        location: {
          address: {
            ar: "١ شارع النيل، الجيزة",
            en: "1 Nile Street, Giza",
          },
          latitude: 30.0131,
          longitude: 31.2089,
        },
        phone: "+201234567890",
        workingHours: "10 AM - 11 PM",
        isMainBranch: true,
      },
      {
        name: { ar: "الفرع الرئيسي", en: "Main Branch" },
        location: {
          address: {
            ar: "١ شارع النيل، الجيزة",
            en: "1 Nile Street, Giza",
          },
          latitude: 30.0131,
          longitude: 31.2089,
        },
        phone: "+201234567890",
        workingHours: "10 AM - 11 PM",
        isMainBranch: true,
      },
    ],
  })

  await newRestaurant.save()
  return { success: true, message: "Default restaurant seeded successfully!" }
}

// Modified GET endpoint to automatically run seeding if needed
export async function GET() {
  if (!isAllowedToSeed) {
    return NextResponse.json({ error: "Seeding is not allowed in production" }, { status: 403 })
  }

  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || "", {
        dbName: "restaurant-app", // Change to your actual database name
      })
    }

    // Check if seeding is needed
    const existing = await Restaurant.findOne({ subdomain: "example-restaurant" })

    if (!existing) {
      // If seeding is needed, run the seed function automatically
      const result = await seedDatabase()
      return NextResponse.json({
        ...result,
        autoSeeded: true,
        message: `Auto-seeding completed: ${result.message}`,
      })
    } else {
      // If already seeded, just return the status
      return NextResponse.json({
        needsSeeding: false,
        message: "Database already seeded. Example restaurant exists.",
      })
    }
  } catch (error) {
    console.error("Error during auto-seeding:", error)
    return NextResponse.json(
      {
        error: "Failed during auto-seeding process",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// Keep the POST endpoint for manual seeding
export async function POST() {
  if (!isAllowedToSeed) {
    return NextResponse.json({ error: "Seeding is not allowed in production" }, { status: 403 })
  }

  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || "", {
        dbName: "restaurant-app", // Change to your actual database name
      })
    }

    const result = await seedDatabase()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error seeding data:", error)
    return NextResponse.json({ error: "Failed to seed database", details: error.message }, { status: 500 })
  }
}
