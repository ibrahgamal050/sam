import { Button } from "@/components/ui/button"
import { Clock, MapPin, Phone, Star, Utensils } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { IRestaurant } from "@/types"
import { resolveImageSrc } from "@/lib/resolve-image-src"

interface RestaurantHomeProps {
  restaurant: IRestaurant
}

export function RestaurantHome({ restaurant }: RestaurantHomeProps) {
  const direction = "ltr"

  const restaurantName = restaurant.name.ru || restaurant.name.en

  const restaurantDescription =
    typeof restaurant.description === "object"
      ? restaurant.description.ru || restaurant.description.en
      : restaurant.description

  const coverImage = resolveImageSrc(restaurant.logo)
  const logoImage = resolveImageSrc(restaurant.logo, "/placeholder-logo.png")
  const primaryPhone = restaurant.phones?.[0]
  const primaryBranch =
    restaurant.branches?.find((b) => b.isMainBranch) || restaurant.branches?.[0]

  return (
    <div className="min-h-screen bg-white text-gray-900" dir={direction}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-6 lg:pt-12">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[32px] border border-gray-200 bg-gradient-to-br from-[#f7f9fc] via-white to-white">

          <div className="absolute inset-0">
            <Image
              src={coverImage}
              alt={restaurantName}
              fill
              className="object-cover opacity-40"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white/90 to-[#eef2f7]/70" />
          </div>

          <div className="relative grid gap-8 p-8 md:grid-cols-[1fr_280px] md:items-center lg:p-12">

            <div className="space-y-6">

              <div className="inline-flex items-center gap-3 rounded-full bg-black/5 px-4 py-2 text-xs font-semibold text-gray-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Открыто сейчас
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl border">
                  <Image src={logoImage} alt={restaurantName} fill />
                </div>

                <div>
                  <h1 className="text-3xl font-bold sm:text-4xl">
                    {restaurantName}
                  </h1>

                  {primaryBranch?.location?.address?.ru && (
                    <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {primaryBranch.location.address.ru}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-sm leading-7 text-gray-600">
                {restaurantDescription ||
                  "Наслаждайтесь блюдами, приготовленными из свежих ингредиентов с вниманием к каждой детали."}
              </p>

              <div className="flex flex-wrap items-center gap-4">

                <Link href="/ru/menu">
                  <Button className="rounded-2xl bg-[#f7c325] px-6 py-5 text-black">
                    <Utensils className="h-5 w-5" />
                    Посмотреть меню
                  </Button>
                </Link>

                <Link href="/ru/about">О нас</Link>
                <Link href="/ru/branches">Филиалы</Link>
              </div>
            </div>

            {/* Info */}
            <div className="rounded-3xl border bg-white/80 p-6">
              <h2 className="font-semibold">Краткая информация</h2>

              <ul className="mt-5 space-y-4 text-sm">

                <li className="flex gap-3">
                  <Star />
                  <div>
                    <p className="font-semibold">Рейтинг</p>
                    <p className="text-xs text-gray-500">4.6 / 5</p>
                  </div>
                </li>

                <li className="flex gap-3">
                  <Clock />
                  <div>
                    <p className="font-semibold">Время работы</p>
                    <p className="text-xs text-gray-500">10:00 – 00:00</p>
                  </div>
                </li>

                {primaryPhone && (
                  <li className="flex gap-3">
                    <Phone />
                    <div>
                      <p className="font-semibold">Телефон</p>
                      <a href={`tel:${primaryPhone}`} className="text-xs">
                        {primaryPhone}
                      </a>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          <div className="rounded-3xl border bg-[#f7f9fc] p-6">
            <h3 className="text-lg font-semibold">Почему мы?</h3>

            <ul className="mt-4 space-y-2 text-sm">
              <li>• Свежие ингредиенты каждый день</li>
              <li>• Разнообразное меню</li>
              <li>• Быстрая доставка</li>
            </ul>
          </div>

          <div className="rounded-3xl border p-6">
            <h3 className="text-lg font-semibold">Быстрые ссылки</h3>

            <div className="mt-4 space-y-3">
              <Link href="/ru/menu">Меню</Link>
              <Link href="/ru/branches">Филиалы</Link>
              <Link href="/ru/about">О ресторане</Link>
            </div>
          </div>

          <div className="rounded-3xl border p-6">
            <h3 className="text-lg font-semibold">Доп. услуги</h3>
            <p className="mt-2 text-sm text-gray-600">
              Кейтеринг и мероприятия под заказ
            </p>
          </div>

        </section>

        {/* About */}
        <section className="rounded-3xl border p-8">
          <h2 className="text-2xl font-semibold">
            О {restaurantName}
          </h2>

          <p className="mt-3 text-sm text-gray-600">
            {restaurantDescription ||
              "Мы стремимся создать лучший гастрономический опыт."}
          </p>

          <Link href="/ru/about">Подробнее</Link>
        </section>

        {/* CTA */}
        <section className="rounded-3xl bg-yellow-300 p-8 text-center">
          <h2 className="text-2xl font-bold">Готовы попробовать?</h2>

          <p className="mt-2 text-sm">
            Закажите онлайн или свяжитесь с нами
          </p>

          {primaryPhone && (
            <a href={`tel:${primaryPhone}`} className="mt-4 inline-block">
              📞 Позвонить
            </a>
          )}
        </section>

      </div>
    </div>
  )
}