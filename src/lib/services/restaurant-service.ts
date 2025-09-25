import mongoose from "mongoose"
import Restaurant from "@/models/restaurant"
import connectToDatabase from "@/lib/db"
import type { IRestaurant as RestaurantType } from "@/types/restaurant"
import { extractPlatformSubdomain, getRootDomain, normalizeHost } from "@/lib/host-utils"

// Helper function to convert Mongoose document to plain object
function convertToPlainObject(doc: unknown): RestaurantType {
  return JSON.parse(JSON.stringify(doc))
}

export async function getAllRestaurants(): Promise<RestaurantType[]> {
  try {
    await connectToDatabase()
    const restaurants = await Restaurant.find({}).sort({ createdAt: -1 })
    return restaurants.map(convertToPlainObject)
  } catch (error) {
    console.error("Error fetching restaurants:", error)
    throw new Error("Failed to fetch restaurants")
  }
}

export async function getRestaurantById(id: string): Promise<RestaurantType | null> {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null
    }

    const restaurant = await Restaurant.findById(id)
    return restaurant ? convertToPlainObject(restaurant) : null
  } catch (error) {
    console.error(`Error fetching restaurant with id ${id}:`, error)
    throw new Error("Failed to fetch restaurant")
  }
}

const ALIAS_ACTIVE_CONDITION = {
  $or: [{ active: { $exists: false } }, { active: { $ne: false } }],
}

export async function getRestaurantBySubdomain(subdomain: string): Promise<RestaurantType | null> {
  try {
    await connectToDatabase()
    const normalized = subdomain?.trim().toLowerCase()
    if (!normalized) {
      return null
    }

    const restaurant = await Restaurant.findOne({ subdomain: normalized })
    return restaurant ? convertToPlainObject(restaurant) : null
  } catch (error) {
    console.error(`Error fetching restaurant with subdomain ${subdomain}:`, error)
    throw new Error("Failed to fetch restaurant")
  }
}

export async function getRestaurantByHost(host: string): Promise<RestaurantType | null> {
  const normalizedHost = normalizeHost(host)
  if (!normalizedHost) {
    return null
  }

  const rootDomain = getRootDomain()
  if (
    normalizedHost === "localhost" ||
    normalizedHost === "127.0.0.1" ||
    (rootDomain && normalizedHost === rootDomain)
  ) {
    return null
  }

  try {
    await connectToDatabase()

    const subdomain = extractPlatformSubdomain(normalizedHost, rootDomain)
    if (subdomain) {
      const restaurantBySubdomain = await Restaurant.findOne({ subdomain })
      if (restaurantBySubdomain) {
        return convertToPlainObject(restaurantBySubdomain)
      }
    }

    const restaurantByCanonical = await Restaurant.findOne({ canonicalHost: normalizedHost })
    if (restaurantByCanonical) {
      return convertToPlainObject(restaurantByCanonical)
    }

    const restaurantByAlias = await Restaurant.findOne({
      domainAliases: {
        $elemMatch: {
          host: normalizedHost,
          ...ALIAS_ACTIVE_CONDITION,
        },
      },
    })

    return restaurantByAlias ? convertToPlainObject(restaurantByAlias) : null
  } catch (error) {
    console.error(`Error fetching restaurant with host ${host}:`, error)
    throw new Error("Failed to fetch restaurant")
  }
}

export async function createRestaurant(
  data: Omit<RestaurantType, "_id" | "createdAt" | "updatedAt">,
): Promise<RestaurantType> {
  try {
    await connectToDatabase()
    const restaurant = new Restaurant(data)
    await restaurant.save()
    return convertToPlainObject(restaurant)
  } catch (error: any) {
    console.error("Error creating restaurant:", error)

    // Handle duplicate subdomain error
    if (error.code === 11000 && error.keyPattern?.subdomain) {
      throw new Error("Subdomain already exists. Please choose a different subdomain.")
    }

    throw new Error("Failed to create restaurant")
  }
}

export async function updateRestaurant(id: string, data: Partial<RestaurantType>): Promise<RestaurantType | null> {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null
    }

    const restaurant = await Restaurant.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })

    return restaurant ? convertToPlainObject(restaurant) : null
  } catch (error: any) {
    console.error(`Error updating restaurant with id ${id}:`, error)

    // Handle duplicate subdomain error
    if (error.code === 11000 && error.keyPattern?.subdomain) {
      throw new Error("Subdomain already exists. Please choose a different subdomain.")
    }

    throw new Error("Failed to update restaurant")
  }
}

export async function deleteRestaurant(id: string): Promise<boolean> {
  try {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false
    }

    const result = await Restaurant.findByIdAndDelete(id)
    return !!result
  } catch (error) {
    console.error(`Error deleting restaurant with id ${id}:`, error)
    throw new Error("Failed to delete restaurant")
  }
}

// Advanced queries
export async function searchRestaurants(query: string): Promise<RestaurantType[]> {
  try {
    await connectToDatabase()
    const restaurants = await Restaurant.find({ $text: { $search: query } }, { score: { $meta: "textScore" } }).sort({
      score: { $meta: "textScore" },
    })

    return restaurants.map(convertToPlainObject)
  } catch (error) {
    console.error(`Error searching restaurants with query "${query}":`, error)
    throw new Error("Failed to search restaurants")
  }
}

export async function getRestaurantStats(): Promise<any> {
  try {
    await connectToDatabase()

    const stats = await Restaurant.aggregate([
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          publishedCount: [{ $match: { isPublished: true } }, { $count: "count" }],
          branchesStats: [{ $unwind: "$branches" }, { $group: { _id: null, count: { $sum: 1 } } }],
          recentlyAdded: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            { $project: { name: 1, subdomain: 1, createdAt: 1 } },
          ],
        },
      },
    ])

    return stats[0]
  } catch (error) {
    console.error("Error getting restaurant stats:", error)
    throw new Error("Failed to get restaurant statistics")
  }
}
