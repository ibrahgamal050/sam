import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { RestaurantCreateButton } from "@/components/dashboard/restaurants/restaurant-create-button"
import { RestaurantsTable } from "@/components/dashboard/restaurants/restaurants-table"
import { getAllRestaurants } from "@/lib/services/restaurant-service"

export default async function RestaurantsPage() {
  // Fetch restaurants from the database
  const restaurants = await getAllRestaurants()

  return (
    <DashboardShell>
      <DashboardHeader heading="Restaurants" description="Manage your restaurant listings">
        <RestaurantCreateButton />
      </DashboardHeader>
      <RestaurantsTable data={restaurants} />
    </DashboardShell>
  )
}
