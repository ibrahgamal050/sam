import { Button } from "@/components/ui/button"
import { Clock, MapPin, Phone, Star, Utensils, ChevronRight, ArrowLeftRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { IRestaurant } from "@/types"

interface RestaurantHomeProps {
  restaurant: IRestaurant
}

export function RestaurantHome({ restaurant }: RestaurantHomeProps) {
  const direction = "rtl"
  const restaurantName = restaurant.name.ar
  const restaurantDescription =
    typeof restaurant.description === "object" ? restaurant.description.ar : restaurant.description

  const resolveImageSrc = (path?: string | null, fallback = "/placeholder.jpg") => {
    if (!path) return fallback
    if (path.startsWith("http")) return path
    if (path.startsWith("/images/")) return path
    const normalized = path.startsWith("/") ? path : `/${path}`
    return `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${normalized}`
  }

  const coverImage = resolveImageSrc(restaurant.logo)
  const logoImage = resolveImageSrc(restaurant.logo, "/placeholder-logo.png")
  const primaryPhone = restaurant.phones?.[0]
  const primaryBranch = restaurant.branches?.find((branch) => branch.isMainBranch) || restaurant.branches?.[0]

  return (
    <div className="min-h-screen bg-white text-gray-900" dir={direction}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-6 lg:pt-12">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[32px] border border-gray-200 bg-gradient-to-br from-[#f7f9fc] via-white to-white shadow-[0_25px_60px_-35px_rgba(15,23,42,0.4)]">
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

          <div className="relative grid gap-8 p-8 md:grid-cols-[minmax(0,1fr)_280px] md:items-center lg:p-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full bg-black/5 px-4 py-2 text-xs font-semibold text-gray-600">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                مفتوح الآن
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white shadow-lg">
                  <Image src={logoImage} alt={restaurantName} fill className="object-cover" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">{restaurantName}</h1>
                  {primaryBranch?.location?.address?.ar && (
                    <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {primaryBranch.location.address.ar}
                    </p>
                  )}
                </div>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-gray-600">
                {restaurantDescription ||
                  "استمتع بأطباق تم إعدادها بعناية باستخدام أفضل المكونات الطازجة، مع أجواء مريحة وخدمة ترحيبية طوال الوقت."}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/ar/menu">
                  <Button className="rounded-2xl bg-[#f7c325] px-6 py-5 text-base font-semibold text-black shadow-lg transition hover:bg-[#ffd342]">
                    <span className="inline-flex items-center gap-2">
                      <Utensils className="h-5 w-5" /> تصفح القائمة
                    </span>
                  </Button>
                </Link>
                <Link href="/ar/about" className="text-sm font-semibold text-gray-700 hover:text-gray-900">
                  من نحن؟
                </Link>
                <Link href="/ar/branches" className="text-sm font-semibold text-gray-700 hover:text-gray-900">
                  فروعنا
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
              <h2 className="text-base font-semibold text-gray-800">معلومات سريعة</h2>
              <ul className="mt-5 space-y-4 text-sm text-gray-600">
                <li className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f9fc] text-gray-700">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">تقييم الزوار</p>
                    <p className="text-xs text-gray-500">4.6 / 5 (أكثر من 200 تقييم)</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f9fc] text-gray-700">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">ساعات العمل</p>
                    <p className="text-xs text-gray-500">يومياً 10 صباحاً – 12 منتصف الليل</p>
                  </div>
                </li>
                {primaryPhone && (
                  <li className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f9fc] text-gray-700">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">اتصل بنا مباشرة</p>
                      <a dir="ltr" href={`tel:${primaryPhone}`} className="text-xs text-gray-500 hover:text-gray-700">
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
          <div className="rounded-3xl border border-gray-200 bg-[#f7f9fc] p-6 shadow-[0_15px_35px_-25px_rgba(15,23,42,0.35)]">
            <h3 className="text-lg font-semibold text-gray-900">لماذا تختارنا؟</h3>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              نحرص على تقديم وصفات محلية بلمسة عصرية، مع اهتمام بأدق التفاصيل لضمان تجربة فاخرة منذ وصولك وحتى آخر لقمة.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-gray-700">
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#f7c325]" /> مكونات طازجة يومياً</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#f7c325]" /> قائمة متنوعة تناسب جميع الأذواق</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#f7c325]" /> خدمة توصيل سريعة وآمنة</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_15px_35px_-25px_rgba(15,23,42,0.2)]">
            <h3 className="text-lg font-semibold text-gray-900">روابط سريعة</h3>
            <div className="mt-5 grid gap-3 text-sm font-semibold text-gray-700">
              <Link href="/ar/menu" className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 transition hover:border-gray-200 hover:bg-[#f7f9fc]">
                <span>عرض المنيو</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="/ar/branches" className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 transition hover:border-gray-200 hover:bg-[#f7f9fc]">
                <span>الفروع وخدمات التوصيل</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="/ar/about" className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 transition hover:border-gray-200 hover:bg-[#f7f9fc]">
                <span>تعرف على قصتنا</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_15px_35px_-25px_rgba(15,23,42,0.2)]">
            <h3 className="text-lg font-semibold text-gray-900">خدمات إضافية</h3>
            <p className="mt-3 text-sm text-gray-600">
              نوفر خدمات تقديم الطعام للحفلات والمناسبات الخاصة مع قوائم مصممة حسب احتياجاتك.
            </p>
            <div className="mt-5 flex flex-col gap-3 text-sm text-gray-700">
              <div className="flex items-center gap-3 rounded-2xl border border-gray-100 px-4 py-3">
                <ArrowLeftRight className="h-4 w-4" /> خدمة استلام الطلب من المطعم
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-gray-100 px-4 py-3">
                <MapPin className="h-4 w-4" /> تغطية كاملة للمنطقة المحيطة
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="grid gap-8 rounded-[32px] border border-gray-200 bg-white p-8 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.5)] md:grid-cols-[minmax(0,1fr)_320px] md:items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">عن {restaurantName}</h2>
            <p className="text-sm leading-7 text-gray-600">
              {restaurantDescription ||
                "منذ بدايتنا حرصنا على تقديم وصفات عريقة بلمسات عصرية. فريقنا يعمل بشغف لتقديم أفضل تجربة لضيوفنا، سواء اخترت تناول الطعام داخل المطعم أو عبر التوصيل."}
            </p>
            <Link href="/ar/about">
              <Button variant="outline" className="rounded-2xl border-gray-200 px-5 py-2 text-sm font-semibold">
                اكتشف المزيد عن المطعم
              </Button>
            </Link>
          </div>
          <div className="relative h-52 overflow-hidden rounded-3xl border border-gray-200 bg-[#f7f9fc]">
            <Image src={coverImage} alt={`${restaurantName} interior`} fill className="object-cover" />
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden rounded-[32px] border border-gray-200 bg-gradient-to-r from-[#fdf4cf] via-[#fdeab5] to-[#f7c325] p-8 shadow-[0_25px_60px_-35px_rgba(245,158,11,0.65)]">
          <div className="relative flex flex-col gap-6 text-center md:text-right">
            <h2 className="text-3xl font-bold text-[#1f1a09]">جاهز لتجربة نكهاتنا؟</h2>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-[#3a3016] md:ml-auto md:mr-0">
              اطلب عبر المنيو الإلكتروني أو تواصل مع فريقنا مباشرة لتنظيم مناسبتك القادمة.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end">
              {primaryPhone && (
                <a href={`tel:${primaryPhone}`} className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-900">
                  <Phone className="h-4 w-4" /> اتصال مباشر
                </a>
              )}
              <Link href="/ar/menu">
                <Button variant="ghost" className="rounded-2xl border border-black/20 bg-white/50 px-6 py-3 text-sm font-semibold text-black shadow">
                  تصفح الأطباق
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

// Loading skeleton for the home page
export function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="h-[320px] animate-pulse rounded-[32px] bg-gray-100" />

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-52 w-full animate-pulse rounded-3xl bg-gray-100" />
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
          <div className="h-64 animate-pulse rounded-3xl bg-gray-100" />
          <div className="h-64 animate-pulse rounded-3xl bg-gray-100" />
        </div>

        <div className="mt-10 h-56 animate-pulse rounded-[32px] bg-gray-100" />
      </div>
    </div>
  )
}
