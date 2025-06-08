import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getPagesByRestaurantId } from "@/lib/services/page-service"
import { PageList } from "@/components/dashboard/pages/page-list"

interface PagesPageProps {
  params: { id: string }
}

export default async function PagesPage({ params }: PagesPageProps) {
  const pages = await getPagesByRestaurantId(params.id)
  return (
    <DashboardShell>
      <DashboardHeader heading="Pages" description="Manage restaurant pages">
        <Button asChild>
          <Link href={`/dashboard/restaurants/${params.id}/pages/new`}>New Page</Link>
        </Button>
      </DashboardHeader>
      <PageList pages={pages} restaurantId={params.id} />
    </DashboardShell>
  )
}