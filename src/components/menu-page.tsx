"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { useRestaurant } from "@/contexts/restaurant-context"
import { useParams, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface MenuItem {
  _id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  available: boolean
}

interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

export function MenuPage() {
  const { restaurant } = useRestaurant()
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params?.slug as string
  const categoryParam = searchParams?.get("category")

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!restaurant) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/restaurants/menu`)

        if (response.ok) {
          const menuItems = await response.json()

          // Group items by category
          const categoriesMap = menuItems.reduce((acc: Record<string, MenuItem[]>, item: MenuItem) => {
            if (!acc[item.category]) {
              acc[item.category] = []
            }
            acc[item.category].push(item)
            return acc
          }, {})

          // Convert to array format needed by the UI
          const formattedCategories = Object.keys(categoriesMap).map((category) => ({
            id: category.toLowerCase().replace(/\s+/g, "-"),
            name: category,
            items: categoriesMap[category],
          }))

          setMenuCategories(formattedCategories)
        }
      } catch (error) {
        console.error("Error fetching menu items:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (restaurant) {
      fetchMenuItems()
    }
  }, [restaurant, slug])

  // Determine default tab
  const defaultTab = categoryParam || (menuCategories.length > 0 ? menuCategories[0].id : "")

  if (isLoading) {
    return <MenuPageSkeleton />
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Our Menu</h1>

      {menuCategories.length > 0 ? (
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full mb-4 overflow-x-auto flex-nowrap justify-start">
            {menuCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="whitespace-nowrap">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {menuCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              {category.items.map((item) => (
                <Card key={item._id} className={`overflow-hidden ${!item.available ? "opacity-60" : ""}`}>
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="relative w-24 h-24">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="p-3 flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.name}</h3>
                          <span className="font-bold text-primary">${item.price.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        {!item.available && (
                          <span className="text-xs text-destructive mt-1">Currently unavailable</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No menu items available</p>
        </div>
      )}
    </div>
  )
}

function MenuPageSkeleton() {
  return (
    <div className="p-4">
      <Skeleton className="h-8 w-40 mb-4" />

      <div className="w-full mb-4 flex gap-2 overflow-x-auto">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-md flex-shrink-0" />
        ))}
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
