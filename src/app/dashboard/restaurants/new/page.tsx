import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { RestaurantForm } from "@/components/dashboard/restaurants/restaurant-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewRestaurantPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Create Restaurant" description="Add a new restaurant to your dashboard">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/restaurants">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </DashboardHeader>
      <RestaurantForm />
    </DashboardShell>
  )
}
