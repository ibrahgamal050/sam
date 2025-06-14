import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AboutEditor } from "@/components/dashboard/pages/about-editor" 
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getPageBySlug } from "@/lib/services/page-service"
import { notFound } from "next/navigation"
export const dynamicParams = true
interface AboutPageProps {
  params: { id: string }
}

export default async function AboutPage({ params }: AboutPageProps) {
  const page = await getPageBySlug(params.id, "about", "ar")
  if (!page) notFound()
  return (
    <DashboardShell>
      <DashboardHeader heading="Edit About Page" description="Manage about page components">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/restaurants/${params.id}/pages`}>Back</Link>
        </Button>
      </DashboardHeader>
      <AboutEditor page={page} restaurantId={params.id} />
    </DashboardShell>
  )
}