"use client"

import type React from "react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, Globe } from "lucide-react"
import { useState } from "react"
import { useRestaurant } from "@/contexts/restaurant-context"
import { useParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { resolveImageSrc } from "@/lib/resolve-image-src"

export function ContactPage() {
  const { restaurant, isLoading } = useRestaurant()
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const params = useParams()
  const slug = params?.slug as string

  const primaryBranch =
    restaurant?.branches?.find((branch) => branch.isMainBranch) || restaurant?.branches?.[0]

  const addressValue = (() => {
    if (!restaurant?.location?.address) {
      return (
        primaryBranch?.location?.address?.ar ||
        primaryBranch?.location?.address?.en ||
        "العنوان غير متوفر"
      )
    }

    if (typeof restaurant.location.address === "string") {
      return restaurant.location.address
    }

    return (
      restaurant.location.address.ar ||
      restaurant.location.address.en ||
      primaryBranch?.location?.address?.ar ||
      primaryBranch?.location?.address?.en ||
      "العنوان غير متوفر"
    )
  })()

  const phoneNumbers = Array.from(
    new Set(
      [
        restaurant?.phone,
        ...(restaurant?.phones ?? []),
        primaryBranch?.phone,
      ].filter(Boolean) as string[],
    ),
  )

  const emailValue = restaurant?.email || "البريد الإلكتروني غير متوفر"
  const websiteValue = restaurant?.website

  const latitude = restaurant?.location?.latitude ?? primaryBranch?.location?.latitude
  const longitude = restaurant?.location?.longitude ?? primaryBranch?.location?.longitude
  const hasCoordinates = latitude != null && longitude != null

  const heroImage = resolveImageSrc(restaurant?.logo || restaurant?.logo)
  const restaurantName = restaurant?.name?.ar || restaurant?.name?.en
  const heroTitle = restaurantName ? `تواصل مع ${restaurantName}` : "تواصل معنا"
  const heroDescription =
    typeof restaurant?.description === "object"
      ? restaurant?.description?.ar || restaurant?.description?.en
      : restaurant?.description
  const heroSubtitle =
    heroDescription ||
    "يسعدنا تلقي استفساراتكم وملاحظاتكم في أي وقت. فريق خدمة العملاء جاهز لمساعدتكم دائماً."

  const highlightItems = [
    {
      icon: MapPin,
      label: "عنواننا",
      value: addressValue,
    },
    {
      icon: Phone,
      label: "رقم التواصل",
      value: phoneNumbers[0] ?? "رقم الهاتف غير متوفر",
      dir: phoneNumbers.length > 0 ? "ltr" : undefined,
    },
    {
      icon: Mail,
      label: "البريد الإلكتروني",
      value: emailValue,
      dir: "ltr" as const,
    },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!restaurant) return

    try {
      setIsSubmitting(true)
      setSubmitMessage(null)

      // In a real app, you would send this data to your backend
      const response = await fetch(`/api/restaurants/${slug}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formState,
          restaurantId: restaurant._id,
        }),
      })

      if (response.ok) {
        setSubmitMessage({
          type: "success",
          text: "شكراً لرسالتك! سنرد عليك قريباً.",
        })
        setFormState({ name: "", email: "", message: "" })
      } else {
        setSubmitMessage({
          type: "error",
          text: "فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى لاحقاً.",
        })
      }
    } catch (error) {
      console.error("خطأ في إرسال النموذج:", error)
      setSubmitMessage({
        type: "error",
        text: "حدث خطأ. يرجى المحاولة مرة أخرى لاحقاً.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <ContactPageSkeleton />
  }

  return (
    <div className="min-h-screen bg-white text-gray-900" dir="rtl">
      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:pt-12">
        <section className="relative overflow-hidden rounded-[32px] border border-gray-200 bg-gradient-to-br from-[#f7f9fc] via-white to-white shadow-[0_25px_60px_-35px_rgba(15,23,42,0.35)]">
          <div className="absolute inset-0">
            <Image src={heroImage} alt={heroTitle} fill className="object-cover opacity-35" />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-[#eef2f7]/70" />
          </div>
          <div className="relative space-y-6 px-8 py-12 sm:px-12">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-black/5 px-4 py-2 text-xs font-semibold text-gray-600">
              <span className="flex h-2 w-2 rounded-full bg-[#f7c325]" />
              يسعدنا التواصل معكم
            </span>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">{heroTitle}</h1>
              <p className="max-w-2xl text-sm leading-7 text-gray-600">{heroSubtitle}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {highlightItems.map((item, idx) => {
                const Icon = item.icon
                return (
                  <div
                    key={`${item.label}-${idx}`}
                    className="flex items-start gap-3 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_15px_35px_-30px_rgba(15,23,42,0.5)] backdrop-blur"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f7f9fc] text-gray-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="space-y-1 text-sm">
                      <p className="text-xs font-semibold text-gray-500">{item.label}</p>
                      <p className="font-semibold text-gray-800" dir={item.dir}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-8">
            <Card className="rounded-[28px] border-gray-200 bg-white/90 shadow-[0_25px_55px_-40px_rgba(15,23,42,0.4)] backdrop-blur">
              <CardContent className="space-y-6 p-6 sm:p-8">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">معلومات التواصل</h2>
                  <p className="text-sm leading-7 text-gray-600">
                    نرحب بكل استفساراتكم واقتراحاتكم. يمكنكم التواصل معنا عبر القنوات التالية، وسيقوم فريقنا بالرد في أقرب وقت.
                  </p>
                </div>

                <div className="space-y-5 text-sm text-gray-700">
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7f9fc] text-gray-700">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500">العنوان</p>
                      <p className="leading-6 text-gray-800">{addressValue}</p>
                    </div>
                  </div>

                  {phoneNumbers.length > 0 && (
                    <div className="flex items-start gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7f9fc] text-gray-700">
                        <Phone className="h-5 w-5" />
                      </span>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-500">أرقام الهاتف</p>
                        <div className="flex flex-col gap-1 text-sm font-semibold text-gray-800">
                          {phoneNumbers.map((phone) => (
                            <a key={phone} dir="ltr" href={`tel:${phone}`} className="hover:text-[#f7c325]">
                              {phone}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7f9fc] text-gray-700">
                      <Mail className="h-5 w-5" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500">البريد الإلكتروني</p>
                      {restaurant?.email ? (
                        <a href={`mailto:${restaurant.email}`} dir="ltr" className="text-sm font-semibold text-gray-800 hover:text-[#f7c325]">
                          {restaurant.email}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-600">{emailValue}</p>
                      )}
                    </div>
                  </div>

                  {websiteValue && (
                    <div className="flex items-start gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7f9fc] text-gray-700">
                        <Globe className="h-5 w-5" />
                      </span>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-500">الموقع الإلكتروني</p>
                        <a
                          href={websiteValue}
                          target="_blank"
                          rel="noopener noreferrer"
                          dir="ltr"
                          className="text-sm font-semibold text-gray-800 hover:text-[#f7c325]"
                        >
                          {websiteValue.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-[28px] border-gray-200 bg-white/90 shadow-[0_25px_55px_-40px_rgba(15,23,42,0.4)] backdrop-blur">
              <CardContent className="space-y-4 p-0">
                <div className="space-y-2 px-6 pt-6 sm:px-8">
                  <h2 className="text-xl font-semibold text-gray-900">موقعنا على الخريطة</h2>
                  <p className="text-sm leading-7 text-gray-600">يمكنك الوصول إلينا بسهولة من خلال تحديد الموقع على خرائط جوجل.</p>
                </div>
                <div className="relative mt-2 h-72 w-full overflow-hidden rounded-t-[32px] sm:rounded-t-[36px]">
                  {hasCoordinates ? (
                    <iframe
                      title="موقع المطعم"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${latitude},${longitude}`}
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#f7f9fc] text-gray-500">
                      <MapPin className="h-8 w-8" />
                      <span className="text-sm">لم يتم توفير موقع الخريطة بعد</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="rounded-[28px] border-gray-200 bg-white/90 shadow-[0_25px_55px_-40px_rgba(15,23,42,0.4)] backdrop-blur">
              <CardContent className="space-y-5 p-6 sm:p-8">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">أرسل لنا رسالة</h2>
                  <p className="text-sm leading-7 text-gray-600">
                    اترك لنا تفاصيل تواصلك ورسالتك، وسنحرص على الرد عليك خلال ساعات العمل.
                  </p>
                </div>

                {submitMessage && (
                  <div
                    className={`rounded-2xl p-4 text-sm font-semibold ${
                      submitMessage.type === "success"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {submitMessage.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                      الاسم الكامل
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formState.name}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="rounded-2xl border-gray-200 bg-white/90 focus-visible:ring-[#f7c325]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                      البريد الإلكتروني
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      dir="ltr"
                      className="rounded-2xl border-gray-200 bg-white/90 focus-visible:ring-[#f7c325]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-semibold text-gray-700">
                      الرسالة
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      rows={5}
                      required
                      disabled={isSubmitting}
                      className="rounded-2xl border-gray-200 bg-white/90 focus-visible:ring-[#f7c325]"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-2xl bg-[#f7c325] py-5 text-base font-semibold text-black shadow-lg transition hover:bg-[#ffd342]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "جاري الإرسال..." : "إرسال الرسالة"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {(restaurant?.social?.facebook ||
              restaurant?.social?.instagram ||
              restaurant?.social?.twitter ||
              restaurant?.social?.tiktok) && (
              <Card className="rounded-[28px] border-gray-200 bg-white/90 shadow-[0_25px_55px_-40px_rgba(15,23,42,0.4)] backdrop-blur">
                <CardContent className="space-y-5 p-6 sm:p-8">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900">تابعنا على الشبكات الاجتماعية</h2>
                    <p className="text-sm leading-7 text-gray-600">
                      كن جزءاً من مجتمعنا وتابع آخر العروض والأخبار الحصرية عبر قنوات التواصل الاجتماعي.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {restaurant?.social?.facebook && (
                      <a
                        href={restaurant.social.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-[#f7f9fc] px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#f7c325] hover:text-gray-900"
                      >
                        <Facebook className="h-5 w-5" /> فيسبوك
                      </a>
                    )}
                    {restaurant?.social?.instagram && (
                      <a
                        href={restaurant.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-[#f7f9fc] px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#f7c325] hover:text-gray-900"
                      >
                        <Instagram className="h-5 w-5" /> انستجرام
                      </a>
                    )}
                    {restaurant?.social?.twitter && (
                      <a
                        href={restaurant.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-[#f7f9fc] px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#f7c325] hover:text-gray-900"
                      >
                        <Twitter className="h-5 w-5" /> تويتر
                      </a>
                    )}
                    {restaurant?.social?.tiktok && (
                      <a
                        href={restaurant.social.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-[#f7f9fc] px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#f7c325] hover:text-gray-900"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                          <path d="M15 8a4 4 0 0 0 0 8" />
                          <path d="M15 8a4 4 0 0 1 4 4V4" />
                          <line x1="15" y1="12" x2="15" y2="20" />
                        </svg>
                        تيك توك
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactPageSkeleton() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 sm:px-6">
        <Skeleton className="h-64 w-full rounded-[32px]" />

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <Skeleton className="h-72 w-full rounded-[28px]" />
            <Skeleton className="h-80 w-full rounded-[28px]" />
          </div>
          <div className="space-y-8">
            <Skeleton className="h-96 w-full rounded-[28px]" />
            <Skeleton className="h-56 w-full rounded-[28px]" />
          </div>
        </div>
      </div>
    </div>
  )
}
