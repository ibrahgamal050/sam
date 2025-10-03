// Utility functions for geocoding and reverse geocoding
export interface GeocodingResult {
  address: string
  city: string
  country: string
  displayName: string
}

/**
 * Convert coordinates to human-readable address using Nominatim API
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ru&addressdetails=1`,
      {
        headers: {
          "User-Agent": "DeliveryApp/1.0",
        },
      },
    )

    if (!response.ok) {
      throw new Error("Geocoding request failed")
    }

    const data = await response.json()

    if (!data || !data.address) {
      return null
    }

    const address = data.address

    // Build readable address from components
    const addressParts = []

    if (address.house_number && address.road) {
      addressParts.push(`${address.road}, ${address.house_number}`)
    } else if (address.road) {
      addressParts.push(address.road)
    }

    if (address.neighbourhood) {
      addressParts.push(address.neighbourhood)
    }

    const city = address.city || address.town || address.village || address.municipality || "Неизвестный город"
    const country = address.country || "Россия"

    return {
      address: addressParts.join(", ") || data.display_name.split(",")[0],
      city,
      country,
      displayName: data.display_name,
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error)
    return null
  }
}

/**
 * Search for addresses using Nominatim API
 */
export async function searchAddresses(query: string): Promise<GeocodingResult[]> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=ru&addressdetails=1&limit=5`,
      {
        headers: {
          "User-Agent": "DeliveryApp/1.0",
        },
      },
    )

    if (!response.ok) {
      throw new Error("Geocoding search failed")
    }

    const data = await response.json()

    return data.map((item: any) => {
      const address = item.address || {}
      const addressParts = []

      if (address.house_number && address.road) {
        addressParts.push(`${address.road}, ${address.house_number}`)
      } else if (address.road) {
        addressParts.push(address.road)
      }

      const city = address.city || address.town || address.village || address.municipality || "Неизвестный город"

      return {
        address: addressParts.join(", ") || item.display_name.split(",")[0],
        city,
        country: address.country || "Россия",
        displayName: item.display_name,
      }
    })
  } catch (error) {
    console.error("Address search error:", error)
    return []
  }
}
