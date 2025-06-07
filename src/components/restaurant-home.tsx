"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRestaurant } from "@/contexts/restaurant-context"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface Category {
  name: string
  image: string
  nameAr?: string
}

interface MenuItem {
  _id: string
  name: string
  nameAr?: string
  description: string
  descriptionAr?: string
  price: number
  category: string
  categoryAr?: string
  image: string
}

export function RestaurantHome() {
  const { restaurant, isLoading: restaurantLoading } = useRestaurant()
  const { language, direction, t } = useLanguage()
  const [categories, setCategories] = useState<Category[]>([])
  const [specialItem, setSpecialItem] = useState<MenuItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const slug = params?.slug as string

  useEffect(() => {
    const fetchData = async () => {
      if (!restaurant) return

      try {
        setError(null)
        // Fetch menu items with the restaurant slug
        const menuResponse = await fetch(`/api/restaurant/menu`)

        if (!menuResponse.ok) {
          throw new Error(`Failed to fetch menu: ${menuResponse.status}`)
        }

        const menuItems = await menuResponse.json()

        if (!menuItems || menuItems.length === 0) {
          setCategories([])
          setSpecialItem(null)
          return
        }

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(menuItems.map((item: MenuItem) => item.category))).map(
          (category) => {
            // Find an item in this category to use its image
            const itemInCategory = menuItems.find((item: MenuItem) => item.category === category)
            return {
              name: category as string,
              nameAr: itemInCategory?.categoryAr || (category as string),
              image: itemInCategory?.image || "/placeholder.svg?height=100&width=100",
            }
          },
        )

        setCategories(uniqueCategories)

        // Set a random item as today's special
        if (menuItems.length > 0) {
          // Try to find an item with a good image for better presentation
          const itemsWithImages = menuItems.filter(
            (item: MenuItem) => item.image && !item.image.includes("placeholder"),
          )

          const randomItem =
            itemsWithImages.length > 0
              ? itemsWithImages[Math.floor(Math.random() * itemsWithImages.length)]
              : menuItems[Math.floor(Math.random() * menuItems.length)]

          setSpecialItem(randomItem)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error instanceof Error ? error.message : "Failed to load restaurant data")
      } finally {
        setIsLoading(false)
      }
    }

    if (restaurant) {
      fetchData()
    }
  }, [restaurant, slug])

  if (restaurantLoading || isLoading) {
    return <HomePageSkeleton />
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("error")}</AlertTitle>
          <AlertDescription>
            {error}
            <Button variant="link" className="p-0 h-auto font-normal" onClick={() => window.location.reload()}>
              {t("tryAgain")}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("restaurantNotFound")}</AlertTitle>
          <AlertDescription>{t("restaurantNotFoundDesc")}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Get localized restaurant data
  const restaurantName = language === "ar" && restaurant.nameAr ? restaurant.nameAr : restaurant.name
  const restaurantDescription =
    language === "ar" && restaurant.descriptionAr ? restaurant.descriptionAr : restaurant.description

  return (
    <div className={`flex flex-col gap-6 p-4 max-w-4xl mx-auto ${direction === "rtl" ? "text-right" : "text-left"}`}>
      <div className="relative w-full h-48 sm:h-64 md:h-80 rounded-lg overflow-hidden">
        <Image
          src={restaurant?.coverImage || "/placeholder.svg?height=400&width=800"}
          alt={restaurantName}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
          <h1 className="text-white text-2xl font-bold">{restaurantName}</h1>
          <p className="text-white/90">
            {restaurantDescription
              ? restaurantDescription.length > 100
                ? `${restaurantDescription.substring(0, 100)}...`
                : restaurantDescription
              : ""}
          </p>
        </div>
      </div>

      {categories.length > 0 ? (
        <section>
          <div className={`flex justify-between items-center mb-3 ${direction === "rtl" ? "flex-row-reverse" : ""}`}>
            <h2 className="text-xl font-semibold">{t("categories")}</h2>
            <Link
              href={`/${slug}/menu`}
              className={`text-primary text-sm flex items-center ${direction === "rtl" ? "flex-row-reverse" : ""}`}
            >
              {t("viewAll")}{" "}
              {direction === "rtl" ? (
                <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
              ) : (
                <ChevronRight className="h-4 w-4 ml-1" />
              )}
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map((category) => (
              <Link href={`/${slug}/menu?category=${encodeURIComponent(category.name)}`} key={category.name}>
                <Card className="overflow-hidden h-32 hover:shadow-md transition-shadow">
                  <CardContent className="p-0 h-full relative">
                    <Image
                      src={category.image || "/placeholder.svg?height=100&width=100"}
                      alt={language === "ar" && category.nameAr ? category.nameAr : category.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <h3 className="text-white font-medium text-lg text-center px-2">
                        {language === "ar" && category.nameAr ? category.nameAr : category.name}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="bg-muted p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">{t("noCategories")}</h2>
          <p className="text-muted-foreground">{t("noCategoriesDesc")}</p>
        </section>
      )}

      {specialItem && (
        <section className="bg-muted p-4 rounded-lg">
          <div className={`flex items-center gap-2 mb-2 ${direction === "rtl" ? "flex-row-reverse" : ""}`}>
            <h2 className="text-xl font-semibold">{t("todaysSpecial")}</h2>
            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">{t("featured")}</span>
          </div>
          <div className="relative h-40 sm:h-60 rounded-md overflow-hidden mb-3">
            <Image
              src={specialItem.image || "/placeholder.svg?height=300&width=600"}
              alt={language === "ar" && specialItem.nameAr ? specialItem.nameAr : specialItem.name}
              fill
              className="object-cover"
            />
          </div>
          <h3 className="font-medium text-lg">
            {language === "ar" && specialItem.nameAr ? specialItem.nameAr : specialItem.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-3">
            {language === "ar" && specialItem.descriptionAr
              ? specialItem.descriptionAr
              : specialItem.description || t("defaultSpecialDesc")}
          </p>
          <div className={`flex justify-between items-center ${direction === "rtl" ? "flex-row-reverse" : ""}`}>
            <span className="font-bold text-primary">${specialItem.price.toFixed(2)}</span>
            <Link href={`/${slug}/menu/item/${specialItem._id}`}>
              <Button size="sm">{t("viewDetails")}</Button>
            </Link>
          </div>
        </section>
      )}

      <section className="bg-primary/5 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">
          {t("about")} {restaurantName}
        </h2>
        <p className="text-muted-foreground mb-3">{restaurantDescription || t("defaultDescription")}</p>
        <div className={`flex justify-between items-center ${direction === "rtl" ? "flex-row-reverse" : ""}`}>
          <div>
            <p className="text-sm font-medium">{t("openHours")}</p>
            <p className="text-xs text-muted-foreground">{restaurant.openingHours || t("contactForHours")}</p>
          </div>
          <Link href={`/${slug}/about`}>
            <Button variant="outline" size="sm">
              {t("learnMore")}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

function HomePageSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto">
      <Skeleton className="w-full h-48 sm:h-64 md:h-80 rounded-lg" />

      <section>
        <div className="flex justify-between items-center mb-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-6 w-24" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </section>

      <section className="p-4 rounded-lg border">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-40 sm:h-60 w-full rounded-md mb-3" />
        <Skeleton className="h-6 w-40 mb-1" />
        <Skeleton className="h-4 w-full mb-3" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </section>
    </div>
  )
}
