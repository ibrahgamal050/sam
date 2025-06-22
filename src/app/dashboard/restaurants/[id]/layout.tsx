import { notFound } from "next/navigation"
import type { ReactNode } from "react"
import { DashboardSidebar } from "@/components/dashboard/restaurants/dashboard-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { getRestaurantById } from "@/lib/services/restaurant-service"

interface LayoutProps {
  children: ReactNode
  params: { id: string }
}

export default async function DashboardLayout({ children, params }: LayoutProps) {
  const restaurant = await getRestaurantById(params.id)

  if (!restaurant) {
    notFound()
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar restaurantId={restaurant._id} />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </SidebarProvider>
  )
}
