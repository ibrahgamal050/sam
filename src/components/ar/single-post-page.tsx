"use client"

import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, Share2 } from 'lucide-react'
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useRestaurant } from "@/contexts/restaurant-context"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

interface Post {
  _id: string
  title: string
  content: string
  image: string
  createdAt: string
}

export function SinglePostPage({ id }: { id: string }) {
  const router = useRouter()
  const { restaurant } = useRestaurant()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const slug = params?.slug as string

  useEffect(() => {
    const fetchPost = async () => {
      if (!restaurant) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/restaurants/${slug}/posts/${id}`)

        if (response.ok) {
          const data = await response.json()
          setPost(data)
        } else {
          // Post not found
          console.error("المنشور غير موجود")
        }
      } catch (error) {
        console.error("خطأ في جلب المنشور:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (restaurant) {
      fetchPost()
    }
  }, [restaurant, slug, id])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.content.substring(0, 100).replace(/<[^>]*>/g, ""),
          url: window.location.href,
        })
      } catch (error) {
        console.error("خطأ في المشاركة:", error)
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert("تم نسخ الرابط إلى الحافظة!")
    }
  }

  if (isLoading) {
    return <SinglePostSkeleton />
  }

  if (!post) {
    return (
      <div className="p-4 text-center">
        <p>المنشور غير موجود</p>
        <Button variant="link" onClick={() => router.push(`/${slug}/posts`)}>
          العودة إلى المنشورات
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push(`/${slug}/posts`)}>
        <ChevronLeft className="h-4 w-4 mr-1" /> العودة إلى المنشورات
      </Button>

      <h1 className="text-2xl font-bold">{post.title}</h1>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>{format(new Date(post.createdAt), "MMMM d, yyyy")}</span>
      </div>

      <div className="relative w-full h-48 rounded-lg overflow-hidden">
        <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

      <div className="pt-4 border-t flex justify-between items-center">
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleShare}>
          <Share2 className="h-4 w-4" /> مشاركة
        </Button>
      </div>
    </div>
  )
}

function SinglePostSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-9 w-32 rounded-md" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="pt-4 border-t">
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  )
}