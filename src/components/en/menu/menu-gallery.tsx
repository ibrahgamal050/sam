"use client"
import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

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
    return (
      <div className="rounded-[32px] border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.45)]">
        No images are available right now
      </div>
    )
  }

  const currentImage = images[currentImageIndex]
  const title = currentImage.altText || "Featured offers"
  const description = "Explore the latest additions and special offers."

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-gray-200 bg-gradient-to-br from-white via-[#f9fafc] to-white p-6 text-gray-900 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.35)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,92,231,0.09),_transparent_70%)]" />
      <div className="relative grid gap-8 md:grid-cols-[minmax(0,1fr)_320px] md:items-center">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#6c5ce7]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-[#6c5ce7]">
            Discover
          </span>
          <h2 className="text-3xl font-bold md:text-4xl text-gray-900">{title}</h2>
          <p className="max-w-xl text-sm text-gray-600 leading-6">{description}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 shadow-sm">
              <Star className="h-4 w-4 text-[#f7c325]" />
              <span>Featured pick</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 shadow-sm">
              <span className="text-[#6c5ce7]">Free delivery</span>
              <span>on eligible orders</span>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-gray-200 bg-white p-4 shadow-inner">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={currentImage.url}
              alt={currentImage.altText}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 80vw, 320px"
              priority
            />
          </div>

          <button
            onClick={handlePrevious}
            className="absolute -left-3 top-1/2 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-[#f7f9fc]"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-[#f7f9fc]"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-3 py-1 text-xs text-gray-700 shadow-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      </div>
    </div>
  )
}
