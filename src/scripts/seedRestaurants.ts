import mongoose from "mongoose"
import dbConnect from "@/lib/db"
import Restaurant from "@/models/restaurant" // لو بتستخدم ES modules

async function seed() {
  try {
    await dbConnect()
    console.log("Connected to MongoDB")

    const existing = await Restaurant.findOne({ subdomain: "example-restaurant" })
    if (existing) {
      console.log("Restaurant already exists, skipping seed.")
      return
    }

    const newRestaurant = new Restaurant({
      name: {
        ar: "مطعم مثال",
        en: "Example Restaurant",
      },
      subdomain: "example-restaurant",
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
      ],
    })

    await newRestaurant.save()
    console.log("Default restaurant seeded successfully!")
  } catch (error) {
    console.error("Error seeding data:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
    process.exit(0)
  }
}

seed()
