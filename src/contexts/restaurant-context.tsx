"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useParams } from "next/navigation"

interface Restaurant {
  _id: string
  name: string
  subdomain: string
  logo: string
  coverImage: string
  description: string
  themeColor: string
  secondaryColor: string
  phone: string
  email: string
  website?: string
  location: {
    address: string
    latitude?: number
    longitude?: number
  }
  social: {
    facebook?: string
    instagram?: string
    tiktok?: string
    twitter?: string
  }
  meta: {
    title: string
    description: string
    keywords?: string
    image?: string
  }
  pages?: Array<{
    slug: string
    meta: {
      title: string
      description: string
      keywords?: string
      image?: string
    }
  }>
}

interface RestaurantContextType {
  restaurant: Restaurant | null
  isLoading: boolean
  error: string | null
}

interface RestaurantContextType {
  restaurant: Restaurant | null
  isLoading: boolean
  error: string | null
}

const RestaurantContext = createContext<RestaurantContextType>({
  restaurant: null,
  isLoading: true,
  error: null,
})

export const useRestaurant = () => useContext(RestaurantContext)

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch restaurant data from API using the current hostname
        // No need to extract slug from params
        const response = await fetch('/api/restaurant')

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to fetch restaurant data")
        }

        const data = await response.json()
        setRestaurant(data)
      } catch (err) {
        console.error("Error fetching restaurant:", err)
        setError(err instanceof Error ? err.message : "Failed to load restaurant data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRestaurant()
  }, []) // No dependency on params anymore

  return <RestaurantContext.Provider value={{ restaurant, isLoading, error }}>{children}</RestaurantContext.Provider>
}