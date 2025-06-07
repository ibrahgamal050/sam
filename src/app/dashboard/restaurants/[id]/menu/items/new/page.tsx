import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { MenuItemForm } from "@/components/menu/menu-item-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface NewMenuItemPageProps {
  params: {
    id: string
  }
  searchParams: {
    categoryId: string
  }
}

export default function NewMenuItemPage({ params, searchParams }: NewMenuItemPageProps) {
  const categoryId = searchParams.categoryId

  return (
    <DashboardShell>
      <DashboardHeader heading="Create Menu Item" description="Add a new item to your menu">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/restaurants/${params.id}/menu/categories/${categoryId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Category
          </Link>
        </Button>
      </DashboardHeader>
      <MenuItemForm restaurantId={params.id} categoryId={categoryId} />
    </DashboardShell>
  )
}
