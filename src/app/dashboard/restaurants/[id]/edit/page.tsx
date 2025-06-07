import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { RestaurantForm } from "@/components/dashboard/restaurants/restaurant-form"
import { Button } from "@/components/ui/button"
import { getRestaurantById } from "@/lib/services/restaurant-service"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface EditRestaurantPageProps {
  params: {
    id: string
  }
}

export default async function EditRestaurantPage({ params }: EditRestaurantPageProps) {
  // Extract id from params first
  const { id } = params

  // Then use the extracted id variable
  const restaurant = await getRestaurantById(id)

  // If restaurant not found, show 404 page
  if (!restaurant) {
    notFound()
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Edit Restaurant" description="Update restaurant information">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/restaurants/${restaurant._id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </DashboardHeader>
      <RestaurantForm restaurant={restaurant} />
    </DashboardShell>
  )
}
