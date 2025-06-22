import { DashboardHeader } from "@/components/dashboard/restaurants/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { MenuCategoriesList } from "@/components/dashboard/menu/menu-categories-list"
import { MenuCreateCategoryButton } from "@/components/dashboard/menu/menu-create-category-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMenuByRestaurantId } from "@/lib/services/menu-service"
import { getRestaurantById } from "@/lib/services/restaurant-service"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MenuEditor } from "@/components/dashboard/menu/menu-editor"
interface MenuPageProps {
  params: {
    id: string
  }
}

export default async function MenuPage({ params }: MenuPageProps) {
  const restaurantId = params.id;
  try {
    // Fetch restaurant and menu data from the database
    const restaurant = await getRestaurantById(restaurantId)

    if (!restaurant) {
      notFound()
    }

    const menu = await getMenuByRestaurantId(params.id)
    const menuId= menu._id

    

    return (
      <DashboardShell>
        <DashboardHeader heading="Menu Management" description={`Manage menu for ${restaurant.name.en}`}>
          <Link href={`/dashboard/restaurants/${params.id}`} className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Restaurant
          </Link>
        </DashboardHeader>

        <MenuEditor menuId= {menuId} />
      </DashboardShell>
    )
  } catch (error) {
    console.error("Error loading menu page:", error)
    throw new Error("Failed to load menu page")
  }
}
