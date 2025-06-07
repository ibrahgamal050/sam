import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { MenuCategoryForm } from "@/components/menu/menu-category-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface NewCategoryPageProps {
  params: {
    id: string
  }
}

export default function NewCategoryPage({ params }: NewCategoryPageProps) {
  return (
    <DashboardShell>
      <DashboardHeader heading="Create Category" description="Add a new category to your menu">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/restaurants/${params.id}/menu`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
          </Link>
        </Button>
      </DashboardHeader>
      <MenuCategoryForm restaurantId={params.id} />
    </DashboardShell>
  )
}
