import { Card, CardContent } from "@/components/ui/card"
import { Clock, MapPin, Phone, Navigation } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import {IRestaurant} from '@/types'




interface BranchesPageProps {
  restaurant: IRestaurant
}

export function BranchesPage({restaurant}:BranchesPageProps) {
  const branches = restaurant.branches 
  // If no branches, show a message
  if (!restaurant ) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6C5CE7] to-[#8A7FF5] bg-clip-text text-transparent">
            فروعنا
          </h1>
        </div>
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">لا توجد فروع متاحة حالياً</p>
          <p className="text-sm text-muted-foreground mt-2">يرجى التحقق مرة أخرى لاحقاً</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6C5CE7] to-[#8A7FF5] bg-clip-text text-transparent">
          فروعنا
        </h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {branches.map((branch) => (
          <Card
          key={branch._id.toString()}
            className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[#6C5CE7]/10 border-gray-200 group"
          >
            
              <div className="relative w-full h-48 overflow-hidden">
                <Image
                  src={`/images${restaurant?.coverImage}` }
                  alt={`صورة فرع ${branch.name.ar}`}
                  width={400}
                  height={200}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              
              </div>
            

            <CardContent className="p-6 space-y-5">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold">{branch.name.ar}</h2>
               
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="bg-[#F4F2FF] p-2 rounded-md">
                    <MapPin className="h-5 w-5 text-[#6C5CE7]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{branch.location.address.ar}</p>
                    {branch.location.latitude && branch.location.longitude && (
                      <Link
                        href={`https://www.google.com/maps/search/?api=1&query=${branch.location.latitude},${branch.location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#6C5CE7] hover:text-[#5A4BD1] mt-1 inline-flex items-center gap-1"
                      >
                        <Navigation className="h-3 w-3" />
                        الاتجاهات على الخريطة
                      </Link>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-[#F4F2FF] p-2 rounded-md">
                    <Phone className="h-5 w-5 text-[#6C5CE7]" />
                  </div>
                  <div className="flex-1">
                    <Link dir="ltr" href={`tel:${branch.phone}`} className="text-sm text-gray-700 hover:text-[#6C5CE7]">
                      {branch.phone}
                    </Link>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-[#F4F2FF] p-2 rounded-md">
                    <Clock className="h-5 w-5 text-[#6C5CE7]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">ساعات العمل:</p>
                    <p className="text-sm text-gray-700">{branch.workingHours}</p>
                  </div>
                </div>
              </div>

              {/* {branch.location.latitude && branch.location.longitude && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <div className="relative w-full h-32 rounded-md overflow-hidden">
                    <iframe
                      title={`خريطة لفرع ${branch.name.ar}`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY"}&q=${branch.location.latitude},${branch.location.longitude}&language=ar&zoom=15`}
                      allowFullScreen
                      className="border-0"
                    ></iframe>
                  </div>
                </div>
              )} */}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Updated skeleton to match the new layout
export function BranchesPageSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="h-10 w-48 bg-gray-200 rounded-md mb-8 animate-pulse"></div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
            <div className="h-48 w-full bg-gray-200"></div>
            <div className="p-6 space-y-4">
              <div className="h-6 w-3/4 bg-gray-200 rounded"></div>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 bg-gray-200 rounded-md"></div>
                  <div className="flex-1">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-3 w-1/3 bg-gray-200 rounded mt-2"></div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 bg-gray-200 rounded-md"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 bg-gray-200 rounded-md"></div>
                  <div className="flex-1">
                    <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded mt-2"></div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-100">
                <div className="h-32 w-full bg-gray-200 rounded-md"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
