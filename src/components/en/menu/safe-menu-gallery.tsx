"use client"

import { MenuGallery } from "./menu-gallery"
import type { MenuImage } from "@/types/menu-components"

interface SafeMenuGalleryProps {
  images: MenuImage[]
}

export function SafeMenuGallery({ images }: SafeMenuGalleryProps) {
  // Ensure all images have alt text
  const safeImages = images.map((image) => ({
    ...image,
    altText: image.altText || "Menu image",
  }))

  // Only render if we have images
  if (safeImages.length === 0) {
    return null
  }

  return <MenuGallery images={safeImages} />
}
