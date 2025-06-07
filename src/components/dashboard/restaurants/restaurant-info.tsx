import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Restaurant } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, Menu, Phone } from "lucide-react"
import Link from "next/link"

interface RestaurantInfoProps {
  restaurant: Restaurant
}

export function RestaurantInfo({ restaurant }: RestaurantInfoProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Restaurant Information</CardTitle>
            <CardDescription>Basic details about the restaurant</CardDescription>
          </div>
          <Button asChild>
            <Link href={`/dashboard/restaurants/${restaurant._id}/menu`}>
              <Menu className="mr-2 h-4 w-4" />
              Manage Menu
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:gap-8">
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Name (English)</h3>
                <p className="text-base">{restaurant.name.en}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Name (Arabic)</h3>
                <p className="text-base">{restaurant.name.ar}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Subdomain</h3>
                <p className="text-base">{restaurant.subdomain}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <div className="pt-1">
                  {restaurant.isPublished ? (
                    <Badge variant="default">Published</Badge>
                  ) : (
                    <Badge variant="outline">Draft</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Contact Numbers</h3>
                <div className="flex flex-col gap-1 pt-1">
                  {restaurant.phones.map((phone, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{phone}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Website</h3>
                <div className="flex items-center gap-2 pt-1">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>{`https://${restaurant.subdomain}.example.com`}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                <p className="text-base">{new Date(restaurant.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p className="text-base">{new Date(restaurant.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Description</CardTitle>
          <CardDescription>Restaurant description</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{restaurant.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
          <CardDescription>Restaurant logo image</CardDescription>
        </CardHeader>
        <CardContent>
          {restaurant.logo ? (
            <div className="overflow-hidden rounded-md border">
              <img
                src={restaurant.logo || "/placeholder.svg"}
                alt={`${restaurant.name.en} logo`}
                className="aspect-square h-auto w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-md border bg-muted">
              <span className="text-sm text-muted-foreground">No logo</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cover Image</CardTitle>
          <CardDescription>Restaurant cover image</CardDescription>
        </CardHeader>
        <CardContent>
          {restaurant.coverImage ? (
            <div className="overflow-hidden rounded-md border">
              <img
                src={restaurant.coverImage || "/placeholder.svg"}
                alt={`${restaurant.name.en} cover`}
                className="aspect-video h-auto w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-md border bg-muted">
              <span className="text-sm text-muted-foreground">No cover image</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
