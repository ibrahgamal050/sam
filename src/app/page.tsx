import Image from "next/image"
import Link from "next/link"

import { Search } from "lucide-react"

import { dbConnect } from "@/lib/db"
import Restaurant from "@/models/restaurant"
import type { IRestaurant } from "@/types/restaurant"

type RestaurantCardData = Pick<
  IRestaurant,
  "name" | "subdomain" | "logo" | "coverImage" | "description" | "phones"
> & { _id: string }

const resolveImageSrc = (path: string | undefined | null, fallback = "/placeholder.svg") => {
  if (!path) return fallback
  if (path.startsWith("http")) return path

  if (path.startsWith("/images/")) {
    return path
  }

  const normalized = path.startsWith("/") ? path : `/${path}`
  return `/images${normalized}`
}

const buildRestaurantUrl = (subdomain: string) => {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  const hasCustomDomain = rootDomain && rootDomain !== "your_root_domain.com"

  if (!hasCustomDomain) {
    return `/${subdomain}`
  }

  const protocol = rootDomain!.includes("localhost") ? "http" : "https"
  return `${protocol}://${subdomain}.${rootDomain}`
}

const formatDescription = (description?: string) => {
  if (!description) return ""
  if (description.length <= 140) return description
  return `${description.slice(0, 137)}...`
}

interface HomePageProps {
  searchParams?: {
    q?: string
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  await dbConnect()

  const searchTerm = searchParams?.q?.trim() ?? ""

  const queryFilter = searchTerm
    ? {
        $or: [
          { "name.ar": { $regex: searchTerm, $options: "i" } },
          { "name.en": { $regex: searchTerm, $options: "i" } },
          { subdomain: { $regex: searchTerm, $options: "i" } },
        ],
      }
    : {}

  const restaurants = await Restaurant.find(queryFilter)
    .sort({ createdAt: -1 })
    .lean<IRestaurant[]>()

  const restaurantCards: RestaurantCardData[] = restaurants.map((restaurant) => ({
    _id: restaurant._id?.toString() ?? restaurant.subdomain,
    name: restaurant.name,
    subdomain: restaurant.subdomain,
    logo: restaurant.logo,
    coverImage: restaurant.coverImage,
    description: restaurant.description,
    phones: restaurant.phones,
  }))

  const noResultsMessage = searchTerm
    ? `لا توجد نتائج لبحث "${searchTerm}".`
    : "لا توجد مطاعم متاحة حالياً."

  return (
    <main className="min-h-screen bg-gray-50" dir="rtl">
      <section className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6">
        <header className="space-y-6">
          <div className="space-y-3 text-center sm:text-right">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">كل المطاعم في مكان واحد</h1>
            <p className="mx-auto max-w-3xl text-sm text-gray-600 sm:text-base">
              تصفح جميع المطاعم المتاحة على Meelza واختر مطعمك المفضل لعرض المنيو، الفروع، والمزيد من التفاصيل.
            </p>
          </div>
          <form className="mx-auto flex max-w-2xl items-center gap-3 rounded-full bg-white p-2 shadow-sm ring-1 ring-gray-200 focus-within:ring-[#6C5CE7]/40"
            role="search"
            action="/"
            method="get"
          >
            <label htmlFor="restaurant-search" className="sr-only">
              ابحث عن مطعم
            </label>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7]">
              <Search className="h-5 w-5" />
            </span>
            <input
              id="restaurant-search"
              name="q"
              defaultValue={searchTerm}
              placeholder="ابحث بالاسم أو النطاق الفرعي"
              className="h-10 flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
              autoComplete="off"
            />
            {searchTerm && (
              <Link
                href="/"
                prefetch={false}
                className="rounded-full px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                إعادة الضبط
              </Link>
            )}
            <button
              type="submit"
              className="rounded-full bg-[#6C5CE7] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5A4BD1]"
            >
              بحث
            </button>
          </form>
        </header>

        {restaurantCards.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-10 text-center text-gray-500">
            {noResultsMessage}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {restaurantCards.map((restaurant) => {
              const restaurantUrl = buildRestaurantUrl(restaurant.subdomain)
              const isExternal = restaurantUrl.startsWith("http")

              return (
                <article
                  key={restaurant._id}
                  className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                    <Image
                      src={resolveImageSrc(restaurant.coverImage, "/placeholder.svg")}
                      alt={`صورة ${restaurant.name.ar}`}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
                    />
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-full border bg-gray-50">
                        <Image
                          src={resolveImageSrc(restaurant.logo, "/placeholder.svg")}
                          alt={`شعار ${restaurant.name.ar}`}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{restaurant.name.ar}</h2>
                        <p className="text-xs text-gray-500" dir="ltr">
                          {restaurant.subdomain}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm leading-6 text-gray-600">
                      {formatDescription(restaurant.description)}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-sm text-gray-500">
                      {restaurant.phones?.[0] ? (
                        <span dir="ltr">{restaurant.phones[0]}</span>
                      ) : (
                        <span className="invisible select-none" aria-hidden>
                          placeholder
                        </span>
                      )}

                      <Link
                        href={`http://${restaurantUrl}.localhost:3000`}
                        className="inline-flex items-center gap-2 text-[#6C5CE7] transition hover:text-[#5A4BD1]"
                        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        تصفح الموقع
                        <span aria-hidden>↗</span>
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
