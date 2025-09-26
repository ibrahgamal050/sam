import { notFound } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/restaurants/dashboard-header"
import { PostsManager } from "@/components/dashboard/posts/posts-manager"
import { getRestaurantById } from "@/lib/services/restaurant-service"
import { getPostsByRestaurantId } from "@/lib/services/post-service"

interface RestaurantPostsPageProps {
  params: {
    id: string
  }
}

export default async function RestaurantPostsPage({ params }: RestaurantPostsPageProps) {
  const restaurant = await getRestaurantById(params.id)

  if (!restaurant) {
    notFound()
  }

  const posts = await getPostsByRestaurantId(params.id)
  const restaurantId = restaurant._id?.toString?.() ?? params.id

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`مقالات ${restaurant.name?.ar ?? restaurant.name?.en ?? "المطعم"}`}
        description="أنشئ وحرر المقالات لزيادة ظهور مطعمك في محركات البحث."
      />
      <PostsManager restaurantId={restaurantId} initialPosts={posts} />
    </DashboardShell>
  )
}
