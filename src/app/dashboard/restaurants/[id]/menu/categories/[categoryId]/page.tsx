import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { MenuItemCreateButton } from "@/components/menu/menu-item-create-button"
import { MenuItemsList } from "@/components/menu/menu-items-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { menuData } from "@/lib/placeholder-menu-data"
import { ArrowLeft, Pencil } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface CategoryPageProps {
  params: {
    id: string
    categoryId: string
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  // In a real app, you would fetch the category data for this specific ID
  const category = menuData.categories.find((c) => c._id === params.categoryId)

  if (!category) {
    notFound()
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={category.name.en} description="Manage menu items in this category">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/restaurants/${params.id}/menu`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Menu
            </Link>
          </Button>
          <Button size="sm" variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Category
          </Button>
        </div>
      </DashboardHeader>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Menu Items</CardTitle>
            <CardDescription>Manage menu items in the {category.name.en} category</CardDescription>
          </div>
          <MenuItemCreateButton restaurantId={params.id} categoryId={params.categoryId} />
        </CardHeader>
        <CardContent>
          <MenuItemsList items={category.menuItems} restaurantId={params.id} categoryId={params.categoryId} />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
