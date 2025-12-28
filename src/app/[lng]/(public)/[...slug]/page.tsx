import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MainNav } from "@/components/ar/header/main-nav"
import { MobileLayout } from "@/components/ar/mobile-layout"
import { MenuPage } from "@/components/ar/menu/menu-page"

import BlockRenderer from "@/components/cms/BlockRenderer"
import { resolveRestaurantFromHeaders } from "@/lib/domain/restaurant-context"
import { getRootDomain, resolveRestaurantHost } from "@/lib/host-utils"
import { getPageBySlug } from "@/lib/services/page-service"
import { getPageBuilderSections, sortSections } from "@/lib/builder-sections"
import { toBranchSummary, type BranchSummary } from "@/lib/branch-utils"
import { flattenMenuItems, getMenuByRestaurantId, type MenuItemSummary } from "@/lib/services/menu-service"
import type { AnyBlock } from "@/types/blocks"
import type { IPage } from "@/types/page"
import type { IRestaurant } from "@/types/restaurant"
import { renderSection } from "@/lib/builder"

export const dynamic = "force-dynamic"

type PageParams = {
  lng?: string
  slug?: string[] | string
}

type Locale = "ar" | "en"

const SUPPORTED_LOCALES: Locale[] = ["ar", "en"]
const FALLBACK_IMAGE = "/placeholder.svg?height=400&width=800"

const resolveLocale = (value?: string): Locale => {
  if (!value) return "ar"
  const normalized = value.toLowerCase()
  return SUPPORTED_LOCALES.includes(normalized as Locale) ? (normalized as Locale) : "ar"
}

const normalizeSlug = (slugParam: PageParams["slug"]): string => {
  if (!slugParam) return ""
  if (Array.isArray(slugParam)) {
    return slugParam.filter(Boolean).join("/")
  }
  return slugParam
}

const resolveDirection = (locale: Locale): "rtl" | "ltr" => (locale === "ar" ? "rtl" : "ltr")

const resolveProtocol = (hostHeader: string): "http" | "https" => {
  const normalized = hostHeader.toLowerCase()
  return normalized.includes("localhost") || normalized.includes("127.0.0.1") ? "http" : "https"
}

const toAbsoluteUrl = (url: string | undefined | null, host: string, protocol: "http" | "https"): string | undefined => {
  if (!url) return undefined
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith("//")) return `${protocol}:${url}`
  const prefix = url.startsWith("/") ? "" : "/"
  return `${protocol}://${host}${prefix}${url}`
}

const buildMenuFallbackMetadata = (restaurant: IRestaurant, hostHeader: string, locale: Locale): Metadata => {
  const protocol = resolveProtocol(hostHeader)
  const host = resolveRestaurantHost(restaurant, hostHeader, getRootDomain())
  const restaurantName =
    typeof restaurant.name === "object"
      ? restaurant.name?.[locale] ?? restaurant.name?.ar ?? restaurant.name?.en
      : restaurant.name ?? "المطعم"

  const description =
    typeof restaurant.description === "object"
      ? restaurant.description?.[locale] ?? restaurant.description?.ar ?? restaurant.description?.en
      : restaurant.description ?? "استعرض قائمة الطعام الخاصة بنا."

  return {
    title: `قائمة الطعام - ${restaurantName}`,
    description,
    alternates: { canonical: `${protocol}://${host}/${locale}/menu` },
    openGraph: {
      title: `قائمة الطعام - ${restaurantName}`,
      description,
      url: `${protocol}://${host}/${locale}/menu`,
      type: "website",
    },
  }
}

type LoadedContext = {
  restaurant: IRestaurant | null
  hostHeader: string
  page: IPage | null
  locale: Locale
  slugPath: string
  branches: BranchSummary[]
  menuItems: MenuItemSummary[]
  menu?: any
}

