import { DashboardHeader } from "@/components/dashboard/restaurants/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getPagesByRestaurantId } from "@/lib/services/page-service"
import { PageList } from "@/components/dashboard/pages/page-list"
import { GenerateAllPagesButton } from "@/components/ai/generatePages"

interface PagesPageProps {
  params: { id: string }
}

export default async function PagesPage({ params }: PagesPageProps) {
  const pages = await getPagesByRestaurantId(params.id)
  return (
    <DashboardShell>
      <DashboardHeader heading="Pages" description="Manage restaurant pages">
      <GenerateAllPagesButton restaurantId={params.id} />

        <Button asChild>
          <Link href={`/dashboard/restaurants/${params.id}/pages/new`}>New Page</Link>
        </Button>
      </DashboardHeader>
      <PageList pages={pages} restaurantId={params.id} />
    </DashboardShell>
  )
}