import Image from "next/image"
import { Award, Heart, Star, Users, Utensils } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { resolveImageSrc } from "@/lib/resolve-image-src"
import type { IPage } from "@/types/page"

interface AboutPageProps {
  data: IPage
  logo: string
}

export default function AboutPage({ data, logo }: AboutPageProps) {
  const components = data?.components ?? []

  return (
    <div className="min-h-screen bg-white text-gray-900" dir="rtl">
      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:pt-12">
        {components.map((component) => {
          const { type, props = {} } = component as any
          const key = component.component_id || component._id || type

          switch (type) {
            case "header": {
              const heroImage = resolveImageSrc(props.backgroundImage || logo)
              return (
                <section
                  key={key}
                  className="relative mb-10 overflow-hidden rounded-[32px] border border-gray-200 bg-gradient-to-br from-[#f7f9fc] via-white to-white shadow-[0_25px_60px_-35px_rgba(15,23,42,0.35)]"
                >
                  <div className="absolute inset-0">
                    <Image src={heroImage} alt={props.title || "عن المطعم"} fill className="object-cover opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-[#eef2f7]/70" />
                  </div>
                  <div className="relative flex flex-col gap-4 px-8 py-12 text-gray-900 sm:px-12">
                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-black/5 px-4 py-2 text-xs font-semibold text-gray-600">
                      <Utensils className="h-4 w-4" /> قصتنا
                    </span>
                    <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{props.title}</h1>
                    {props.subtitle && <p className="max-w-2xl text-sm leading-7 text-gray-600">{props.subtitle}</p>}
                  </div>
                </section>
              )
            }

            case "story": {
              const paragraphs = (props.contentParagraphs as string[]) || []
              return (
                <section key={key} className="mb-10 space-y-5 rounded-[32px] border border-gray-200 bg-white p-8 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.45)]">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f7f9fc] text-[#f59e0b]">
                      <Utensils className="h-4 w-4" />
                    </span>
                    <h2 className="text-xl font-semibold text-gray-900">{props.title || "قصتنا"}</h2>
                  </div>
                  <div className="space-y-4 text-sm leading-7 text-gray-600">
                    {paragraphs.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              )
            }

            case "mission":
              return (
                <section key={key} className="mb-10 rounded-[32px] border border-gray-200 bg-gradient-to-r from-[#fdf4cf] via-[#fdeab5] to-[#f7c325] p-8 shadow-[0_25px_60px_-35px_rgba(245,158,11,0.6)]">
                  <div className="flex flex-col gap-5 text-[#1f1a09]">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-black/10 text-black/70">
                        <Star className="h-4 w-4" />
                      </span>
                      <h2 className="text-xl font-semibold">{props.title || "رؤيتنا"}</h2>
                    </div>
                    <div className="rounded-2xl bg-white/70 p-5 text-sm leading-7 text-[#3a3016]">
                      <div className="flex gap-4">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fef3c7] text-[#f59e0b]">
                          <Heart className="h-5 w-5" />
                        </span>
                        <p>{props.content}</p>
                      </div>
                    </div>
                  </div>
                </section>
              )

            case "values": {
              const items = (props.items as { id: string; number: number; title: string; description: string }[]) || []
              return (
                <section key={key} className="mb-10 rounded-[32px] border border-gray-200 bg-white p-8 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.45)]">
                  <div className="mb-6 flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f7f9fc] text-[#f59e0b]">
                      <Award className="h-4 w-4" />
                    </span>
                    <h2 className="text-xl font-semibold text-gray-900">{props.title || "قيمنا"}</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {items.map((item) => (
                      <Card key={item.id} className="border border-gray-100 bg-[#f7f9fc] shadow-sm">
                        <CardContent className="flex items-start gap-3 p-4">
                          <Badge className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7c325] text-black">
                            {item.number}
                          </Badge>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                            <p className="mt-1 text-xs text-gray-600">{item.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )
            }

            case "team": {
              const members = (props.members as { id: string; name: string; role: string; image?: string }[]) || []
              const fallbackMembers = [
                { id: "1", name: "أحمد محمد", role: "الشيف التنفيذي" },
                { id: "2", name: "سارة أحمد", role: "مديرة المطعم" },
                { id: "3", name: "محمد علي", role: "شيف المعجنات" },
                { id: "4", name: "ليلى خالد", role: "مديرة خدمة العملاء" },
              ]
              const teamToRender = members.length > 0 ? members : fallbackMembers

              return (
                <section key={key} className="mb-10 rounded-[32px] border border-gray-200 bg-white p-8 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.45)]">
                  <div className="mb-6 flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f7f9fc] text-[#f59e0b]">
                      <Users className="h-4 w-4" />
                    </span>
                    <h2 className="text-xl font-semibold text-gray-900">فريقنا</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {teamToRender.map((member) => {
                      const photo = resolveImageSrc(member.image, "/placeholder-user.jpg")
                      return (
                        <Card key={member.id} className="overflow-hidden border border-gray-100 bg-[#f7f9fc] shadow-sm">
                          <div className="relative h-36 w-full">
                            <Image src={photo} alt={member.name} fill className="object-cover" />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="text-sm font-semibold text-gray-900">{member.name}</h3>
                            <p className="mt-1 text-xs text-gray-600">{member.role}</p>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </section>
              )
            }

            default:
              return null
          }
        })}
      </div>
    </div>
  )
}
