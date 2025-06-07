"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Plus, Star, Clock, Info, Search, ChevronRight, ChevronLeft } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface IMenuItem {
  _id: { toString: () => string }
  name: string | { ar: string; en: string }
  price: number
  image?: string
  description?: string | { ar: string; en: string }
  isPopular?: boolean
  isNew?: boolean
  preparationTime?: number
}

interface ICategory {
  _id: { toString: () => string }
  name: string | { ar: string; en: string }
  menuItems: IMenuItem[]
}

interface IMenu {
  categories: ICategory[]
  menuImages?: string[]
  currency?: { ar: string; en: string }
}

interface RestaurantMenuProps {
  menuData: IMenu
}

export function MenuPage({ menuData }: RestaurantMenuProps) {
  // Extract categories from menuData
  const categories = menuData?.categories || []

  // Set default tab to first category ID if categories exist
  const defaultTab = categories.length > 0 ? categories[0]._id.toString() : ""

  // Extract menu images
  const menuImages = menuData?.menuImages || []

  // Get currency from menuData
  const currency = menuData?.currency?.ar || "₽"

  // Ref for tabs scrolling
  const tabsRef = useRef<HTMLDivElement>(null)

  // State for scroll buttons visibility
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(false)

  // State for search
  const [searchQuery, setSearchQuery] = useState("")

  // Check if scroll buttons should be visible
  useEffect(() => {
    const checkScroll = () => {
      if (tabsRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current
        setShowLeftScroll(scrollLeft > 0)
        setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10)
      }
    }

    // Initial check
    checkScroll()

    // Add event listeners
    const currentRef = tabsRef.current
    if (currentRef) {
      currentRef.addEventListener("scroll", checkScroll)
      window.addEventListener("resize", checkScroll)
    }

    // Cleanup function
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", checkScroll)
      }
      window.removeEventListener("resize", checkScroll)
    }
  }, [])

  // Scroll tabs left or right
  const scrollTabs = (direction: "left" | "right") => {
    if (tabsRef.current) {
      const scrollAmount = 200
      const newScrollLeft =
        direction === "left" ? tabsRef.current.scrollLeft - scrollAmount : tabsRef.current.scrollLeft + scrollAmount

      tabsRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#6C5CE7] to-[#8A7FF5] bg-clip-text text-transparent">
            قائمة الطعام
          </h1>

          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="ابحث في القائمة..."
              className="pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search menu"
            />
          </div>
        </div>

        {/* Category Tabs */}
        {categories.length > 0 ? (
          <Tabs defaultValue={defaultTab} className="w-full">
            <div className="sticky top-0 z-10 bg-gray-50 pb-2">
              <div className="relative">
                {showLeftScroll && (
                  <button
                    onClick={() => scrollTabs("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1.5 border border-gray-100"
                    aria-label="Scroll categories left"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                )}

                <div
                  ref={tabsRef}
                  className="overflow-x-auto scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <TabsList className="w-full mb-6 flex-nowrap justify-start bg-white border border-gray-100 rounded-xl h-14 p-1 shadow-sm">
                    {categories.map((category: ICategory) => (
                      <TabsTrigger
                        key={category._id.toString()}
                        value={category._id.toString()}
                        className="px-5 py-2.5 text-base data-[state=active]:bg-[#6C5CE7] data-[state=active]:text-white text-gray-700 rounded-lg transition-all whitespace-nowrap"
                      >
                        {typeof category.name === "object" ? category.name.ar : category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {showRightScroll && (
                  <button
                    onClick={() => scrollTabs("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1.5 border border-gray-100"
                    aria-label="Scroll categories right"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {categories.map((category: ICategory) => {
              // Filter menu items based on search query
              const filteredItems = searchQuery
                ? category.menuItems?.filter((item) => {
                    const itemName = typeof item.name === "object" ? item.name.ar : item.name
                    const itemDesc = item.description
                      ? typeof item.description === "object"
                        ? item.description.ar
                        : item.description
                      : ""
                    return (
                      itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      itemDesc.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                  })
                : category.menuItems

              return (
                <TabsContent
                  key={category._id.toString()}
                  value={category._id.toString()}
                  className="mt-2 focus-visible:outline-none focus-visible:ring-0"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredItems && filteredItems.length > 0 ? (
                      filteredItems.map((item: IMenuItem) => (
                        <div
                          key={item._id?.toString()}
                          className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <div className="relative w-full aspect-square overflow-hidden">
                            <Image
                              src={
                                item.image?.startsWith("/")
                                  ? `${process.env.NEXT_PUBLIC_API_URL || ""}${item.image}`
                                  : item.image || "/delicious-food-dish.png"
                              }
                              alt={typeof item.name === "object" ? item.name.ar : item.name || ""}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                            />
                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                              {item.isPopular && (
                                <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 flex items-center gap-1 text-xs">
                                  <Star className="h-3 w-3" /> الأكثر طلباً
                                </Badge>
                              )}
                              {item.isNew && (
                                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 text-xs">
                                  جديد
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="p-3 md:p-4">
                            <div className="flex flex-col">
                              <h3 className="font-bold text-base md:text-lg text-gray-900 line-clamp-1">
                                {typeof item.name === "object" ? item.name.ar : item.name}
                              </h3>
                              <div className="font-bold text-lg md:text-xl text-[#6C5CE7] mt-1">
                                {item.price?.toFixed(0) || "0"}
                                <span className="mr-1 text-sm">{currency}</span>
                              </div>
                            </div>

                            {item.description && (
                              <p className="text-xs md:text-sm text-gray-600 mt-2 line-clamp-2">
                                {typeof item.description === "object" ? item.description.ar : item.description}
                              </p>
                            )}

                            <div className="flex items-center gap-3 mt-2">
                              {item.preparationTime && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{item.preparationTime} دقيقة</span>
                                </div>
                              )}
                            </div>

                            <button
                              className="mt-3 w-full bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white rounded-xl py-2 flex items-center justify-center transition-colors gap-1.5 text-sm"
                              aria-label={`Add ${typeof item.name === "object" ? item.name.ar : item.name} to cart`}
                            >
                              <Plus className="h-4 w-4" />
                              <span>إضافة</span>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full bg-white rounded-xl border border-gray-100 p-8 text-center">
                        <Info className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-600 font-medium">
                          {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد أصناف في هذه الفئة"}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          {searchQuery
                            ? "يرجى تغيير كلمات البحث أو تصفح الفئات مباشرة"
                            : "يرجى التحقق من الفئات الأخرى أو العودة لاحقاً"}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Info className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-xl font-medium text-gray-700 mb-2">قائمة الطعام غير متوفرة</p>
            <p className="text-gray-500">يرجى التحقق مرة أخرى لاحقاً</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function MenuPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <Skeleton className="h-8 w-40 bg-gray-200" />
        <Skeleton className="h-10 w-full sm:w-32 rounded-full bg-gray-200" />
      </div>

      <div className="sticky top-0 z-10 bg-gray-50 pb-2">
        <div className="w-full mb-6 bg-white border border-gray-100 rounded-xl h-14 p-1 shadow-sm flex gap-2 overflow-x-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-lg flex-shrink-0 bg-gray-200" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm animate-pulse">
            <Skeleton className="h-40 sm:h-48 w-full bg-gray-200" />
            <div className="p-3 md:p-4">
              <div className="flex items-start justify-between mb-3">
                <Skeleton className="h-5 w-3/4 bg-gray-200" />
                <Skeleton className="h-6 w-1/3 bg-gray-200" />
              </div>
              <Skeleton className="h-4 w-full bg-gray-200 mb-2" />
              <Skeleton className="h-4 w-2/3 bg-gray-200 mb-3" />
              <Skeleton className="h-9 w-full bg-gray-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
