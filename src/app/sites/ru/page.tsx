export const runtime = "nodejs"

import type { Metadata } from "next"
import { RestaurantHome } from "@/components/ru/RestaurantHome"
import { resolveRestaurantFromHeaders } from "@/lib/domain/restaurant-context"
import { getRootDomain, resolveRestaurantHost } from "@/lib/host-utils"
import type { IRestaurant } from "@/types/restaurant"

export default async function HomeContent() {
  const { restaurant } = await resolveRestaurantFromHeaders()
  const typedRestaurant = restaurant as IRestaurant | null

  if (!typedRestaurant) {
    return <div className="p-4">المطعم غير موجود</div>
  }

  return <RestaurantHome restaurant={typedRestaurant} />
}

export async function generateMetadata(): Promise<Metadata> {
  const { restaurant, hostHeader } = await resolveRestaurantFromHeaders()

  if (!restaurant) {
    return {
      title: "المطعم غير موجود",
      description: "المطعم الذي تبحث عنه غير متاح حالياً.",
    }
  }

  const resolvedHost = resolveRestaurantHost(restaurant, hostHeader, getRootDomain())
  const protocol = resolveProtocol(hostHeader)
  const imageUrl = `${protocol}://${resolvedHost}/images${restaurant.coverImage ?? ""}`

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name?.ar,
    image: imageUrl,
    url: `${protocol}://${resolvedHost}`,
    telephone: restaurant.phones,
    address: {
      "@type": "PostalAddress",
      addressLocality: restaurant.location?.address || "مصر",
      addressRegion: "مصر",
    },
    servesCuisine: restaurant.cuisines || ["مطبخ شرقي"],
  }

  return {
    title: restaurant.name?.ar || "مطعم على منصة ميلزا",
    description: restaurant.description || "تعرف على مطعمنا المميز.",
    openGraph: {
      title: restaurant.name?.ar,
      description: restaurant.description,
      images: [
        {
          url: imageUrl,
          alt: restaurant.name?.ar || "صورة المطعم",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: restaurant.name?.ar,
      description: restaurant.description,
      images: [imageUrl],
    },
    other: {
      "ld+json": JSON.stringify(structuredData),
    },
  }
}

const resolveProtocol = (hostHeader: string): "http" | "https" => {
  const normalized = hostHeader.toLowerCase()
  return normalized.includes("localhost") || normalized.includes("127.0.0.1") ? "http" : "https"
}
