import type { Metadata } from "next"
import { BranchesPage } from "@/components/en/branches-page"
import { resolveRestaurantFromHeaders } from "@/lib/domain/restaurant-context"
import { getRootDomain, resolveRestaurantHost } from "@/lib/host-utils"
import type { IRestaurant } from "@/types/restaurant"

export async function generateMetadata(): Promise<Metadata> {
  const { restaurant, hostHeader } = await resolveRestaurantFromHeaders()

  if (!restaurant) {
    return {
      title: "Restaurant Branches",
      description: "Discover our branches and different locations",
    }
  }

  const resolvedHost = resolveRestaurantHost(restaurant, hostHeader, getRootDomain())
  const protocol = resolveProtocol(hostHeader)
  const coverImage = `/images${restaurant.coverImage || "/default-og.jpg"}`
  const coverImageUrl = `${protocol}://${resolvedHost}${coverImage}`

  const restaurantName = restaurant.name?.en || restaurant.name?.ar || "Restaurant"

  return {
    title: `${restaurantName} Branches`,
    description: `Discover ${restaurantName} branches and our different locations for a great dining experience.`,
    openGraph: {
      title: `${restaurantName} Branches`,
      description: `Discover ${restaurantName} branches and our different locations for a great dining experience.`,
      images: [
        {
          url: coverImageUrl,
          alt: `${restaurantName} - Cover image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${restaurantName} Branches`,
      description: `Discover ${restaurantName} branches and our different locations.`,
      images: [coverImageUrl],
    },
  }
}

export default async function Branches() {
  const { restaurant } = await resolveRestaurantFromHeaders()
  const typedRestaurant = restaurant as IRestaurant | null

  if (!typedRestaurant) {
    return <div className="p-4">Restaurant not found</div>
  }

  return <BranchesPage restaurant={typedRestaurant} />
}

const resolveProtocol = (hostHeader: string): "http" | "https" => {
  const normalized = hostHeader.toLowerCase()
  return normalized.includes("localhost") || normalized.includes("127.0.0.1") ? "http" : "https"
}