"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, MapPin, Phone } from "lucide-react"
import { useRestaurant } from "@/contexts/restaurant-context"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface Branch {
  _id: string
  name: string
  address: string
  latitude?: number
  longitude?: number
  phone: string
  openHours: {
    weekdays: string
    weekends: string
  }
}

export function BranchesPage() {
  const { restaurant } = useRestaurant()
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const slug = params?.slug as string

  useEffect(() => {
    const fetchBranches = async () => {
      if (!restaurant) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/restaurants/${slug}/branches`)

        if (response.ok) {
          const data = await response.json()
          setBranches(data)
        }
      } catch (error) {
        console.error("Error fetching branches:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (restaurant) {
      fetchBranches()
    }
  }, [restaurant, slug])

  if (isLoading) {
    return <BranchesPageSkeleton />
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Our Branches</h1>

      {branches.length > 0 ? (
        <Tabs defaultValue={branches[0]._id} className="w-full">
          <TabsList className="w-full mb-4 overflow-x-auto flex-nowrap justify-start">
            {branches.map((branch) => (
              <TabsTrigger key={branch._id} value={branch._id} className="whitespace-nowrap">
                {branch.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {branches.map((branch) => (
            <TabsContent key={branch._id} value={branch._id} className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h2 className="text-xl font-semibold">{branch.name} Branch</h2>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <p className="text-sm">{branch.address}</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <p className="text-sm">{branch.phone}</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Opening Hours:</p>
                      <p className="text-sm">Weekdays: {branch.openHours.weekdays}</p>
                      <p className="text-sm">Weekends: {branch.openHours.weekends}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                {branch.latitude && branch.longitude ? (
                  <iframe
                    title={`Map for ${branch.name}`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${branch.latitude},${branch.longitude}`}
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No branches available</p>
        </div>
      )}
    </div>
  )
}

function BranchesPageSkeleton() {
  return (
    <div className="p-4">
      <Skeleton className="h-8 w-40 mb-4" />

      <div className="w-full mb-4 flex gap-2 overflow-x-auto">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-md flex-shrink-0" />
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  )
}
