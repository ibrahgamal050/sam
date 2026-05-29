import type { Metadata } from "next"
import { BranchesPage } from "@/components/ru/branches-page"
import { resolveRestaurantFromHeaders } from "@/lib/domain/restaurant-context"
import { getRootDomain, resolveRestaurantHost } from "@/lib/host-utils"
import { getLocalizedText } from "@/lib/localize"
import type { IRestaurant } from "@/types/restaurant"

export const dynamic = "force-dynamic"

const resolveProtocol = (hostHeader: string): "http" | "https" => {
  const normalized = hostHeader.toLowerCase()
  return normalized.includes("localhost") || normalized.includes("127.0.0.1") ? "http" : "https"
}

export async function generateMetadata(): Promise<Metadata> {
  const { restaurant, hostHeader } = await resolveRestaurantFromHeaders()

  if (!restaurant) {
    return {
      title: "Филиалы ресторана",
      description: "Узнайте о наших филиалах и расположениях",
    }
  }

  const restaurantName = getLocalizedText(restaurant.name, "Ресторан")
  const resolvedHost = resolveRestaurantHost(restaurant, hostHeader, getRootDomain())
  const protocol = resolveProtocol(hostHeader)
  const coverImage = `/images${restaurant.coverImage || "/default-og.jpg"}`
  const coverImageUrl = `${protocol}://${resolvedHost}${coverImage}`

  const title = `Филиалы — ${restaurantName}`
  const description = `Узнайте о филиалах ${restaurantName} и наших расположениях для отличного гастрономического опыта.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: "ru_RU",
      images: [{ url: coverImageUrl, alt: `${restaurantName} — обложка` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverImageUrl],
    },
  }
}

export default async function BranchesRoute() {
  const { restaurant } = await resolveRestaurantFromHeaders()
  const typedRestaurant = restaurant as IRestaurant | null

  if (!typedRestaurant) {
    return <div className="p-4">Ресторан не найден</div>
  }

  return <BranchesPage restaurant={typedRestaurant} />
}