async function fetchBranches(subdomainOrSlug: string, hostHeader: string): Promise<BranchSummary[]> {
  const protocol = resolveProtocol(hostHeader)
  const url = `${protocol}://${hostHeader}/api/restaurants/${subdomainOrSlug}/branches`
  const res = await fetch(url, { cache: "no-store" }).catch(() => null)
  if (!res?.ok) return []
  const data = await res.json().catch(() => null)
  if (!Array.isArray(data)) return []
  return data.map((item) => toBranchSummary(item))
}

const normalizeRestaurantBranches = (restaurant?: IRestaurant | null): BranchSummary[] => {
  const raw = (restaurant as any)?.branches
  if (!Array.isArray(raw)) return []
  return raw.map((b) => toBranchSummary(b))
}

async function loadPageContext(params: PageParams): Promise<LoadedContext> {
  const { restaurant, hostHeader } = await resolveRestaurantFromHeaders()
  const locale = resolveLocale(params.lng)
  const slugPath = normalizeSlug(params.slug)

  if (!restaurant || !slugPath) {
    return { restaurant, hostHeader, page: null, locale, slugPath, branches: [], menuItems: [] }
  }

  const restaurantId = restaurant._id?.toString?.()
  if (!restaurantId) {
    return { restaurant: null, hostHeader, page: null, locale, slugPath, branches: [], menuItems: [] }
  }

  const page = await getPageBySlug(restaurantId, slugPath, locale)
  const subOrSlug = restaurant.subdomain?.toLowerCase?.() || restaurant.slug?.toLowerCase?.() || restaurantId
  const apiBranches = await fetchBranches(subOrSlug, hostHeader)
  const fallbackBranches = !apiBranches.length ? normalizeRestaurantBranches(restaurant) : []
  const branches = apiBranches.length ? apiBranches : fallbackBranches
  const menu = await getMenuByRestaurantId(restaurantId).catch(() => null)
  const menuItems = flattenMenuItems(menu)
  return { restaurant, hostHeader, page: page ?? null, locale, slugPath, branches, menuItems, menu }
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const resolvedParams = await params
  const { restaurant, hostHeader, page, locale, slugPath } = await loadPageContext(resolvedParams)

  if (!restaurant || !page || (!page.isPublished && !page.template)) {
    if (restaurant && slugPath === "menu") {
      return buildMenuFallbackMetadata(restaurant, hostHeader, locale)
    }

    return {
      title: "Page not found",
      description: "The requested page could not be located.",
    }
  }

  const protocol = resolveProtocol(hostHeader)
  const host = resolveRestaurantHost(restaurant, hostHeader, getRootDomain())
  const seo = page.seo ?? {}

  const title =
    seo.title ??
    (typeof page.name === "string" ? page.name : page.name?.[locale] ?? page.name?.ar ?? page.name?.en) ??
    (typeof restaurant.name === "object"
      ? restaurant.name?.[locale] ?? restaurant.name?.ar ?? restaurant.name?.en
      : restaurant.name) ??
    "Meelza"

  const description =
    seo.description ??
    (typeof page.seo?.description === "string"
      ? page.seo.description
      : page.seo?.description?.[locale] ?? page.seo?.description?.ar ?? page.seo?.description?.en) ??
    (typeof restaurant.description === "object"
      ? restaurant.description?.[locale] ?? restaurant.description?.ar ?? restaurant.description?.en
      : restaurant.description) ??
    ""

  const canonical =
    seo.canonical_url ||
    `${protocol}://${host}/${locale}/${slugPath}`.replace(/\/{2,}/g, "/").replace(":/", "://")

  const ogImage = toAbsoluteUrl(seo.og_image, host, protocol) ?? toAbsoluteUrl(page.headerImage, host, protocol) ?? FALLBACK_IMAGE

  return {
    title,
    description,
    keywords: seo.keywords?.filter(Boolean),
    alternates: { canonical },
    openGraph: {
      title: seo.og_title ?? title,
      description: seo.og_description ?? description,
      url: canonical,
      type: seo.og_type ?? "website",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: seo.twitter_card ?? "summary_large_image",
      title: seo.twitter_title ?? title,
      description: seo.twitter_description ?? description,
      images: seo.twitter_image ? [toAbsoluteUrl(seo.twitter_image, host, protocol)!] : [ogImage],
    },
    other: seo.structured_data ? { "structured-data": JSON.stringify(seo.structured_data) } : undefined,
  }
}

