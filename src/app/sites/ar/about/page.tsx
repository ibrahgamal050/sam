import type { Metadata } from "next"
import mongoose from "mongoose"
import AboutPage from "@/components/ar/about-page"
import type { IPage as AboutPageType } from "@/types/page"
import Pages from "@/models/page"
import dbConnect from "@/lib/db"
import { resolveRestaurantFromHeaders } from "@/lib/domain/restaurant-context"
import { getRootDomain, resolveRestaurantHost } from "@/lib/host-utils"
import type { IRestaurant } from "@/types/restaurant"

export const revalidate = 3600

export default async function About() {
  const { restaurant } = await resolveRestaurantFromHeaders()
  const typedRestaurant = restaurant as IRestaurant | null

  if (!typedRestaurant) {
    return <div className="text-center py-10 text-red-600">لم يتم العثور على المطعم</div>
  }

  try {
    const pageData = await getPageBySlug(typedRestaurant.subdomain, "about", "ar")

    if (!pageData) {
      return <div className="text-center py-10 text-red-600">لم يتم العثور على صفحة عن المطعم</div>
    }

    return <AboutPage logo={typedRestaurant.logo} data={pageData as AboutPageType} />
  } catch (error) {
    console.error("Error fetching about page:", error)
    return <div className="text-center py-10 text-red-600">حدث خطأ أثناء تحميل الصفحة</div>
  }
}

export async function getPageBySlug(subdomain: string, slug: string, language: "en" | "ar") {
  await dbConnect()

  const result = await Pages.findOne(
    {
      subdomain,
      pages: {
        $elemMatch: {
          slug,
          language,
        },
      },
    },
    {
      "pages.$": 1,
    },
  ).lean()

  return result?.pages?.[0] || null
}

export async function generateMetadata(): Promise<Metadata> {
  const { restaurant, hostHeader } = await resolveRestaurantFromHeaders()

  if (!restaurant) {
    return {}
  }

  await dbConnect()

  const page = await Pages.findOne(
    {
      restaurantId: new mongoose.Types.ObjectId(restaurant._id),
      pages: { $elemMatch: { slug: "about", language: "ar" } },
    },
    {
      "pages.$": 1,
    },
  ).lean()

  const pageData = page?.pages?.[0]
  const allowedTypes = [
    "website",
    "article",
    "book",
    "profile",
    "music.song",
    "music.album",
    "music.playlist",
    "music.radio_station",
    "video.movie",
    "video.episode",
    "video.tv_show",
    "video.other",
  ] as const

  type OpenGraphType = (typeof allowedTypes)[number]

  const ogType: OpenGraphType =
    allowedTypes.includes(pageData?.seo?.og_type as OpenGraphType)
      ? (pageData?.seo?.og_type as OpenGraphType)
      : "website"

  const resolvedHost = resolveRestaurantHost(restaurant, hostHeader, getRootDomain())
  const protocol = resolveProtocol(hostHeader)
  const canonicalUrl = pageData?.seo?.canonical_url || `${protocol}://${resolvedHost}/ar/about`

  return {
    title: pageData?.seo?.title || `عن ${restaurant.name.ar}`,
    description: pageData?.seo?.description || `اعرف المزيد عن مطعم ${restaurant.name}`,
    keywords: pageData?.seo?.keywords || ["مطعم", restaurant.name.ar, "عن المطعم"],
    openGraph: {
      title: pageData?.seo?.og_title || `عن ${restaurant.name.ar}`,
      description: pageData?.seo?.og_description || `تفاصيل مطعم ${restaurant.name.ar}`,
      images: [pageData?.seo?.og_image || restaurant.logo],
      type: ogType,
    },
    twitter: {
      card: pageData?.seo?.twitter_card || "summary_large_image",
      title: pageData?.seo?.twitter_title || restaurant.name.ar,
      description: pageData?.seo?.twitter_description || `عن مطعم ${restaurant.name}`,
      images: [pageData?.seo?.twitter_image || restaurant.logo],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

const resolveProtocol = (hostHeader: string): "http" | "https" => {
  const normalized = hostHeader.toLowerCase()
  return normalized.includes("localhost") || normalized.includes("127.0.0.1") ? "http" : "https"
}
