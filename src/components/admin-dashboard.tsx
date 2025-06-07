"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { useRestaurant } from "@/contexts/restaurant-context"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export function AdminDashboard() {
  const { admin, logout } = useAdminAuth()
  const { restaurant } = useRestaurant()
  const params = useParams()
  const slug = params?.slug as string

  const [menuItems, setMenuItems] = useState([])
  const [branches, setBranches] = useState([])
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    // Check if the current admin is a super admin
    // This is a simplified check - in a real app, you'd verify this from the JWT or session
    setIsSuperAdmin(admin?.email === "admin@example.com")

    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch menu items
        const menuResponse = await fetch(`/api/restaurants/${slug}/menu`)
        if (menuResponse.ok) {
          const menuData = await menuResponse.json()
          setMenuItems(menuData)
        }

        // Fetch branches
        const branchesResponse = await fetch(`/api/restaurants/${slug}/branches`)
        if (branchesResponse.ok) {
          const branchesData = await branchesResponse.json()
          setBranches(branchesData)
        }

        // Fetch posts
        const postsResponse = await fetch(`/api/restaurants/${slug}/posts`)
        if (postsResponse.ok) {
          const postsData = await postsResponse.json()
          setPosts(postsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [slug, admin?.email])

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard - {restaurant?.name}</h1>
        <div className="flex gap-2">
          {isSuperAdmin && (
            <Link href="/admin/add-restaurants">
              <Button variant="outline" className="flex items-center gap-1">
                <PlusCircle className="h-4 w-4" /> Add Restaurants
              </Button>
            </Link>
          )}
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="menu" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="menu">Menu Items</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="menu" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Menu Item</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-name">Item Name</Label>
                    <Input id="item-name" placeholder="e.g. Grilled Salmon" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-price">Price ($)</Label>
                    <Input id="item-price" type="number" step="0.01" placeholder="24.99" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-description">Description</Label>
                  <Textarea
                    id="item-description"
                    placeholder="Fresh salmon with lemon butter sauce and seasonal vegetables"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-category">Category</Label>
                  <select id="item-category" className="w-full rounded-md border border-input bg-background px-3 py-2">
                    <option value="">Select a category</option>
                    <option value="appetizers">Appetizers</option>
                    <option value="main">Main Courses</option>
                    <option value="desserts">Desserts</option>
                    <option value="drinks">Drinks</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-image">Image</Label>
                  <Input id="item-image" type="file" />
                </div>

                <Button type="submit">Add Menu Item</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Menu Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <p>Loading menu items...</p>
                ) : menuItems.length > 0 ? (
                  menuItems.map((item: any) => (
                    <div key={item._id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.category} • ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">No menu items found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs remain the same */}
        <TabsContent value="branches" className="space-y-4">
          {/* Branch content remains the same */}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          {/* Posts content remains the same */}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {/* Settings content remains the same */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
