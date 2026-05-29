import type { Metadata } from "next"
import { notFound } from "next/navigation"

import AboutPage from "@/components/ru/about-page"
import { resolveRestaurantFromHeaders } from "@/lib/domain/restaurant-context"
import { getRootDomain, resolveRestaurantHost } from "@/lib/host-utils"
import { getPageBySlug } from "@/lib/services/page-service"
import type { IPage } from "@/types/page"
import type { IRestaurant } from "@/types/restaurant"

const VALID_LOCALES = ["ru", "en"] as const
type Locale = (typeof VALID_LOCALES)[number]
const PAGE_SLUG = "about"

type PageParams = {
  params: Promise<{
    lng: string
  }>
}

const resolveLocale = (value?: string): Locale | null => {
  if (!value) return "ru"
  const normalized = value.toLowerCase()
  return (VALID_LOCALES as readonly string[]).includes(normalized) ? (normalized as Locale) : null
}

const resolveProtocol = (hostHeader: string): "http" | "https" => {
  const normalized = hostHeader.toLowerCase()
  return normalized.includes("localhost") || normalized.includes("127.0.0.1") ? "http" : "https"
}

type LoadedAboutData =
  | {
      restaurant: IRestaurant
      page: IPage | null
      hostHeader: string
      locale: Locale
    }
  | {
      restaurant: null
      page: null
      hostHeader: string
      locale: Locale
    }

async function loadAboutData(locale: Locale): Promise<LoadedAboutData> {
  const { restaurant, hostHeader } = await resolveRestaurantFromHeaders()
  if (!restaurant) {
    return { restaurant: null, page: null, hostHeader, locale }
  }

  const restaurantId = restaurant._id?.toString?.()
  if (!restaurantId) {
    return { restaurant: restaurant as IRestaurant, page: null, hostHeader, locale }
  }

  const page = await getPageBySlug(restaurantId, PAGE_SLUG, locale)
  return {
    restaurant: restaurant as IRestaurant,
    page: page ?? null,
    hostHeader,
    locale,
  }
}

export default async function AboutRoute({ params }: PageParams) {
  const { lng } = await params
  const locale = resolveLocale(lng)
  if (!locale) {
    notFound()
  }

  const { restaurant, page } = await loadAboutData(locale)

  if (!restaurant || !page) {
    notFound()
  }

  return <AboutPage data={page} logo={restaurant.logo || "/placeholder.svg?height=400&width=800"} />
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { lng } = await params
  const locale = resolveLocale(lng)
  if (!locale) {
    return {}
  }

  const { restaurant, page, hostHeader } = await loadAboutData(locale)

  if (!restaurant || !page) {
    return {
      title: locale === "ru" ? "الصفحة غير متوفرة" : "Page unavailable",
      description:
        locale === "ru"
          ? "الصفحة التي تحاول الوصول إليها غير متاحة حاليًا."
          : "The page you are trying to reach is currently unavailable.",
    }
  }

  const resolvedHost = resolveRestaurantHost(restaurant, hostHeader, getRootDomain())
  const protocol = resolveProtocol(hostHeader)
  const basePath = `/${locale}`
  const canonicalUrl = page.seo?.canonical_url ?? `${protocol}://${resolvedHost}${basePath}/${PAGE_SLUG}`

  const title =
    page.seo?.title ??
    (typeof restaurant.name === "object"
      ? restaurant.name?.[locale] ?? restaurant.name?.ar ?? restaurant.name?.en
      : restaurant.name) ??
    "Meelza"

  const description =
    page.seo?.description ??
    (typeof restaurant.description === "object"
      ? restaurant.description?.[locale] ?? restaurant.description?.ar ?? restaurant.description?.en
      : restaurant.description) ??
    ""

  const keywords =
    (page.seo?.keywords && page.seo.keywords.length > 0
      ? page.seo.keywords
      : [
          locale === "ru" ? "مطعم" : "Restaurant",
          typeof restaurant.name === "object" ? restaurant.name?.[locale] ?? restaurant.name?.ar : restaurant.name,
        ].filter(Boolean)) ?? []

  const ogImage = page.seo?.og_image || restaurant.logo || "/placeholder.svg?height=400&width=800"

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: page.seo?.og_title ?? title,
      description: page.seo?.og_description ?? description,
      images: [ogImage],
      type: page.seo?.og_type ?? "website",
    },
    twitter: {
      card: page.seo?.twitter_card ?? "summary_large_image",
      title: page.seo?.twitter_title ?? title,
      description: page.seo?.twitter_description ?? description,
      images: page.seo?.twitter_image ? [page.seo.twitter_image] : [ogImage],
    },
  }
}
