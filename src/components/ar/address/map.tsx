"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { ZonesAPI } from "@/lib/api/zones"
import type { DeliveryZone } from "@/types/delivery-zones"
import { reverseGeocode } from "@/lib/utils/geocoding"
import { cn } from "@/lib/utils"
import type { BranchSummary } from "@/lib/branch-utils"

interface CustomerMapProps {
  restaurantId?: string
  onLocationSelect: (lat: number, lng: number, address?: string) => void
  selectedAddress?: { lat: number; lng: number; name: string } | null
  className?: string
  branches?: BranchSummary[]
  pickupMode?: boolean
  selectedBranchId?: string | null
  onSelectBranch?: (branch: BranchSummary) => void
}

export default function CustomerMap({
  restaurantId,
  onLocationSelect,
  selectedAddress,
  className = "",
  branches = [],
  pickupMode = false,
  selectedBranchId,
  onSelectBranch,
}: CustomerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false)
  const { toast } = useToast()

  const cairoCoordinates: [number, number] = [30.0444, 31.2357]

  const selectedBranch = useMemo(() => {
    if (!pickupMode || !selectedBranchId) return null
    return branches.find((branch) => branch.id === selectedBranchId) ?? null
  }, [branches, pickupMode, selectedBranchId])

  useEffect(() => {
    loadZones()
  }, [restaurantId, pickupMode])

  const loadZones = async () => {
    setIsLoading(true)
    if (!restaurantId || pickupMode) {
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
    if (pickupMode) return

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
        noWrap: true,
      }).addTo(map)

      mapInstanceRef.current = map
      map.options.minZoom = 5

      let combinedBounds: any = null
      const paddingOptions = { paddingTopLeft: [0, 140], paddingBottomRight: [0, 48] }

      // Add zone layers for visual guidance
      if (!pickupMode) {
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
      }

      const branchPositions: Array<{ summary: BranchSummary; lat: number; lng: number }> = []

      if (pickupMode && branches.length) {
        branches.forEach((branch) => {
          const lat = typeof branch.latitude === "number" ? branch.latitude : undefined
          const lng = typeof branch.longitude === "number" ? branch.longitude : undefined
          if (lat === undefined || lng === undefined) return

          branchPositions.push({ summary: branch, lat, lng })
          const branchBounds = L.latLng(lat, lng).toBounds(200)
          combinedBounds = combinedBounds ? combinedBounds.extend(branchBounds) : branchBounds
        })
      }

      if (!pickupMode && selectedAddress) {
        const addressBounds = L.latLng(selectedAddress.lat, selectedAddress.lng).toBounds(200)
        combinedBounds = combinedBounds ? combinedBounds.extend(addressBounds) : addressBounds
      }

      if (pickupMode && selectedBranch && typeof selectedBranch.latitude === "number" && typeof selectedBranch.longitude === "number") {
        const branchBounds = L.latLng(selectedBranch.latitude, selectedBranch.longitude).toBounds(200)
        combinedBounds = combinedBounds ? combinedBounds.extend(branchBounds) : branchBounds
      }

      if (combinedBounds) {
        try {
          map.fitBounds(combinedBounds.pad(0.2), paddingOptions)
        } catch (error) {
          console.error("Failed to fit bounds", error)
        }
        map.setMaxBounds(combinedBounds.pad(0.35))
        map.options.maxBoundsViscosity = 1.0
      } else if (!pickupMode && selectedAddress) {
        const center = L.latLng(selectedAddress.lat, selectedAddress.lng)
        map.setView(center, 15)
        map.setMaxBounds(center.toBounds(500))
        map.options.maxBoundsViscosity = 1.0
      } else if (pickupMode && selectedBranch && typeof selectedBranch.latitude === "number" && typeof selectedBranch.longitude === "number") {
        const center = L.latLng(selectedBranch.latitude, selectedBranch.longitude)
        map.setView(center, 15)
        map.setMaxBounds(center.toBounds(500))
        map.options.maxBoundsViscosity = 1.0
      } else {
        const worldBounds = L.latLngBounds([-85, -180], [85, 180])
        map.setMaxBounds(worldBounds)
        map.options.maxBoundsViscosity = 0.5
      }

      const baseZoom = map.getZoom()
      if (Number.isFinite(baseZoom)) {
        map.options.minZoom = Math.max(baseZoom - 1, 5)
        map.options.maxZoom = 18
      }

      if (pickupMode && branchPositions.length) {
        const branchIcon = (active: boolean) => L.divIcon({
          html: `
            <div style="
              width:48px;height:48px;border-radius:16px;
              background:${active ? "#6c5ce7" : "#ffffff"};
              border:2px solid ${active ? "#4936d3" : "#d4d4d8"};
              display:flex;align-items:center;justify-content:center;
              box-shadow:0 10px 24px rgba(90,76,209,${active ? "0.35" : "0.18"});
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="${active ? "#ffffff" : "#4b5563"}" viewBox="0 0 24 24">
                <path d="M12 2a7 7 0 0 0-7 7c0 4.418 5.373 10.32 6.221 11.206a1 1 0 0 0 1.558 0C13.627 19.32 19 13.418 19 9a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/>
              </svg>
            </div>
            <div style="width:2px;height:12px;background:${active ? "#4936d3" : "#4b5563"};margin:4px auto 0;"></div>
          `,
          iconSize: [48, 64],
          iconAnchor: [24, 64],
          className: "branch-div-icon",
        })

        branchPositions.forEach(({ summary: branch, lat, lng }) => {
          const marker = L.marker([lat, lng], {
            icon: branchIcon(branch.id === selectedBranchId),
          }).addTo(map)

          markersRef.current.push(marker)

          const markerBounds = L.latLng(lat, lng).toBounds(200)
          combinedBounds = combinedBounds ? combinedBounds.extend(markerBounds) : markerBounds

          const tooltipLines = [branch.name, branch.address, branch.city].filter(Boolean).join(" • ")
          if (tooltipLines) {
            marker.bindTooltip(tooltipLines, {
              direction: "top",
              offset: [0, -24],
              opacity: 0.85,
            })
          }

          marker.on("click", (event: any) => {
            event.originalEvent?.preventDefault?.()
            event.originalEvent?.stopPropagation?.()
            onSelectBranch?.(branch)
            map.flyTo([lat, lng], 15, { duration: 0.35 })
          })
        })
      }

      map.on("click", (e: any) => {
        if (pickupMode) return
        const { lat, lng } = e.latlng
        handleMapClick(lat, lng)
      })

      // Add selected address marker if provided (delivery mode only)
      if (!pickupMode && selectedAddress) {
        const selectedMarker = L.circleMarker([selectedAddress.lat, selectedAddress.lng], {
          radius: 9,
          color: "#2563eb",
          weight: 3,
          fillColor: "#60a5fa",
          fillOpacity: 0.85,
        }).addTo(map)

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
  }, [zones, isLoading, selectedAddress, onLocationSelect, branches, pickupMode, selectedBranchId, onSelectBranch])

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
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <div ref={mapRef} className="h-full w-full" />

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