export default async function ContentPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>
  searchParams?: Promise<Record<string, string | string[]>>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const { restaurant, hostHeader, page, locale, branches, menuItems, menu } = await loadPageContext(resolvedParams)
  if (!restaurant) return notFound()

  const typedRestaurant = restaurant as IRestaurant | null

  if (!page || (!page.isPublished && !page.template)) {
    if (resolvedParams && normalizeSlug(resolvedParams.slug) === "menu") {
      if (!menu) return notFound()
      return (
        <>
          <MainNav />
          <MobileLayout restaurant={typedRestaurant as IRestaurant}>
            <MenuPage menuData={menu} />
          </MobileLayout>
        </>
      )
    }

    return notFound()
  }

  const direction = resolveDirection(locale)
  const protocol = resolveProtocol(hostHeader)
  const host = resolveRestaurantHost(restaurant, hostHeader, getRootDomain())
  const builderSections = getPageBuilderSections(page)
  const builderTheme = page.theme
  const structuredData = page.seo?.structured_data

  if (builderSections?.length) {
    const orderedSections = sortSections(builderSections)
  return (
  <>
    <MainNav />

    <MobileLayout restaurant={restaurant as any}>
      <main dir={direction} className="min-h-screen bg-background text-foreground">
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10   sm:px-6 lg:px-8">
          {orderedSections.map((section) =>
            renderSection(section, {
              theme: builderTheme,
              dataSources: { branches, menuItems, menu },
              locale,
              searchParams: resolvedSearchParams,
            }),
          )}
        </div>
      </main>
    </MobileLayout>
  </>
)

  }

  const orderedComponents = [...(page.components ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

  return (
    <>
    
    <main dir={direction} className="min-h-screen bg-background text-foreground">
      {structuredData && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      )}

      <article className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
        <header className="space-y-4 text-center">
          <div className="relative mx-auto h-56 w-full max-w-4xl overflow-hidden rounded-3xl md:h-72">
            <img
              src={toAbsoluteUrl(page.headerImage, host, protocol) ?? FALLBACK_IMAGE}
              alt={typeof page.name === "string" ? page.name : page.name?.[locale] ?? page.name?.ar ?? page.name?.en ?? ""}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold md:text-4xl">
              {typeof page.name === "string" ? page.name : page.name?.[locale] ?? page.name?.ar ?? page.name?.en ?? ""}
            </h1>
            {page.seo?.description && (
              <p className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-base">
                {typeof page.seo.description === "string"
                  ? page.seo.description
                  : page.seo.description?.[locale] ?? page.seo.description?.ar ?? page.seo.description?.en ?? ""}
              </p>
            )}
          </div>
        </header>

        <section className="space-y-10">
          {orderedComponents.length > 0 ? (
            <BlocksFromComponents components={orderedComponents} />
          ) : (
            <div className="rounded-2xl border border-dashed border-muted-foreground/40 p-10 text-center text-sm text-muted-foreground">
              No content has been published for this page yet.
            </div>
          )}
        </section>
      </article>
    </main>
    </>
  )
}

const BlocksFromComponents = ({ components }: { components: IPage["components"] }) => {
  const blocks: AnyBlock[] = components.map((component) => ({
    id: component.component_id ?? component.position?.toString() ?? component.type,
    type: component.type as AnyBlock["type"],
    ...(component.props ?? {}),
  }))

  return <BlockRenderer blocks={blocks} />
}
