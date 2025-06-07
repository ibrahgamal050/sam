"use server"

import { generateText } from "ai"
import { createPerplexity } from "@ai-sdk/perplexity"
import dbConnect from "@/lib/db"
import Restaurant from "@/models/restaurant"

interface RestaurantInput {
  name: string
  subdomain: string
}

// Add this helper function to clean API responses before parsing JSON
function cleanJsonResponse(text: string) {
  // Remove markdown code block indicators
  let cleaned = text.replace(/```(json|javascript|js)?\s*/g, "").replace(/```\s*$/g, "")

  // Try to extract JSON object if there's text before or after it
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    cleaned = jsonMatch[0]
  }

  // Remove any trailing commas in arrays or objects which are invalid in JSON
  cleaned = cleaned.replace(/,(\s*[\]}])/g, "$1")

  return cleaned
}

// Create a properly configured Perplexity client
const perplexityClient = createPerplexity({
  apiKey: process.env.PERPLEXITY_API_KEY || "",
})

export async function generateRestaurantProfiles(restaurantsInput: RestaurantInput[]) {
  try {
    await dbConnect()
    const results = []

    for (const restaurant of restaurantsInput) {
      // Validate input
      if (!restaurant.name || !restaurant.subdomain) {
        throw new Error("Each restaurant must have a name and subdomain")
      }

      // Generate comprehensive restaurant profile using multiple specialized prompts
      const restaurantProfile = await generateComprehensiveRestaurantProfile(restaurant.name)

      // Check if restaurant already exists
      const existingRestaurant = await Restaurant.findOne({ subdomain: restaurant.subdomain })

      if (existingRestaurant) {
        // Update existing restaurant data with basic info
        existingRestaurant.name = restaurant.name
        existingRestaurant.logo = restaurantProfile.logo || "/default-logo.png"
        existingRestaurant.coverImage = restaurantProfile.coverImage || "/default-cover.jpg"
        existingRestaurant.description = restaurantProfile.description
        existingRestaurant.phone = restaurantProfile.phone
        existingRestaurant.email = restaurantProfile.email
        existingRestaurant.website = restaurantProfile.website
        existingRestaurant.location = {
          address: restaurantProfile.location?.address,
          latitude: restaurantProfile.location?.latitude,
          longitude: restaurantProfile.location?.longitude,
        }
        existingRestaurant.social = {
          facebook: restaurantProfile.social?.facebook,
          instagram: restaurantProfile.social?.instagram,
          tiktok: restaurantProfile.social?.tiktok,
          twitter: restaurantProfile.social?.twitter,
        }
        existingRestaurant.meta = {
          title: restaurantProfile.meta?.title || `${restaurant.name} - Restaurant`,
          description: restaurantProfile.meta?.description || restaurantProfile.description?.substring(0, 160),
          keywords: restaurantProfile.meta?.keywords,
          image: restaurantProfile.meta?.image || restaurantProfile.coverImage || "/default-cover.jpg",
        }

        // Add additional detailed information
        existingRestaurant.openingHours = restaurantProfile.openingHours
        existingRestaurant.menu = restaurantProfile.menu
        existingRestaurant.priceRange = restaurantProfile.priceRange
        existingRestaurant.reviews = restaurantProfile.reviews
        existingRestaurant.services = restaurantProfile.services

        // Add localized content
        existingRestaurant.locales = {
          en: {
            name: restaurant.name,
            description: restaurantProfile.description,
            meta: {
              title: restaurantProfile.meta?.title || `${restaurant.name} - Restaurant`,
              description: restaurantProfile.meta?.description || restaurantProfile.description?.substring(0, 160),
              keywords: restaurantProfile.meta?.keywords,
            },
            menu: restaurantProfile.menu?.en,
            services: restaurantProfile.services?.en,
          },
          ar: {
            name: restaurantProfile.arName || restaurant.name,
            description: restaurantProfile.arDescription || "",
            meta: {
              title: restaurantProfile.arMeta?.title || `${restaurantProfile.arName || restaurant.name} - مطعم`,
              description: restaurantProfile.arMeta?.description || "",
              keywords: restaurantProfile.arMeta?.keywords || "",
            },
            menu: restaurantProfile.menu?.ar,
            services: restaurantProfile.services?.ar,
          },
        }

        // Save the updated restaurant document
        await existingRestaurant.save()

        // Convert Mongoose document to plain object before adding to results
        results.push(existingRestaurant.toObject())
      } else {
        // Create a new restaurant document if not exists
        const newRestaurant = new Restaurant({
          name: restaurant.name,
          subdomain: restaurant.subdomain,
          logo: restaurantProfile.logo || "/default-logo.png",
          coverImage: restaurantProfile.coverImage || "/default-cover.jpg",
          description: restaurantProfile.description,
          phone: restaurantProfile.phone,
          email: restaurantProfile.email,
          website: restaurantProfile.website,
          location: {
            address: restaurantProfile.location?.address,
            latitude: restaurantProfile.location?.latitude,
            longitude: restaurantProfile.location?.longitude,
          },
          social: {
            facebook: restaurantProfile.social?.facebook,
            instagram: restaurantProfile.social?.instagram,
            tiktok: restaurantProfile.social?.tiktok,
            twitter: restaurantProfile.social?.twitter,
          },
          meta: {
            title: restaurantProfile.meta?.title || `${restaurant.name} - Restaurant`,
            description: restaurantProfile.meta?.description || restaurantProfile.description?.substring(0, 160),
            keywords: restaurantProfile.meta?.keywords,
            image: restaurantProfile.meta?.image || restaurantProfile.coverImage || "/default-cover.jpg",
          },

          // Add additional detailed information
          openingHours: restaurantProfile.openingHours,
          menu: restaurantProfile.menu,
          priceRange: restaurantProfile.priceRange,
          reviews: restaurantProfile.reviews,
          services: restaurantProfile.services,

          // Add localized content
          locales: {
            en: {
              name: restaurant.name,
              description: restaurantProfile.description,
              meta: {
                title: restaurantProfile.meta?.title || `${restaurant.name} - Restaurant`,
                description: restaurantProfile.meta?.description || restaurantProfile.description?.substring(0, 160),
                keywords: restaurantProfile.meta?.keywords,
              },
              menu: restaurantProfile.menu?.en,
              services: restaurantProfile.services?.en,
            },
            ar: {
              name: restaurantProfile.arName || restaurant.name,
              description: restaurantProfile.arDescription || "",
              meta: {
                title: restaurantProfile.arMeta?.title || `${restaurantProfile.arName || restaurant.name} - مطعم`,
                description: restaurantProfile.arMeta?.description || "",
                keywords: restaurantProfile.arMeta?.keywords || "",
              },
              menu: restaurantProfile.menu?.ar,
              services: restaurantProfile.services?.ar,
            },
          },
        })

        // Save the new restaurant document
        await newRestaurant.save()

        // Convert Mongoose document to plain object before adding to results
        results.push(newRestaurant.toObject())
      }
    }

    return {
      success: true,
      message: `Successfully processed ${results.length} restaurant(s).`,
      restaurants: results,
    }
  } catch (error: any) {
    console.error("Error generating restaurant profiles:", error)
    return {
      success: false,
      message: error.message || "An error occurred while generating restaurant profiles",
    }
  }
}

