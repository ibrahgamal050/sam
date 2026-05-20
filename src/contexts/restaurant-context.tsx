"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import type { IRestaurant } from "@/types/restaurant"

type RestaurantContextType = {
  restaurant: IRestaurant | null
  isLoading: boolean
  error: string | null
}

type RestaurantProviderProps = {
  children: ReactNode
  initialRestaurant?: IRestaurant | null
  initialSubdomain?: string | null
}

const RestaurantContext = createContext<RestaurantContextType>({
  restaurant: null,
  isLoading: true,
  error: null,
})

export const useRestaurant = () => useContext(RestaurantContext)

function extractSubdomainFromHost(hostname: string) {


  // دومين متعدد المستأجرين: sub.domain.tld -> sub
  const parts = hostname.split(".")
  if (parts.length >= 3) return parts[0]

  // دومين مخصص بدون sub (example.com) -> خلّيها فاضية (هتحتاج alias على السيرفر)
  return ""
}

export const RestaurantProvider = ({
  children,
  initialRestaurant = null,
  initialSubdomain = null,
}: RestaurantProviderProps) => {
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(initialRestaurant)
  const [isLoading, setIsLoading] = useState<boolean>(!initialRestaurant)
  const [error, setError] = useState<string | null>(null)
  const [subdomain, setSubdomain] = useState<string>(initialSubdomain ?? "")
  const lastFetchKeyRef = useRef<string | null>(
    initialRestaurant ? (initialSubdomain ?? "__no_subdomain__") : null,
  )

  // استخرج الـ subdomain من المتصفح
  useEffect(() => {
    if (typeof window === "undefined") return
    const sd = extractSubdomainFromHost(window.location.hostname)
    setSubdomain(sd)
  }, [])

  useEffect(() => {
    let cancelled = false

    const fetchRestaurant = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const url = subdomain
          ? `/api/restaurant?subdomain=${encodeURIComponent(subdomain)}`
          : `/api/restaurant`

        const response = await fetch(url, {
          headers: subdomain ? { "x-meelza-subdomain": subdomain } : undefined,
          cache: "no-store",
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || errorData.error || "Failed to fetch restaurant data")
        }

        const data = await response.json()

        if (!cancelled) {
          setRestaurant(data)
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching restaurant:", err)
          setError(err instanceof Error ? err.message : "Failed to load restaurant data")
          if (!initialRestaurant) {
            setRestaurant(null)
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    const fetchKey = subdomain || "__no_subdomain__"
    const isLocalhostContext =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname.endsWith(".localhost"))
    const hasMatchingRestaurant = Boolean(
      subdomain && restaurant && restaurant.subdomain === subdomain,
    )

    if (!initialRestaurant && subdomain === "" && isLocalhostContext) {
      setIsLoading(false)
      return undefined
    }

    if (hasMatchingRestaurant) {
      lastFetchKeyRef.current = fetchKey
      setIsLoading(false)
      return undefined
    }

    if (lastFetchKeyRef.current === fetchKey && restaurant) {
      setIsLoading(false)
      return undefined
    }

    lastFetchKeyRef.current = fetchKey
    void fetchRestaurant()

    return () => {
      cancelled = true
    }
  }, [initialRestaurant, restaurant, subdomain])

  const contextValue = useMemo(
    () => ({
      restaurant,
      isLoading,
      error,
    }),
    [restaurant, isLoading, error],
  )

  return (
    <RestaurantContext.Provider value={contextValue}>
      {children}
    </RestaurantContext.Provider>
  )
}
