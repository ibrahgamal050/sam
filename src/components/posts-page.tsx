"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRestaurant } from "@/contexts/restaurant-context"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"

interface Post {
  _id: string
  title: string
  content: string
  image: string
  createdAt: string
}

export function PostsPage() {
  const { restaurant } = useRestaurant()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const slug = params?.slug as string

  useEffect(() => {
    const fetchPosts = async () => {
      if (!restaurant) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/restaurants/${slug}/posts`)

        if (response.ok) {
          const data = await response.json()
          setPosts(data)
        }
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (restaurant) {
      fetchPosts()
    }
  }, [restaurant, slug])

  if (isLoading) {
    return <PostsPageSkeleton />
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Latest News & Events</h1>

      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link href={`/${slug}/posts/${post._id}`} key={post._id}>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative w-full h-40">
                    <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                    </div>
                    <h2 className="font-semibold text-lg mb-1">{post.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {post.content.replace(/<[^>]*>/g, "").substring(0, 100)}...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No posts available</p>
        </div>
      )}
    </div>
  )
}

function PostsPageSkeleton() {
  return (
    <div className="p-4">
      <Skeleton className="h-8 w-48 mb-4" />

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border overflow-hidden">
            <Skeleton className="h-40 w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
