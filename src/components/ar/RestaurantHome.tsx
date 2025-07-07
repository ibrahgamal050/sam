import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Phone, Star, ChevronRight, Utensils } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { IRestaurant } from "@/types"

interface RestaurantHomeProps {
  restaurant: IRestaurant
}

export function RestaurantHome({ restaurant }: RestaurantHomeProps) {
  // Default to Arabic
  const direction = "rtl"

  // Get localized restaurant data
  const restaurantName = restaurant.name.ar 
  const restaurantDescription = restaurant.description

  // Mock data for categories - replace with actual data when available
 

  return (
    <div className="flex flex-col w-full min-h-screen bg-background" dir={direction}>
     

      
        {/* Hero Section */}
        <div className="relative w-full h-[60vh] max-h-[300px]">
          <Image
            src={`/images${restaurant?.coverImage}` }
            alt={restaurantName}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8">
            <div className="max-w-4xl mx-auto w-full">
              <Badge className="mb-3 bg-primary/90 hover:bg-primary">مفتوح الآن</Badge>
              <h1 className="text-white text-3xl md:text-4xl font-bold mb-2">{restaurantName}</h1>
              
              <div className="flex gap-4 mt-4">
              <Link href="/ar/menu">
  <Button className="gap-2">
    <Utensils className="w-4 h-4" />
    تصفح القائمة
  </Button>
</Link>
               
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          

     

          {/* About Section */}
          <section className=" bg-purple-50  rounded-lg p-6 mb-10">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <h2 className="text-2xl font-bold mb-3">عن {restaurantName}</h2>
                <p className="text-muted-foreground mb-4">
                  {restaurantDescription ||
                    "نحن نقدم تجربة طعام فريدة من نوعها مع أطباق تقليدية وعصرية. نستخدم مكونات طازجة ومحلية لضمان أعلى جودة لوجباتنا. تعال واستمتع بأجواء مريحة وخدمة ممتازة."}
                </p>
                <Link href={`/ar/about`}>
                  <Button variant="outline" className="gap-2">
                    اقرأ المزيد
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="md:w-1/2 relative h-48 md:h-auto rounded-lg overflow-hidden">
                <Image
                   src={`/images${restaurant?.coverImage}` }
                  alt={`${restaurantName} interior`}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section
      className="rounded-lg p-5 text-center overflow-hidden relative"
      style={{
        background: `linear-gradient(155deg, #0F0B30 0%, #1F1259 100%)`,
      }}
      dir={direction}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
          style={{ background: "#6C5CE7", filter: "blur(80px)" }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
          style={{ background: "#8A7FF5", filter: "blur(60px)" }}
        ></div>
      </div>

      {/* Geometric accent lines */}
      <div className="absolute top-10 right-10 w-20 h-1 bg-[#6C5CE7] opacity-40"></div>
      <div className="absolute bottom-10 left-10 w-20 h-1 bg-[#6C5CE7] opacity-40"></div>

      <div className="relative z-10">
        

        <h2 className="text-3xl font-bold mb-4 text-white">اطلب الآن</h2>
        <p className="mb-8 max-w-xl mx-auto text-[#B8B2E5]">
          استمتع بتجربة طعام لا تُنسى. احجز طاولتك الآن لتجنب الانتظار.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-4">
            <a href={`tel:${restaurant.phones?.[0]}`}>
              <Button
                size="lg"
                className="gap-2 bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white border-0 shadow-lg px-6 py-6"
              >
                <Phone className="w-4 h-4" />
                اتصل بنا
              </Button>
            </a>
            <span className="text-lg text-white/80 font-medium">{restaurant.phones?.[0]}</span>
          </div>
        </div>
      </div>
    </section>
        </div>
      
     
    </div>
  )
}

// Loading skeleton for the home page
export function HomePageSkeleton() {
  return (
    <div className="flex flex-col w-full min-h-screen" dir="rtl">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-9 w-20 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-9 w-20 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-9 w-20 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Skeleton */}
        <div className="relative w-full h-[60vh] max-h-[500px] bg-gray-200 animate-pulse"></div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Quick Info Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-5 w-24 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Categories Skeleton */}
          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <div className="h-8 w-40 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <div className="h-32 w-full bg-gray-200 animate-pulse"></div>
                  <div className="p-3 flex justify-center">
                    <div className="h-5 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* About Skeleton */}
          <section className="rounded-lg p-6 mb-10 border">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <div className="h-8 w-40 bg-gray-200 rounded-md animate-pulse mb-3"></div>
                <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse mb-2"></div>
                <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse mb-2"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded-md animate-pulse mb-4"></div>
                <div className="h-10 w-28 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
              <div className="md:w-1/2 h-48 md:h-auto bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </section>

          {/* CTA Skeleton */}
          <section className="rounded-lg p-6 border">
            <div className="flex flex-col items-center">
              <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse mb-3"></div>
              <div className="h-4 w-full max-w-xl bg-gray-200 rounded-md animate-pulse mb-4"></div>
              <div className="flex gap-3">
                <div className="h-12 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-12 w-32 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="py-6 border-t">
        <div className="max-w-4xl mx-auto px-4 flex justify-center">
          <div className="h-4 w-48 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </footer>
    </div>
  )
}


