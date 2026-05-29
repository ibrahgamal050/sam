import Image from "next/image"
import Link from "next/link"
import { Clock, MapPin, Navigation, Phone, Building2 } from "lucide-react"
import type { IRestaurant } from "@/types"
import { resolveImageSrc } from "@/lib/resolve-image-src"
import { getLocalizedText } from "@/lib/localize"

interface BranchesPageProps {
  restaurant: IRestaurant
}

export function BranchesPage({ restaurant }: BranchesPageProps) {
  const branches = restaurant.branches || []
  const restaurantName = getLocalizedText(restaurant.name, "Ресторан")
  const coverImage = resolveImageSrc(restaurant.logo)
  const logoImage = resolveImageSrc(restaurant.logo, "/placeholder-logo.png")

  if (branches.length === 0) {
    return (
      <div className="min-h-screen bg-white text-gray-900" dir="ltr">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-16 text-center sm:px-6">
          <div className="relative overflow-hidden rounded-[32px] border border-gray-200 bg-gradient-to-br from-[#f7f9fc] to-white p-12 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.35)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(247,195,37,0.18),_transparent_60%)]" />
            <div className="relative space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fef3c7] text-[#f59e0b]">
                <Building2 className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Филиалы пока не добавлены</h1>
              <p className="mx-auto max-w-2xl text-sm leading-7 text-gray-600">
                Филиалы ресторана появятся здесь сразу после добавления. Следите за обновлениями, чтобы узнать о новых точках и доступных услугах доставки в вашем районе.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900" dir="ltr">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:pt-12">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[32px] border border-gray-200 bg-gradient-to-br from-[#f7f9fc] via-white to-white shadow-[0_25px_60px_-35px_rgba(15,23,42,0.4)]">
          <div className="absolute inset-0">
            <Image src={coverImage} alt={restaurantName} fill className="object-cover opacity-35" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-[#eef2f7]/70" />
          </div>

          <div className="relative grid gap-8 p-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:p-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full bg-black/5 px-4 py-2 text-xs font-semibold text-gray-600">
                <span className="flex h-2 w-2 rounded-full bg-[#f7c325]" />
                {branches.length} {branches.length === 1 ? "филиал" : "филиалов"} доступно
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white shadow-lg">
                  <Image src={logoImage} alt={restaurantName} fill className="object-cover" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">Филиалы {restaurantName}</h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Выберите ближайший филиал для прямой связи и информации о доступных услугах доставки.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
              <h2 className="text-base font-semibold text-gray-800">Основные услуги</h2>
              <ul className="mt-5 space-y-4 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f9fc] text-gray-700">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Гибкий график работы</p>
                    <p className="text-xs text-gray-500">Все филиалы работают ежедневно, чтобы покрыть ваши потребности в течение всего дня.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f9fc] text-gray-700">
                    <Navigation className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Удобные расположения</p>
                    <p className="text-xs text-gray-500">Выберите любимый филиал с удобным доступом и доступными услугами доставки.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f9fc] text-gray-700">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Быстрая поддержка</p>
                    <p className="text-xs text-gray-500">Наша команда готова ответить на ваши вопросы и принять специальные заказы.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Branch cards */}
        <section className="mt-12 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">Наши филиалы</h2>
              <p className="text-sm text-gray-600">Выберите ближайший филиал, чтобы узнать контактные данные и услуги доставки.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {branches.map((branch) => {
              const branchName = getLocalizedText(branch.name, "Филиал")
              const branchKey = branch._id ? branch._id.toString() : `${branchName}-${branch.phone ?? ""}`
              const branchImage = resolveImageSrc(restaurant.logo)
              const branchAddress = getLocalizedText(branch.location?.address, "Адрес недоступен")
              const hasLocation = Boolean(branch.location?.latitude && branch.location?.longitude)

              return (
                <article
                  key={branchKey}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_20px_45px_-35px_rgba(15,23,42,0.3)] transition duration-300 hover:-translate-y-1 hover:border-gray-300"
                >
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image src={branchImage} alt={`Филиал ${branchName}`} fill className="object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 text-white">
                      <h3 className="text-lg font-semibold">{branchName}</h3>
                      {branch.isMainBranch && <p className="text-xs font-medium text-white/80">Главный филиал</p>}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-5 px-6 py-6">
                    <div className="space-y-4 text-sm text-gray-600">
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f9fc] text-gray-700">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-700">{branchAddress}</p>
                          {hasLocation && (
                            <Link
                              href={`https://www.google.com/maps/search/?api=1&query=${branch.location.latitude},${branch.location.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-[#f7c325] hover:text-[#eab308]"
                            >
                              <Navigation className="h-3.5 w-3.5" />
                              Маршрут на карте
                            </Link>
                          )}
                        </div>
                      </div>

                      {branch.phone && (
                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f9fc] text-gray-700">
                            <Phone className="h-5 w-5" />
                          </div>
                          <div>
                            <Link dir="ltr" href={`tel:${branch.phone}`} className="text-sm font-semibold text-gray-800 hover:text-[#f7c325]">
                              {branch.phone}
                            </Link>
                            <p className="text-xs text-gray-500">Для бронирований и вопросов</p>
                          </div>
                        </div>
                      )}

                      {branch.workingHours && (
                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f9fc] text-gray-700">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Часы работы</p>
                            <p className="text-sm text-gray-600">{branch.workingHours}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

export function BranchesPageSkeleton() {
  return (
    <div className="min-h-screen bg-white" dir="ltr">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="h-[280px] animate-pulse rounded-[32px] bg-gray-100" />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-[320px] animate-pulse rounded-3xl bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  )
}
