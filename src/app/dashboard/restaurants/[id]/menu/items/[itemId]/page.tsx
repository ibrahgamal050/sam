import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { MenuItemForm } from "@/components/menu/menu-item-form"
import { Button } from "@/components/ui/button"
import { menuData } from "@/lib/placeholder-menu-data"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface MenuItemPageProps {
  params: {
    id: string
    itemId: string
  }
}

export default function MenuItemPage({ params }: MenuItemPageProps) {
  // Find the item in any category
  let menuItem = null
  let categoryId = ""

  for (const category of menuData.categories) {
    const item = category.menuItems.find((item) => item._id === params.itemId)
    if (item) {
      menuItem = item
      categoryId = category._id
      break
    }
  }

  if (!menuItem) {
    notFound()
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Edit Menu Item" description="Update menu item details">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/restaurants/${params.id}/menu/categories/${categoryId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Category
          </Link>
        </Button>
      </DashboardHeader>
      <MenuItemForm restaurantId={params.id} categoryId={categoryId} menuItem={menuItem} />
    </DashboardShell>
  )
}
