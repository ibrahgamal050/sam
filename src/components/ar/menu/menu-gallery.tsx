"use client"
import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MenuImage {
  url: string
  altText: string
  _id: string
}

interface MenuGalleryProps {
  images: MenuImage[]
}

export function MenuGallery({ images }: MenuGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handlePrevious = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }

  if (!images || images.length === 0) {
    return <div className="w-full py-12 text-center text-white">لا توجد صور متاحة</div>
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">صور القائمة</h2>

      <div className="relative w-full aspect-square md:aspect-[16/9] mx-auto max-w-3xl">
        <div className="relative h-full w-full">
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL}${images[currentImageIndex].url}`}
            alt={images[currentImageIndex].altText}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
        </div>

        {/* Navigation controls */}
        <button
          onClick={handlePrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Image counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentImageIndex + 1} / {images.length}
        </div>
      </div>

     
    </div>
  )
}
