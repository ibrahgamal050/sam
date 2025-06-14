import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { PageForm } from "@/components/dashboard/pages/page-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ComponentsManager } from "@/components/dashboard/pages/components-manager"

import { getPageById } from "@/lib/services/page-service"
import { getRestaurantById } from "@/lib/services/restaurant-service"
import { notFound } from "next/navigation"

interface EditPageProps {
  params: { id: string; pageId: string }
}

export default async function EditPage({ params }: EditPageProps) {
  const restaurant = await getRestaurantById(params.id)
  if (!restaurant) notFound()
  const page = await getPageById(params.id, params.pageId)
  if (!page) notFound()
  return (
    <DashboardShell>
      <DashboardHeader heading="Edit Page" description="Update page information">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/restaurants/${params.id}/pages`}>Back</Link>
        </Button>
      </DashboardHeader>
      
      <PageForm restaurantId={params.id} subdomain={restaurant.subdomain} page={page} />
    </DashboardShell>
  )
}