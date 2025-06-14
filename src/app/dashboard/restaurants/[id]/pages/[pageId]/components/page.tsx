import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ComponentsManager } from "@/components/dashboard/pages/components-manager"
import { getPageById } from "@/lib/services/page-service"
import { notFound } from "next/navigation"

interface Props {
  params: { id: string; pageId: string }
}

export default async function PageComponentsPage({ params }: Props) {
  // Destructure params first to avoid using them inside async operations
  const { id, pageId } = params

  const page = await getPageById(id, pageId)
  if (!page) notFound()

  return (
    <DashboardShell>
      <DashboardHeader heading="Page Components" description="Manage page components" />
      {/* Pass the IDs explicitly to the manager */}
      <ComponentsManager
        restaurantId={id}
        pageId={pageId}
        initialComponents={page.components}
      />
    </DashboardShell>
  )
}