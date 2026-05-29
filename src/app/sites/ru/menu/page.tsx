import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getMenuByRestaurantId } from "@/lib/services/menu-service"
import { MenuPage } from "@/components/ru/menu/menu-page"
import { MenuPageSkeleton } from "@/components/ru/menu/menu-page-skeleton"
import { ErrorBoundary } from "@/components/ru/error-boundary"
import { ErrorDisplay } from "@/components/ru/menu/error-display"
import type { Metadata } from "next"
import { resolveRestaurantFromHeaders } from "@/lib/domain/restaurant-context"
import { getRootDomain, resolveRestaurantHost } from "@/lib/host-utils"
import { getLocalizedText } from "@/lib/localize"

// Enable dynamic rendering for fresh data
export const dynamic = "force-dynamic"
// Add revalidation for performance if data doesn't change frequently
// export const revalidate = 3600 // Revalidate every hour

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  try {
    const { restaurant, hostHeader } = await resolveRestaurantFromHeaders()

    if (!restaurant) {
      return {
        title: "Меню",
        description: "Ознакомьтесь с нашим меню",
      }
    }

    const canonicalHost = resolveRestaurantHost(restaurant, hostHeader, getRootDomain())
    const protocol = resolveProtocol(hostHeader)
    const canonicalUrl = `${protocol}://${canonicalHost}/menu`

    const restaurantName = getLocalizedText(restaurant.name, "Ресторан")
    const description =
      getLocalizedText(restaurant.description) ||
      `Ознакомьтесь с меню ресторана ${restaurantName}. Откройте для себя разнообразие вкусных блюд.`

    // Get menu categories for keywords
    const restaurantId = restaurant._id?.toString?.() ?? ""
    const menu = await getMenuByRestaurantId(restaurantId)
    const categoryNames = menu?.categories?.map((c: { name: unknown }) => getLocalizedText(c.name as never))

    return {
      title: `Меню ресторана ${restaurantName}`,
      description: description,
      keywords: `${restaurantName}, меню, ресторан, ${categoryNames}`,
      openGraph: {
        title: `Меню ресторана ${restaurantName}`,
        description: description,
        type: "website",
        locale: "ru_RU",
        siteName: restaurantName,
        images: [
          {
            url: `/api/og?restaurant=${encodeURIComponent(restaurantName)}`,
            width: 1200,
            height: 630,
            alt: `Меню ресторана ${restaurantName}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `Меню — ${restaurantName}`,
        description: description,
        images: [`/api/og?restaurant=${encodeURIComponent(restaurantName)}`],
      },
      alternates: {
        canonical: canonicalUrl,
      },
      robots: {
        index: true,
        follow: true,
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Меню",
      description: "Ознакомьтесь с нашим меню",
    }
  }
}

export default async function MenuHandler({ searchParams }: { searchParams: { q?: string } }) {
  return (
    <ErrorBoundary fallback={<ErrorDisplay />}>
      <Suspense fallback={<MenuPageSkeleton />}>
        <MenuContent searchParams={searchParams} />
      </Suspense>
    </ErrorBoundary>
  )
}

async function MenuContent({ searchParams }: { searchParams: { q?: string } }) {
  try {
    const { restaurant, hostHeader } = await resolveRestaurantFromHeaders()

    if (!restaurant) {
      console.error("Restaurant not found for current host")
      return notFound()
    }

    // Find menu for the restaurant
    const restaurantId = restaurant._id?.toString?.() ?? ""
    if (!restaurantId) {
      console.error("Restaurant document is missing _id")
      return notFound()
    }

    const menuData = await getMenuByRestaurantId(restaurantId)

    const canonicalHost = resolveRestaurantHost(restaurant, hostHeader, getRootDomain())
    const protocol = resolveProtocol(hostHeader)

    // Prepare restaurant data for the client component
    const restaurantData = {
      name: getLocalizedText(restaurant.name, "Ресторан"),
      description: getLocalizedText(restaurant.description),
      address: getLocalizedText(restaurant.address),
      logo: restaurant.logo || "",
      subdomain: restaurant.subdomain,
    }

    // Return the menu page with data
    return (
      <div
        className="min-h-screen bg-[#f8fafc] text-gray-900 pb-16"
        itemScope
        itemType="https://schema.org/Restaurant"
        dir="ltr"
      >
        <meta itemProp="name" content={restaurantData.name} />
        <meta itemProp="description" content={restaurantData.description} />
        <meta itemProp="address" content={restaurantData.address} />
        <link rel="canonical" href={`${protocol}://${canonicalHost}/menu`} />
        <MenuPage menuData={menuData}  />
      </div>
    )
  } catch (error) {
    console.error("Error fetching menu data:", error)
    return <ErrorDisplay />
  }
}

const resolveProtocol = (hostHeader: string): "http" | "https" => {
  const normalized = hostHeader.toLowerCase()
  return normalized.includes("localhost") || normalized.includes("127.0.0.1") ? "http" : "https"
}
