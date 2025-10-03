import { NextResponse } from "next/server"

import dbConnect from "@/lib/db"
import DeliveryZoneLegacy from "@/models/DeliveryZoneLegacy"
import { Types } from "mongoose"
import { normalizeHost } from "@/lib/host-utils"
import { getRestaurantByHost } from "@/lib/services/restaurant-service"

const EARTH_RADIUS_METERS = 6371000

const toZoneResponse = (zone: any) => ({
  id: zone._id?.toString() ?? "",
  restaurantId: zone.restaurantId?.toString() ?? "",
  name: zone.name,
  description: zone.description ?? undefined,
  delivery_fee: zone.delivery_fee,
  color: zone.color,
  is_active: zone.is_active,
  zone_type: zone.zone_type,
  geometry: zone.geometry,
  created_at: zone.createdAt?.toISOString?.() ?? new Date().toISOString(),
  updated_at: zone.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  created_by: zone.created_by ?? undefined,
})

function isPointInsidePolygon(point: [number, number], polygon: number[][]) {
  // Ray casting algorithm for point in polygon
  let inside = false
  const [x, y] = point
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0000001) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function haversineDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_METERS * c
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)

    if (!body) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 })
    }

    let { restaurantId, lat, lng } = body as {
      restaurantId?: string
      lat?: number
      lng?: number
    }

    if (!restaurantId) {
      const host = normalizeHost(request.headers.get("host"))
      if (host) {
        const restaurant = await getRestaurantByHost(host)
        if (restaurant?._id) {
          restaurantId = restaurant._id.toString()
        }
      }

      if (!restaurantId) {
        restaurantId = request.headers.get("x-restaurant-id") ?? undefined
      }
    }

    if (!restaurantId || typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "parameters restaurantId, lat, lng are required" }, { status: 400 })
    }

    await dbConnect()

    const zones = await DeliveryZoneLegacy.find({
      restaurantId: new Types.ObjectId(restaurantId),
      is_active: true,
    }).lean()

    const matchingZones = zones.filter((zone) => {
      if (!zone.geometry) return false

      if (zone.zone_type === "circle" && zone.geometry.type === "Point") {
        const [zoneLng, zoneLat] = zone.geometry.coordinates as [number, number]
        const radius = zone.geometry?.properties?.radius ?? 0
        const distance = haversineDistanceMeters(lat, lng, zoneLat, zoneLng)
        return distance <= radius
      }

      if (zone.geometry.type === "Polygon") {
        const polygonCoordinates = zone.geometry.coordinates?.[0]
        if (!polygonCoordinates) return false
        const projectedPolygon = polygonCoordinates.map(([polygonLng, polygonLat]) => [polygonLng, polygonLat])
        return isPointInsidePolygon([lng, lat], projectedPolygon as number[][])
      }

      return false
    })

    const responseZones = matchingZones.map(toZoneResponse)

    const lowestFeeValue =
      responseZones.length > 0
        ? responseZones.reduce((min, zone) => Math.min(min, zone.delivery_fee), Number.POSITIVE_INFINITY)
        : Number.POSITIVE_INFINITY
    const lowestFee = Number.isFinite(lowestFeeValue) ? lowestFeeValue : null

    return NextResponse.json({
      isDeliveryAvailable: responseZones.length > 0,
      zones: responseZones,
      lowestDeliveryFee: lowestFee,
      location: { lat, lng },
    })
  } catch (error) {
    console.error("Failed to check delivery availability", error)
    return NextResponse.json({ error: "تعذّر التحقق من نطاق التوصيل" }, { status: 500 })
  }
}
