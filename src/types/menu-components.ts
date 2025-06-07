import type React from "react"
import type { IMenuImage } from "@/types/menu"

// Define what CategoryRef is expected to be
export type CategoryRef = HTMLElement

// Define the MenuImage type that MenuGallery expects
export type MenuImage = {
  _id: string
  url: string
  altText: string // Changed from alt to altText to match what MenuGallery expects
}

// Helper function to convert IMenuImage[] to MenuImage[]
export function convertToMenuImages(images: IMenuImage[] = []): MenuImage[] {
  return images.map((image) => ({
    _id: image._id?.toString() || Math.random().toString(36).substring(2, 9),
    url: image.url || "",
    altText: image.altText || "Menu image", // Provide a default alt text
  }))
}

// Helper function to convert RefObject<HTMLDivElement> to CategoryRef
export function convertToCategoryRefs(refs: Record<string, React.RefObject<HTMLDivElement>>): {
  [key: string]: CategoryRef
} {
  const result: { [key: string]: CategoryRef } = {}

  Object.entries(refs).forEach(([key, ref]) => {
    // Check if ref exists and is not null before accessing current
    if (ref && ref.current) {
      result[key] = ref.current
    }
  })

  return result
}
