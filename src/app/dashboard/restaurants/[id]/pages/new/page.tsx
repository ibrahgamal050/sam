import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { PageForm } from "@/components/dashboard/pages/page-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getRestaurantById } from "@/lib/services/restaurant-service"
import { notFound } from "next/navigation"

interface NewPageProps {
  params: { id: string }
}

export default async function NewPage({ params }: NewPageProps) {
  const restaurant = await getRestaurantById(params.id)
  if (!restaurant) notFound()
  return (
    <DashboardShell>
      <DashboardHeader heading="Create Page" description="Add a new page">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/restaurants/${params.id}/pages`}>Back</Link>
        </Button>
      </DashboardHeader>
      <PageForm restaurantId={params.id} subdomain={restaurant.subdomain} />
    </DashboardShell>
  )
}