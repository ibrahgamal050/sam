"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useRestaurant } from "@/contexts/restaurant-context"
import { Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ar as arLocale } from "date-fns/locale"

type PostImage = string | string[] | undefined | null

interface Post {
  _id: string
  title: string
  content: unknown
  image?: PostImage
  createdAt: string | Date
  seo?: { slug?: string }
}

export function PostsPage() {
  const { restaurant } = useRestaurant()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pathname = usePathname()

  const basePath = useMemo(() => {
    const segments = pathname?.split("/").filter(Boolean) ?? []
    const localeSegment = segments[0] ?? "ar"
    return `/${localeSegment}`
  }, [pathname])

  useEffect(() => {
    const fetchPosts = async () => {
      if (!restaurant) return
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch(`/api/restaurant/posts`, { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setPosts(Array.isArray(data) ? data : [])
      } catch (e: any) {
        console.error("خطأ في جلب المنشورات:", e)
        setError("حدث خطأ أثناء تحميل المنشورات. حاول مرة أخرى.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [restaurant])

  if (isLoading) return <PostsPageSkeleton />

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-4" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">أحدث الأخبار والفعاليات</h1>

      {posts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post, idx) => {
            // ✅ استخدم الـ slug إن وجد، وإلا fallback على الـ id
            const slug = post.seo?.slug || post._id
            const href = `${basePath}/posts/${slug}`

            const img = pickFirstImage(post.image) ?? "/placeholder.svg"
            const preview = truncate(extractTextFromContent(post.content), 140)
            const created = toValidDate(post.createdAt)
            const timeText = created
              ? formatDistanceToNow(created, { addSuffix: true, locale: arLocale })
              : "—"

            return (
              <Link href={href} key={slug} className="block focus:outline-none focus:ring-2 focus:ring-ring rounded-xl">
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative w-full h-44">
                      <Image
                        src={img}
                        alt={post.title || "منشور"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={idx < 2}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" aria-hidden />
                        <span>{timeText}</span>
                      </div>
                      <h2 className="font-semibold text-lg mb-1 line-clamp-2">{post.title}</h2>
                      <p className="text-sm text-muted-foreground line-clamp-3">{preview}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">لا توجد منشورات متاحة</p>
        </div>
      )}
    </div>
  )
}

/* -------------------- Helpers -------------------- */

function pickFirstImage(img: PostImage): string | undefined {
  if (!img) return undefined
  if (Array.isArray(img)) return img.find(Boolean)
  return img
}

function extractTextFromContent(content: unknown): string {
  if (!content) return ""
  if (typeof content === "string") return stripHtml(content)
  if (Array.isArray(content)) {
    return stripHtml(
      content
        .map((block: any) => {
          if (!block) return ""
          if (typeof block === "string") return block
          if (block?.type === "text" && typeof block?.text === "string") return block.text
          if (typeof block?.title === "string") return block.title
          if (typeof block?.subtitle === "string") return block.subtitle
          if (typeof block?.description === "string") return block.description
          return ""
        })
        .join(" ")
    )
  }
  if (typeof content === "object") {
    const any = content as any
    const pieces = [any.title, any.subtitle, any.text, any.description].filter(Boolean)
    return stripHtml(pieces.join(" "))
  }
  return ""
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function truncate(text: string, max = 140): string {
  if (!text) return ""
  if (text.length <= max) return text
  return text.slice(0, max).replace(/\s+\S*$/, "") + "..."
}

function toValidDate(d: string | Date): Date | null {
  try {
    const date = d instanceof Date ? d : new Date(d as string)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

function PostsPageSkeleton() {
  return (
    <div className="p-4" dir="rtl">
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border overflow-hidden">
            <Skeleton className="h-44 w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
