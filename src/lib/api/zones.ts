import type { CreateDeliveryZoneRequest, DeliveryZone, UpdateDeliveryZoneRequest } from "@/lib/types/delivery-zones"

type AuthHeaderConfig = {
  headers?: HeadersInit
}

const withAuthHeaders = (config?: AuthHeaderConfig): HeadersInit => ({
  ...(config?.headers ?? {}),
})

const API_BASE = "/api/zones"

function requireRestaurantId(restaurantId: string): string {
  if (!restaurantId) {
    throw new Error("restaurantId is required for delivery zone operations")
  }
  return restaurantId
}

export class ZonesAPI {
  // Fetch all zones
  static async getZones(restaurantId: string, activeOnly = false): Promise<DeliveryZone[]> {
    const params = new URLSearchParams({ restaurantId: requireRestaurantId(restaurantId) })
    if (activeOnly) {
      params.set("active", "true")
    }

    const response = await fetch(`${API_BASE}?${params.toString()}`, {
      headers: withAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch zones: ${response.statusText}`)
    }

    const data = await response.json()
    return data.zones
  }

  // Fetch a specific zone
  static async getZone(restaurantId: string, id: string): Promise<DeliveryZone> {
    const params = new URLSearchParams({ restaurantId: requireRestaurantId(restaurantId) })
    const response = await fetch(`${API_BASE}/${id}?${params.toString()}`, {
      headers: withAuthHeaders(),
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Zone not found")
      }
      throw new Error(`Failed to fetch zone: ${response.statusText}`)
    }

    const data = await response.json()
    return data.zone
  }

  // Create a new zone
  static async createZone(
    restaurantId: string,
    zoneData: Omit<CreateDeliveryZoneRequest, "restaurantId">,
  ): Promise<DeliveryZone> {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: withAuthHeaders({
        headers: {
          "Content-Type": "application/json",
        },
      }),
      body: JSON.stringify({ ...zoneData, restaurantId: requireRestaurantId(restaurantId) }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Failed to create zone: ${response.statusText}`)
    }

    const data = await response.json()
    return data.zone
  }

  // Update a zone
  static async updateZone(
    restaurantId: string,
    id: string,
    updates: Partial<UpdateDeliveryZoneRequest> | Partial<DeliveryZone>,
  ): Promise<DeliveryZone> {
    const params = new URLSearchParams({ restaurantId: requireRestaurantId(restaurantId) })

    const response = await fetch(`${API_BASE}/${id}?${params.toString()}`, {
      method: "PUT",
      headers: withAuthHeaders({
        headers: {
          "Content-Type": "application/json",
        },
      }),
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Failed to update zone: ${response.statusText}`)
    }

    const data = await response.json()
    return data.zone
  }

  // Delete a zone
  static async deleteZone(restaurantId: string, id: string): Promise<void> {
    const params = new URLSearchParams({ restaurantId: requireRestaurantId(restaurantId) })
    const response = await fetch(`${API_BASE}/${id}?${params.toString()}`, {
      method: "DELETE",
      headers: withAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Failed to delete zone: ${response.statusText}`)
    }
  }

  // Check delivery availability for a location
  static async checkDelivery(
    restaurantId: string,
    lat: number,
    lng: number,
    opts?: {
      zoneId?: string
      debounceMs?: number
    },
  ): Promise<{
    isDeliveryAvailable: boolean
    zones: DeliveryZone[]
    lowestDeliveryFee: number | null
    location: { lat: number; lng: number }
  }> {
    const normalizedRestaurantId = requireRestaurantId(restaurantId)
    const debounceMs = opts?.debounceMs ?? 500
    const key = `${normalizedRestaurantId}:${opts?.zoneId ?? "any"}:${lat.toFixed(5)}:${lng.toFixed(5)}`
    const now = Date.now()

    // Simple in-memory cache (30s TTL) + in-flight dedup to avoid double calls in StrictMode/dev
    const cacheEntry = deliveryCache.get(key)
    if (cacheEntry && cacheEntry.expiresAt > now) {
      return cacheEntry.data
    }
    if (inFlightChecks.has(key)) {
      return inFlightChecks.get(key)!
    }

    // Debounce network calls per key (400–800ms window)
    if (pendingTimers.has(key)) {
      return pendingTimers.get(key)!
    }

    const deferred = new Promise<{
      isDeliveryAvailable: boolean
      zones: DeliveryZone[]
      lowestDeliveryFee: number | null
      location: { lat: number; lng: number }
    }>((resolve, reject) => {
      const timer = setTimeout(async () => {
        pendingTimers.delete(key)
        const fetchPromise = (async () => {
          const response = await fetch(`${API_BASE}/check-delivery`, {
            method: "POST",
            headers: withAuthHeaders({
              headers: {
                "Content-Type": "application/json",
              },
            }),
            body: JSON.stringify({
              restaurantId: normalizedRestaurantId,
              lat,
              lng,
              zoneId: opts?.zoneId, // optional for caching key symmetry
            }),
          })

          if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.error || `Failed to check delivery: ${response.statusText}`)
          }

          return response.json()
        })()

        inFlightChecks.set(key, fetchPromise)

        try {
          const data = await fetchPromise
          deliveryCache.set(key, { data, expiresAt: Date.now() + 30_000 })
          resolve(data)
        } catch (err) {
          reject(err)
        } finally {
          inFlightChecks.delete(key)
        }
      }, debounceMs)

      timer.unref?.()
    })

    pendingTimers.set(key, deferred)
    return deferred
  }
}

// --- Client-side cache/dedupe state (module-scoped) ---
const deliveryCache = new Map<
  string,
  {
    data: {
      isDeliveryAvailable: boolean
      zones: DeliveryZone[]
      lowestDeliveryFee: number | null
      location: { lat: number; lng: number }
    }
    expiresAt: number
  }
>()

const pendingTimers = new Map<string, Promise<any>>()
const inFlightChecks = new Map<string, Promise<any>>()
