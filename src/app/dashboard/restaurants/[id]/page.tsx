import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { getRestaurantById } from "@/lib/services/restaurant-service"
import { Edit, ArrowLeft, Utensils } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface RestaurantPageProps {
  params: {
    id: string
  }
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  // Fetch restaurant data using the service
  const restaurant = await getRestaurantById(params.id)

  if (!restaurant) {
    notFound()
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={restaurant.name.en} description={restaurant.description || "Restaurant details"}>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/restaurants">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/dashboard/restaurants/${restaurant._id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/dashboard/restaurants/${restaurant._id}/menu`}>
              <Utensils className="mr-2 h-4 w-4" />
              Menu
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/dashboard/restaurants/${restaurant._id}/pages`}>
              Pages
            </Link>
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid gap-6">
        {/* Restaurant details */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium text-muted-foreground">Subdomain</div>
            <div className="mt-1 font-semibold">{restaurant.subdomain}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium text-muted-foreground">Status</div>
            <div className="mt-1 flex items-center">
              <div
                className={`mr-2 h-3 w-3 rounded-full ${restaurant.isPublished ? "bg-green-500" : "bg-amber-500"}`}
              ></div>
              <span>{restaurant.isPublished ? "Published" : "Draft"}</span>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium text-muted-foreground">Arabic Name</div>
            <div className="mt-1 font-semibold">{restaurant.name.ar}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium text-muted-foreground">Created</div>
            <div className="mt-1 font-semibold">{new Date(restaurant.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Restaurant branches */}
        <div className="rounded-lg border">
          <div className="p-4">
            <h3 className="text-lg font-semibold">Branches</h3>
            <p className="text-sm text-muted-foreground">Manage restaurant branches</p>
          </div>
          <div className="p-4">
            {restaurant.branches && restaurant.branches.length > 0 ? (
              <div className="divide-y">
                {restaurant.branches.map((branch, index) => (
                  <div key={index} className="py-3">
                    <div className="font-medium">{branch.name.en}</div>
                    <div className="text-sm text-muted-foreground">{branch.location.address.en}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No branches added yet</p>
                <Button className="mt-2" variant="outline" size="sm">
                  Add Branch
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
