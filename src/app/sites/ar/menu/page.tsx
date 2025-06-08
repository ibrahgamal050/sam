import { Suspense } from "react"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { getRestaurantBySubdomain } from "@/lib/services/restaurant-service"
import { getMenuByRestaurantId } from "@/lib/services/menu-service"
import { MenuPage } from "@/components/ar/menu/menu-page"
import { MenuPageSkeleton } from "@/components/ar/menu/menu-page-skeleton"
import { ErrorBoundary } from "@/components/ar/error-boundary"
import { ErrorDisplay } from "@/components/ar/menu/error-display"
import type { Metadata } from "next"

// Enable dynamic rendering for fresh data
export const dynamic = "force-dynamic"
// Add revalidation for performance if data doesn't change frequently
// export const revalidate = 3600 // Revalidate every hour

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  try {
    const subdomain =  await  extractSubdomainFromHeaders()
    const restaurant = await getRestaurantBySubdomain(subdomain)

    if (!restaurant) {
      return {
        title: "قائمة الطعام",
        description: "استعرض قائمة الطعام الخاصة بنا",
      }
    }

    const restaurantName = restaurant.name?.ar || restaurant.name
    const description =
      restaurant.description?.ar ||
      restaurant.description ||
      `استعرض قائمة الطعام الخاصة بـ ${restaurantName}. اكتشف مجموعة متنوعة من الأطباق الشهية.`

    // Get menu categories for keywords
    const menu = await getMenuByRestaurantId(restaurant._id)
    const categoryNames =
    menu?.categories?.map((c: { name: string | { ar: string } }) =>
    typeof c.name === "object" ? c.name.ar : c.name
  )
  

    return {
      title: `منيو مطعم  ${restaurantName}`,
      description: description,
      keywords: `${restaurantName}, قائمة طعام, مطعم, ${categoryNames}`,
      openGraph: {
        title: `منيو مطعم ${restaurantName}`,
        description: description,
        type: "website",
        locale: "ar_EG",
        siteName: restaurantName,
        images: [
          {
            url: `/api/og?restaurant=${encodeURIComponent(restaurantName)}`,
            width: 1200,
            height: 630,
            alt: `قائمة طعام ${restaurantName}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `قائمة الطعام - ${restaurantName}`,
        description: description,
        images: [`/api/og?restaurant=${encodeURIComponent(restaurantName)}`],
      },
      alternates: {
        canonical: `https://${subdomain}.meelza.com/menu`,
      },
      robots: {
        index: true,
        follow: true,
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "قائمة الطعام",
      description: "استعرض قائمة الطعام الخاصة بنا",
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
    const subdomain =  await extractSubdomainFromHeaders()
    const restaurant = await getRestaurantBySubdomain(subdomain)

    if (!restaurant) {
      console.error(`Restaurant not found for subdomain: ${subdomain}`)
      return notFound()
    }

    // Find menu for the restaurant
    const restaurantId = restaurant._id
    const menuData = await getMenuByRestaurantId(restaurantId)

    // Prepare restaurant data for the client component
    const restaurantData = {
      name: restaurant.name?.ar || restaurant.name,
      description: restaurant.description?.ar || restaurant.description || "",
      address: restaurant.address?.ar || restaurant.address || "",
      logo: restaurant.logo || "",
      subdomain: subdomain,
    }

    // Return the menu page with data
    return (
      <div
        className="min-h-screen bg-gray-50 text-gray-800 pb-16"
        itemScope
        itemType="https://schema.org/Restaurant"
        dir="rtl"
      >
        <meta itemProp="name" content={restaurantData.name} />
        <meta itemProp="description" content={restaurantData.description} />
        <meta itemProp="address" content={restaurantData.address} />
        <link rel="canonical" href={`https://${subdomain}.meelza.com/menu`} />
        <MenuPage menuData={menuData}  />
      </div>
    )
  } catch (error) {
    console.error("Error fetching menu data:", error)
    return <ErrorDisplay />
  }
}

// Helper function to extract subdomain from headers
async function extractSubdomainFromHeaders(): Promise<string> {
  const headersList = await headers()
  const host = headersList.get("host") || ""
  return extractSubdomain(host)
}

// Extract subdomain logic
function extractSubdomain(host: string): string {
  // Remove port if present
  const cleanHost = host.split(":")[0]
  const hostParts = cleanHost.split(".")

  // Handle localhost case (e.g., karamelsham.localhost)
  if (cleanHost.endsWith("localhost")) {
    if (hostParts.length === 2) {
      return hostParts[0] // karamelsham.localhost => karamelsham
    }
    return "main"
  }

  // Handle real domain case (e.g., karamelsham.example.com)
  if (hostParts.length > 2) {
    return hostParts[0] // karamelsham
  }

  return "main"
}