async function generateComprehensiveRestaurantProfile(restaurantName: string) {
  try {
    // 1. Get basic information (description, contact, location, social media, SEO)
    const basicInfo = await generateBasicRestaurantInfo(restaurantName)

    // 2. Get opening hours
    const openingHours = await generateOpeningHours(restaurantName)

    // 3. Get menu information
    const menu = await generateMenu(restaurantName)

    // 4. Get price range
    const priceRange = await generatePriceRange(restaurantName)

    // 5. Get customer reviews and ratings
    const reviews = await generateReviews(restaurantName)

    // 6. Get available services
    const services = await generateServices(restaurantName)

    // Merge all information into a comprehensive profile
    return {
      ...basicInfo,
      openingHours,
      menu,
      priceRange,
      reviews,
      services,
    }
  } catch (error) {
    console.error("Error in comprehensive profile generation:", error)
    // Return basic default values if generation fails
    return getDefaultRestaurantProfile(restaurantName)
  }
}

async function generateBasicRestaurantInfo(restaurantName: string) {
  try {
    const prompt = `
I need basic information about a restaurant called "${restaurantName}" in both English and Arabic. 
Please search for and provide the following information in a structured JSON format:

1. A detailed description of the restaurant (cuisine type, atmosphere, specialties)
2. Contact information (phone, email if available)
3. Location (full address and approximate latitude/longitude if possible)
4. Website URL
5. Social media links (Facebook, Instagram, TikTok, Twitter)
6. SEO metadata (title, description, keywords)

Also provide Arabic translations for:
1. The restaurant name
2. The description
3. SEO metadata (title, description, keywords)

If you can't find specific information, please make a reasonable guess based on the restaurant name and type.
For example, if it's called "Yemeni Corner", assume it serves Yemeni cuisine.

Return ONLY a valid JSON object with this structure:
{
  "description": "Detailed description in English...",
  "phone": "Phone number",
  "email": "Email address",
  "website": "Website URL",
  "location": {
    "address": "Full address",
    "latitude": 0.0,
    "longitude": 0.0
  },
  "social": {
    "facebook": "Facebook URL",
    "instagram": "Instagram URL",
    "tiktok": "TikTok URL",
    "twitter": "Twitter URL"
  },
  "meta": {
    "title": "SEO title in English",
    "description": "SEO description in English",
    "keywords": "keyword1, keyword2, keyword3"
  },
  "arName": "Restaurant name in Arabic",
  "arDescription": "Detailed description in Arabic",
  "arMeta": {
    "title": "SEO title in Arabic",
    "description": "SEO description in Arabic",
    "keywords": "keyword1, keyword2, keyword3 in Arabic"
  },
  "logo": "/default-logo.png",
  "coverImage": "/default-cover.jpg"
}

Do not include any explanations or notes outside the JSON object.
`

    const { text } = await generateText({
      model: perplexityClient("sonar-pro"),
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    return JSON.parse(cleanJsonResponse(text))
  } catch (error) {
    console.error("Error generating basic restaurant info:", error)
    return {
      description: `${restaurantName} is a restaurant offering delicious cuisine and a welcoming atmosphere.`,
      phone: "",
      email: "",
      website: "",
      location: {
        address: "",
        latitude: null,
        longitude: null,
      },
      social: {
        facebook: "",
        instagram: "",
        tiktok: "",
        twitter: "",
      },
      meta: {
        title: `${restaurantName} - Restaurant`,
        description: `${restaurantName} - A delightful dining experience.`,
        keywords: `${restaurantName}, restaurant, dining`,
      },
      arName: restaurantName,
      arDescription: `${restaurantName} هو مطعم يقدم مأكولات لذيذة وأجواء ترحيبية.`,
      arMeta: {
        title: `${restaurantName} - مطعم`,
        description: `${restaurantName} - تجربة طعام رائعة.`,
        keywords: `${restaurantName}, مطعم, طعام`,
      },
      logo: "/default-logo.png",
      coverImage: "/default-cover.jpg",
    }
  }
}

async function generateOpeningHours(restaurantName: string) {
  try {
    const prompt = `
Find the opening hours for the restaurant "${restaurantName}".
Return the information as a JSON object with days of the week and corresponding hours.
If you can't find the exact information, provide a reasonable estimate based on typical restaurant hours.

Return ONLY a valid JSON object with this structure:
{
  "monday": {"open": "09:00", "close": "22:00"},
  "tuesday": {"open": "09:00", "close": "22:00"},
  "wednesday": {"open": "09:00", "close": "22:00"},
  "thursday": {"open": "09:00", "close": "22:00"},
  "friday": {"open": "09:00", "close": "23:00"},
  "saturday": {"open": "10:00", "close": "23:00"},
  "sunday": {"open": "10:00", "close": "22:00"}
}

Use 24-hour format for times. If the restaurant is closed on a particular day, use null instead of the open/close object.
`

    const { text } = await generateText({
      model: perplexityClient("sonar-pro"),
      prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return JSON.parse(cleanJsonResponse(text))
  } catch (error) {
    console.error("Error generating opening hours:", error)
    return {
      monday: { open: "11:00", close: "22:00" },
      tuesday: { open: "11:00", close: "22:00" },
      wednesday: { open: "11:00", close: "22:00" },
      thursday: { open: "11:00", close: "22:00" },
      friday: { open: "11:00", close: "23:00" },
      saturday: { open: "11:00", close: "23:00" },
      sunday: { open: "11:00", close: "22:00" },
    }
  }
}

async function generateMenu(restaurantName: string) {
  try {
    const prompt = `
Find the menu information for the restaurant "${restaurantName}" in both English and Arabic.
Organize the menu by categories (appetizers, main courses, desserts, drinks, etc.) and include prices if available.
If you can't find the exact menu, create a reasonable one based on the restaurant's cuisine type.

Return ONLY a valid JSON object with this structure:
{"I
  "en": [
    {
      "category": "Appetizers",
      "items": [
        {"name": tem name", "description": "Item description", "price": "Price in local currency"}
      ]
    },
    {
      "category": "Main Courses",
      "items": [
        {"name": "Item name", "description": "Item description", "price": "Price in local currency"}
      ]
    }
  ],
  "ar": [
    {
      "category": "المقبلات",
      "items": [
        {"name": "اسم العنصر", "description": "وصف العنصر", "price": "السعر بالعملة المحلية"}
      ]
    },
    {
      "category": "الأطباق الرئيسية",
      "items": [
        {"name": "اسم العنصر", "description": "وصف العنصر", "price": "السعر بالعملة المحلية"}
      ]
    }
  ]
}

Include at least 3-5 items per category and at least 3 categories.
`

    const { text } = await generateText({
      model: perplexityClient("sonar-pro"),
      prompt,
      temperature: 0.7,
      maxTokens: 3000,
    })

    return JSON.parse(cleanJsonResponse(text))
  } catch (error) {
    console.error("Error generating menu:", error)
    return {
      en: [
        {
          category: "Appetizers",
          items: [
            { name: "House Salad", description: "Fresh mixed greens with house dressing", price: "$8" },
            { name: "Garlic Bread", description: "Toasted bread with garlic butter", price: "$5" },
            { name: "Soup of the Day", description: "Chef's daily special soup", price: "$7" },
          ],
        },
        {
          category: "Main Courses",
          items: [
            { name: "Grilled Chicken", description: "Marinated chicken breast with vegetables", price: "$18" },
            { name: "Pasta Primavera", description: "Seasonal vegetables in cream sauce", price: "$16" },
            { name: "House Special", description: "Chef's signature dish", price: "$22" },
          ],
        },
        {
          category: "Desserts",
          items: [
            { name: "Chocolate Cake", description: "Rich chocolate cake with vanilla ice cream", price: "$9" },
            { name: "Fruit Platter", description: "Seasonal fresh fruits", price: "$7" },
            { name: "Cheesecake", description: "New York style cheesecake", price: "$8" },
          ],
        },
      ],
      ar: [
        {
          category: "المقبلات",
          items: [
            { name: "سلطة المنزل", description: "خضروات طازجة مشكلة مع صلصة المنزل", price: "$8" },
            { name: "خبز بالثوم", description: "خبز محمص مع زبدة الثوم", price: "$5" },
            { name: "حساء اليوم", description: "حساء الشيف الخاص اليومي", price: "$7" },
          ],
        },
        {
          category: "الأطباق الرئيسية",
          items: [
            { name: "دجاج مشوي", description: "صدر دجاج متبل مع الخضروات", price: "$18" },
            { name: "باستا بريمافيرا", description: "خضروات موسمية في صلصة كريمية", price: "$16" },
            { name: "طبق المنزل الخاص", description: "طبق الشيف المميز", price: "$22" },
          ],
        },
        {
          category: "الحلويات",
          items: [
            { name: "كيكة الشوكولاتة", description: "كيكة شوكولاتة غنية مع آيس كريم الفانيليا", price: "$9" },
            { name: "طبق فواكه", description: "فواكه موسمية طازجة", price: "$7" },
            { name: "تشيز كيك", description: "تشيز كيك على طريقة نيويورك", price: "$8" },
          ],
        },
      ],
    }
  }
}

async function generatePriceRange(restaurantName: string) {
  try {
    const prompt = `
Find the price range for the restaurant "${restaurantName}".
Provide a price range category (inexpensive, moderate, expensive, very expensive) and approximate cost for a meal per person.

Return ONLY a valid JSON object with this structure:
{
  "category": "moderate",
  "pricePerPerson": {
    "min": 20,
    "max": 40,
    "currency": "USD"
  }
}

Categories should be one of: "inexpensive", "moderate", "expensive", "very expensive".
`

    const { text } = await generateText({
      model: perplexityClient("sonar-pro"),
      prompt,
      temperature: 0.7,
      maxTokens: 500,
    })

    return JSON.parse(cleanJsonResponse(text))
  } catch (error) {
    console.error("Error generating price range:", error)
    return {
      category: "moderate",
      pricePerPerson: {
        min: 15,
        max: 30,
        currency: "USD",
      },
    }
  }
}

async function generateReviews(restaurantName: string) {
  try {
    const prompt = `
Find customer reviews and ratings for the restaurant "${restaurantName}".
Provide an overall rating and a few sample reviews.

Return ONLY a valid JSON object with this structure:
{
  "overallRating": 4.5,
  "totalReviews": 120,
  "sampleReviews": [
    {
      "author": "John D.",
      "rating": 5,
      "comment": "Excellent food and service!",
      "date": "2023-05-15"
    },
    {
      "author": "Sarah M.",
      "rating": 4,
      "comment": "Great atmosphere but slightly overpriced.",
      "date": "2023-04-22"
    }
  ]
}

Include at least 3 sample reviews with varying ratings.
`

    const { text } = await generateText({
      model: perplexityClient("sonar-pro"),
      prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return JSON.parse(cleanJsonResponse(text))
  } catch (error) {
    console.error("Error generating reviews:", error)
    return {
      overallRating: 4.2,
      totalReviews: 45,
      sampleReviews: [
        {
          author: "Customer",
          rating: 5,
          comment: "Excellent food and service!",
          date: "2023-01-15",
        },
        {
          author: "Customer",
          rating: 4,
          comment: "Good food but a bit pricey.",
          date: "2023-02-20",
        },
        {
          author: "Customer",
          rating: 4,
          comment: "Nice atmosphere and friendly staff.",
          date: "2023-03-10",
        },
      ],
    }
  }
}

async function generateServices(restaurantName: string) {
  try {
    const prompt = `
Find the available services and amenities for the restaurant "${restaurantName}" in both English and Arabic.
Include information about delivery, reservations, special dietary options, etc.

Return ONLY a valid JSON object with this structure:
{
  "en": [
    {"name": "Delivery", "available": true, "description": "Delivery service available within 5 miles"},
    {"name": "Reservations", "available": true, "description": "Reservations recommended for dinner"},
    {"name": "Vegetarian Options", "available": true, "description": "Several vegetarian dishes available"},
    {"name": "Vegan Options", "available": false, "description": "Limited vegan options"},
    {"name": "Outdoor Seating", "available": true, "description": "Patio seating available in good weather"},
    {"name": "Parking", "available": true, "description": "Free parking available"}
  ],
  "ar": [
    {"name": "توصيل", "available": true, "description": "خدمة التوصيل متاحة ضمن مسافة 5 أميال"},
    {"name": "حجوزات", "available": true, "description": "ينصح بالحجز لوجبة العشاء"},
    {"name": "خيارات نباتية", "available": true, "description": "تتوفر العديد من الأطباق النباتية"},
    {"name": "خيارات نباتية صارمة", "available": false, "description": "خيارات نباتية صارمة محدودة"},
    {"name": "جلسة خارجية", "available": true, "description": "تتوفر أماكن جلوس في الفناء في الطقس الجيد"},
    {"name": "موقف سيارات", "available": true, "description": "موقف سيارات مجاني متاح"}
  ]
}

Include at least 6 different services.
`

    const { text } = await generateText({
      model: perplexityClient("sonar-pro"),
      prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return JSON.parse(cleanJsonResponse(text))
  } catch (error) {
    console.error("Error generating services:", error)
    return {
      en: [
        { name: "Delivery", available: true, description: "Delivery service available" },
        { name: "Reservations", available: true, description: "Reservations accepted" },
        { name: "Vegetarian Options", available: true, description: "Vegetarian options available" },
        { name: "Vegan Options", available: false, description: "Limited vegan options" },
        { name: "Outdoor Seating", available: true, description: "Outdoor seating available" },
        { name: "Parking", available: true, description: "Parking available" },
      ],
      ar: [
        { name: "توصيل", available: true, description: "خدمة التوصيل متاحة" },
        { name: "حجوزات", available: true, description: "الحجوزات مقبولة" },
        { name: "خيارات نباتية", available: true, description: "خيارات نباتية متاحة" },
        { name: "خيارات نباتية صارمة", available: false, description: "خيارات نباتية صارمة محدودة" },
        { name: "جلسة خارجية", available: true, description: "جلسة خارجية متاحة" },
        { name: "موقف سيارات", available: true, description: "موقف سيارات متاح" },
      ],
    }
  }
}

function getDefaultRestaurantProfile(restaurantName: string) {
  return {
    description: `${restaurantName} is a restaurant offering delicious cuisine and a welcoming atmosphere.`,
    phone: "",
    email: "",
    website: "",
    location: {
      address: "",
      latitude: null,
      longitude: null,
    },
    social: {
      facebook: "",
      instagram: "",
      tiktok: "",
      twitter: "",
    },
    meta: {
      title: `${restaurantName} - Restaurant`,
      description: `${restaurantName} - A delightful dining experience.`,
      keywords: `${restaurantName}, restaurant, dining`,
    },
    arName: restaurantName,
    arDescription: `${restaurantName} هو مطعم يقدم مأكولات لذيذة وأجواء ترحيبية.`,
    arMeta: {
      title: `${restaurantName} - مطعم`,
      description: `${restaurantName} - تجربة طعام رائعة.`,
      keywords: `${restaurantName}, مطعم, طعام`,
    },
    logo: "/default-logo.png",
    coverImage: "/default-cover.jpg",
    openingHours: {
      monday: { open: "11:00", close: "22:00" },
      tuesday: { open: "11:00", close: "22:00" },
      wednesday: { open: "11:00", close: "22:00" },
      thursday: { open: "11:00", close: "22:00" },
      friday: { open: "11:00", close: "23:00" },
      saturday: { open: "11:00", close: "23:00" },
      sunday: { open: "11:00", close: "22:00" },
    },
    menu: {
      en: [
        {
          category: "Appetizers",
          items: [
            { name: "House Salad", description: "Fresh mixed greens with house dressing", price: "$8" },
            { name: "Garlic Bread", description: "Toasted bread with garlic butter", price: "$5" },
            { name: "Soup of the Day", description: "Chef's daily special soup", price: "$7" },
          ],
        },
        {
          category: "Main Courses",
          items: [
            { name: "Grilled Chicken", description: "Marinated chicken breast with vegetables", price: "$18" },
            { name: "Pasta Primavera", description: "Seasonal vegetables in cream sauce", price: "$16" },
            { name: "House Special", description: "Chef's signature dish", price: "$22" },
          ],
        },
        {
          category: "Desserts",
          items: [
            { name: "Chocolate Cake", description: "Rich chocolate cake with vanilla ice cream", price: "$9" },
            { name: "Fruit Platter", description: "Seasonal fresh fruits", price: "$7" },
            { name: "Cheesecake", description: "New York style cheesecake", price: "$8" },
          ],
        },
      ],
      ar: [
        {
          category: "المقبلات",
          items: [
            { name: "سلطة المنزل", description: "خضروات طازجة مشكلة مع صلصة المنزل", price: "$8" },
            { name: "خبز بالثوم", description: "خبز محمص مع زبدة الثوم", price: "$5" },
            { name: "حساء اليوم", description: "حساء الشيف الخاص اليومي", price: "$7" },
          ],
        },
        {
          category: "الأطباق الرئيسية",
          items: [
            { name: "دجاج مشوي", description: "صدر دجاج متبل مع الخضروات", price: "$18" },
            { name: "باستا بريمافيرا", description: "خضروات موسمية في صلصة كريمية", price: "$16" },
            { name: "طبق المنزل الخاص", description: "طبق الشيف المميز", price: "$22" },
          ],
        },
        {
          category: "الحلويات",
          items: [
            { name: "كيكة الشوكولاتة", description: "كيكة شوكولاتة غنية مع آيس كريم الفانيليا", price: "$9" },
            { name: "طبق فواكه", description: "فواكه موسمية طازجة", price: "$7" },
            { name: "تشيز كيك", description: "تشيز كيك على طريقة نيويورك", price: "$8" },
          ],
        },
      ],
    },
    priceRange: {
      category: "moderate",
      pricePerPerson: {
        min: 15,
        max: 30,
        currency: "USD",
      },
    },
    reviews: {
      overallRating: 4.2,
      totalReviews: 45,
      sampleReviews: [
        {
          author: "Customer",
          rating: 5,
          comment: "Excellent food and service! Would definitely come back.",
          date: "2023-01-15",
        },
        {
          author: "Customer",
          rating: 4,
          comment: "Good food but a bit pricey.",
          date: "2023-02-20",
        },
        {
          author: "Customer",
          rating: 4,
          comment: "Nice atmosphere and friendly staff.",
          date: "2023-03-10",
        },
      ],
    },
    services: {
      en: [
        { name: "Delivery", available: true, description: "Delivery service available" },
        { name: "Reservations", available: true, description: "Reservations accepted" },
        { name: "Vegetarian Options", available: true, description: "Vegetarian options available" },
        { name: "Vegan Options", available: false, description: "Limited vegan options" },
        { name: "Outdoor Seating", available: true, description: "Outdoor seating available" },
        { name: "Parking", available: true, description: "Parking available" },
      ],
      ar: [
        { name: "توصيل", available: true, description: "خدمة التوصيل متاحة" },
        { name: "حجوزات", available: true, description: "الحجوزات مقبولة" },
        { name: "خيارات نباتية", available: true, description: "خيارات نباتية متاحة" },
        { name: "خيارات نباتية صارمة", available: false, description: "خيارات نباتية صارمة محدودة" },
        { name: "جلسة خارجية", available: true, description: "جلسة خارجية متاحة" },
        { name: "موقف سيارات", available: true, description: "موقف سيارات متاح" },
      ],
    },
  }
}
