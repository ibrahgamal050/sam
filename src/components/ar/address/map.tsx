"use client"

import { useEffect, useRef, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { ZonesAPI } from "@/lib/api/zones"
import type { DeliveryZone } from "@/types/delivery-zones"
import { reverseGeocode } from "@/lib/utils/geocoding"
import { cn } from "@/lib/utils"

interface CustomerMapProps {
  restaurantId?: string
  onLocationSelect: (lat: number, lng: number, address?: string) => void
  selectedAddress?: { lat: number; lng: number; name: string } | null
  className?: string
}

export default function CustomerMap({
  restaurantId,
  onLocationSelect,
  selectedAddress,
  className = "",
}: CustomerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false)
  const { toast } = useToast()

  const cairoCoordinates: [number, number] = [30.0444, 31.2357]

  useEffect(() => {
    loadZones()
  }, [restaurantId])

  const loadZones = async () => {
    if (!restaurantId) {
      setZones([])
      setIsLoading(false)
      return
    }

    try {
      const fetchedZones = await ZonesAPI.getZones(restaurantId, true) // Only active zones
      setZones(fetchedZones)
    } catch (error) {
      console.error("Error loading zones:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMapClick = async (lat: number, lng: number) => {
    setIsGeocodingLoading(true)

    try {
      if (restaurantId) {
        const availability = await ZonesAPI.checkDelivery(restaurantId, lat, lng)
        if (!availability.isDeliveryAvailable) {
          toast({
            variant: "destructive",
            title: "خارج نطاق التوصيل",
            description: "حدد موقعًا داخل نطاق التوصيل الخاص بالمطعم.",
          })
          return
        }
      }

      console.log("[v0] Starting reverse geocoding for coordinates:", lat, lng)
      const geocodingResult = await reverseGeocode(lat, lng)

      if (geocodingResult) {
        console.log("[v0] Geocoding successful:", geocodingResult)
        onLocationSelect(lat, lng, geocodingResult.address)
      } else {
        console.log("[v0] Geocoding failed, using coordinates")
        onLocationSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      }
    } catch (error) {
      console.error("[v0] Geocoding error:", error)
      onLocationSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    } finally {
      setIsGeocodingLoading(false)
    }
  }

  useEffect(() => {
    if (!mapRef.current || isLoading) return

    const initMap = async () => {
      // Dynamically import Leaflet to avoid SSR issues
      const L = (await import("leaflet")).default

      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      // Initialize map centered on Cairo
      const map = L.map(mapRef.current).setView(cairoCoordinates, 12)

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© مساهمو خريطة الشارع المفتوحة",
      }).addTo(map)

      mapInstanceRef.current = map

      let combinedBounds: any = null

      // Add zone layers for visual guidance
      zones.forEach((zone) => {
        if (zone.geometry.type === "Polygon") {
          const coordinates = zone.geometry.coordinates[0]?.map(([lng, lat]) => [lat, lng]) ?? []
          if (coordinates.length === 0) return

          const polygon = L.polygon(coordinates, {
            color: zone.color || "#6c5ce7",
            weight: 2,
            fillColor: zone.color || "#6c5ce7",
            fillOpacity: 0.15,
          }).addTo(map)

          markersRef.current.push(polygon)
          const polygonBounds = polygon.getBounds()
          combinedBounds = combinedBounds ? combinedBounds.extend(polygonBounds) : polygonBounds

          polygon.on("click", (event: any) => {
            event.originalEvent?.preventDefault?.()
            event.originalEvent?.stopPropagation?.()
            const { lat, lng } = event.latlng
            handleMapClick(lat, lng)
          })
        } else if (zone.zone_type === "circle" && zone.geometry.type === "Point") {
          const coords = zone.geometry.coordinates as [number, number]
          const radius = (zone.geometry as any)?.properties?.radius ?? 500

          const circle = L.circle([coords[1], coords[0]], {
            radius,
            color: zone.color || "#6c5ce7",
            weight: 2,
            fillColor: zone.color || "#6c5ce7",
            fillOpacity: 0.15,
          }).addTo(map)

          markersRef.current.push(circle)
          const circleBounds = circle.getBounds()
          combinedBounds = combinedBounds ? combinedBounds.extend(circleBounds) : circleBounds

          circle.on("click", (event: any) => {
            event.originalEvent?.preventDefault?.()
            event.originalEvent?.stopPropagation?.()
            const { lat, lng } = event.latlng
            handleMapClick(lat, lng)
          })
        } else if (zone.geometry.type === "Point") {
          const coords = zone.geometry.coordinates as [number, number]
          const marker = L.marker([coords[1], coords[0]]).addTo(map)

          markersRef.current.push(marker)
          const markerBounds = L.latLng(coords[1], coords[0]).toBounds(100)
          combinedBounds = combinedBounds ? combinedBounds.extend(markerBounds) : markerBounds

          marker.on("click", (event: any) => {
            event.originalEvent?.preventDefault?.()
            event.originalEvent?.stopPropagation?.()
            handleMapClick(coords[1], coords[0])
          })
        }
      })

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng
        handleMapClick(lat, lng)
      })

      // Add selected address marker if provided
    // جوّه useEffect بعد ما تنشئ الخريطة map
if (selectedAddress) {
  const selectedIcon = L.divIcon({
    html: `
      <div style="
        width:40px;height:40px;border-radius:12px;
        background:#3b82f6;display:flex;align-items:center;justify-content:center;
        box-shadow:0 8px 20px rgba(0,0,0,.2)"
      >
        <!-- أي SVG بسيط -->
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="#fff" viewBox="0 0 24 24">
          <path d="M5 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm14 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.5 7H11l2 4h2l-1.5-3H17V6h-3.5l-1-2h-2l1 2H8.5V7Z"/>
        </svg>
      </div>
      <div style="width:2px;height:12px;background:#111;margin:4px auto 0;"></div>
    `,
    iconSize: [40, 56],
    iconAnchor: [20, 56], // النقطة المطابقة لمكان الـlat/lng
    className: "selected-div-icon",
  })

  const selectedMarker = L.marker(
    [selectedAddress.lat, selectedAddress.lng],
    { icon: selectedIcon }
  ).addTo(map)

  markersRef.current.push(selectedMarker)
}


      if (combinedBounds) {
        try {
          map.fitBounds(combinedBounds.pad(0.2))
        } catch (error) {
          console.error("Failed to fit map bounds", error)
        }
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      markersRef.current = []
    }
  }, [zones, isLoading, selectedAddress, onLocationSelect])

  if (isLoading) {
    return (
      <div className={cn("relative flex items-center justify-center bg-gray-100", className)}>
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
          <p className="text-sm text-gray-600">جارٍ تحميل الخريطة...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <div ref={mapRef} className="w-full h-full" />

      {isGeocodingLoading && (
        <div className="absolute top-4 left-1/2 z-[1000] -translate-x-1/2 transform rounded-full bg-white px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm text-gray-600">جارٍ تحديد العنوان...</span>
          </div>
        </div>
      )}

      {/* Add Leaflet CSS */}
      <style jsx global>{`
        @import url('https://unpkg.com/leaflet@1.7.1/dist/leaflet.css');
        
        .custom-store-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .selected-location-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
      `}</style>
    </div>
  )
}
