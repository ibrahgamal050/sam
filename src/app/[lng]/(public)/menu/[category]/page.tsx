import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { resolveRestaurantFromHeaders } from "@/lib/domain/restaurant-context"
import { getMenuByRestaurantId } from "@/lib/services/menu-service"
import { renderSection } from "@/lib/builder"
import { MobileLayout } from "@/components/ar/mobile-layout"
import { MainNav } from "@/components/ar/header/main-nav"

type Locale = "ar" | "en"

type PageProps = {
  params: { lng: string; category: string }
}

const resolveLocale = (lng: string): Locale => (String(lng).toLowerCase().startsWith("en") ? "en" : "ar")

function slugifyAr(input: string): string {
  if (!input) return ""

  let s = input.trim().toLowerCase()

  // remove arabic diacritics
  s = s.replace(/[\u064B-\u0652\u0670]/g, "")

  // normalize letters
  s = s
    .replace(/أ|إ|آ/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    // لو عايز "فتة" تفضل "فتة" مش "فته" امسح السطر الجاي:
    // .replace(/ة/g, "ه")
    .replace(/ة/g, "ة")

  // keep arabic + numbers + spaces + dash
  s = s.replace(/[^\u0600-\u06FF0-9\s-]/g, " ")

  // spaces -> dashes
  s = s.replace(/[\s_-]+/g, "-").replace(/-+/g, "-")

  // trim dashes
  s = s.replace(/^-+|-+$/g, "")

  return s
}

const getCategorySlug = (c: any, locale: Locale) => {
  const explicit = String(c?.slug ?? "").trim()
  if (explicit) return explicit

  const name =
    typeof c?.name === "string" ? c.name : c?.name?.[locale] ?? c?.name?.ar ?? c?.name?.en ?? ""

  return slugifyAr(String(name))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { restaurant } = await resolveRestaurantFromHeaders()
  if (!restaurant) return {}

  const locale = resolveLocale(params.lng)
  const menu = await getMenuByRestaurantId(restaurant._id.toString()).catch(() => null)
  const slugParam = decodeURIComponent(params.category)

  const category = menu?.categories?.find((c: any) => getCategorySlug(c, locale) === slugParam)
  if (!category) return {}

  const name = typeof category.name === "object" ? category.name?.[locale] ?? category.name?.ar : category.name
  const description =
    (typeof category.description === "object"
      ? category.description?.[locale] ?? category.description?.ar
      : category.description) ??
    `استعرض كل أصناف ${name} من منيو ${typeof restaurant.name === "object" ? restaurant.name?.[locale] ?? restaurant.name?.ar : restaurant.name}`

  return {
    title: `${name} | منيو ${typeof restaurant.name === "object" ? restaurant.name?.[locale] ?? restaurant.name?.ar : restaurant.name}`,
    description,
    openGraph: {
      title: String(name),
      description: String(description),
      type: "website",
    },
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { restaurant } = await resolveRestaurantFromHeaders()
  if (!restaurant) return notFound()

  const locale = resolveLocale(params.lng)
  const menu = await getMenuByRestaurantId(restaurant._id.toString()).catch(() => null)
  const slugParam = decodeURIComponent(params.category)

  const category = menu?.categories?.find((c: any) => getCategorySlug(c, locale) === slugParam)
  if (!category) return notFound()

  const categoryTitle =
    typeof category.name === "object" ? category.name?.[locale] ?? category.name?.ar : category.name

  const categoryDesc =
    typeof category.description === "object" ? category.description?.[locale] ?? category.description?.ar : category.description

  return (
  <>
    <MainNav />

    <MobileLayout restaurant={restaurant}>
      <main className="min-h-screen bg-background text-foreground">
        {/* Header / Intro */}
        <section className="mx-auto w-full max-w-6xl px-4 pt-6 pb-4 sm:px-6 sm:pt-8 sm:pb-6 lg:px-8">
          {/* Title */}
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl md:text-4xl">
            {categoryTitle}
          </h1>

          {/* Description */}
          {categoryDesc ? (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {categoryDesc}
            </p>
          ) : null}
        </section>

        {/* Content */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
          {renderSection(
            {
              id: "category-menu",
              type: "menu-dynamic",
              position: 1,
              layout: {
                container: "page",
                paddingY: { base: "0px", md: "0px" },
                paddingX: { base: "0px", md: "0px" },
              },
              data: { source: "menu", categoryId: category._id.toString() },
              ui: {
                layout: "grid",
                cols: { base: 2, md: 2, lg: 3 },
                cardVariant: "add",
                stickyCategoryTitle: false, // صفحة قسم واحدة
                // لو عندك Bottom bar في الموبايل، خلي مساحة تحت:
                // stickyTop: "top-[120px] md:top-20"
              },
              elements: [],
            } as any,
            {
              dataSources: { menu },
              locale,
              searchParams: {},
            },
          )}
        </section>
      </main>
    </MobileLayout>
  </>
)

}
