import type { Metadata } from "next"
import { BranchesPage } from "@/components/ar/branches-page"
import { resolveRestaurantFromHeaders } from "@/lib/domain/restaurant-context"
import { getRootDomain, resolveRestaurantHost } from "@/lib/host-utils"
import type { IRestaurant } from "@/types/restaurant"

export async function generateMetadata(): Promise<Metadata> {
  const { restaurant, hostHeader } = await resolveRestaurantFromHeaders()

  if (!restaurant) {
    return {
      title: "فروع المطعم",
      description: "تعرف على فروعنا ومواقعنا المختلفة",
    }
  }

  const resolvedHost = resolveRestaurantHost(restaurant, hostHeader, getRootDomain())
  const protocol = resolveProtocol(hostHeader)
  const coverImage = `/images${restaurant.coverImage || "/default-og.jpg"}`
  const coverImageUrl = `${protocol}://${resolvedHost}${coverImage}`

  return {
    title: `فروع ${restaurant.name.ar}`,
    description: `تعرف على فروع ${restaurant.name.ar} ومواقعنا المختلفة لتجربة طعام رائعة.`,
    openGraph: {
      title: `فروع ${restaurant.name.ar}`,
      description: `تعرف على فروع ${restaurant.name.ar} ومواقعنا المختلفة لتجربة طعام رائعة.`,
      images: [
        {
          url: coverImageUrl,
          alt: `${restaurant.name.ar} - صورة الغلاف`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `فروع ${restaurant.name.ar}`,
      description: `تعرف على فروع ${restaurant.name.ar} ومواقعنا المختلفة.`,
      images: [coverImageUrl],
    },
  }
}

export default async function Branches() {
  const { restaurant } = await resolveRestaurantFromHeaders()
  const typedRestaurant = restaurant as IRestaurant | null

  if (!typedRestaurant) {
    return <div className="p-4">المطعم غير موجود</div>
  }

  return <BranchesPage restaurant={typedRestaurant} />
}

const resolveProtocol = (hostHeader: string): "http" | "https" => {
  const normalized = hostHeader.toLowerCase()
  return normalized.includes("localhost") || normalized.includes("127.0.0.1") ? "http" : "https"
}
