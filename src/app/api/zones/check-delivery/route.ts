import { NextResponse } from "next/server"

import dbConnect from "@/lib/db"
import DeliveryZoneLegacy from "@/models/delivery-zone-legacy"
import { Types } from "mongoose"
import { normalizeHost } from "@/lib/host-utils"
import { getRestaurantByHost } from "@/lib/services/restaurant-service"

const EARTH_RADIUS_METERS = 6371000
const CACHE_TTL_MS = 30_000

const toZoneResponse = (zone: any) => ({
  id: zone._id?.toString() ?? "",
  restaurantId: zone.restaurantId?.toString() ?? "",
  branchId: zone.branchId?.toString?.() ?? undefined,
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

type CacheResult = {
  isDeliveryAvailable: boolean
  zones: any[]
  lowestDeliveryFee: number | null
  location: { lat: number; lng: number }
}

// In-memory cache for environments without Redis
const memoryCache = new Map<string, { expiresAt: number; value: CacheResult }>()

const redisConfig = {
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
}

const hasRedis = Boolean(redisConfig.url && redisConfig.token)

const buildCacheKey = (restaurantId: string, zoneId: string | undefined, lat: number, lng: number) =>
  `${restaurantId}:${zoneId ?? "any"}:${lat.toFixed(5)}:${lng.toFixed(5)}`

async function getFromRedis(key: string): Promise<CacheResult | null> {
  if (!hasRedis) return null
  try {
    const res = await fetch(`${redisConfig.url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${redisConfig.token}` },
      cache: "no-store",
    })
    if (!res.ok) return null
    const json = await res.json()
    if (!json?.result) return null
    return JSON.parse(json.result) as CacheResult
  } catch {
    return null
  }
}

async function setRedis(key: string, value: CacheResult, ttlMs: number) {
  if (!hasRedis) return
  try {
    await fetch(`${redisConfig.url}/set/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${redisConfig.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        value: JSON.stringify(value),
        ex: Math.max(1, Math.floor(ttlMs / 1000)),
      }),
    })
  } catch {
    // ignore cache write errors
  }
}

async function getCachedResult(key: string): Promise<CacheResult | null> {
  const now = Date.now()
  const cached = memoryCache.get(key)
  if (cached && cached.expiresAt > now) {
    return cached.value
  }
  if (hasRedis) {
    const redisValue = await getFromRedis(key)
    if (redisValue) {
      memoryCache.set(key, { value: redisValue, expiresAt: now + CACHE_TTL_MS })
      return redisValue
    }
  }
  return null
}

async function setCachedResult(key: string, value: CacheResult) {
  const expiresAt = Date.now() + CACHE_TTL_MS
  memoryCache.set(key, { value, expiresAt })
  await setRedis(key, value, CACHE_TTL_MS)
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)

    if (!body) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 })
    }

    let { restaurantId, lat, lng, zoneId } = body as {
      restaurantId?: string
      lat?: number
      lng?: number
      zoneId?: string
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

    const cacheKey = buildCacheKey(restaurantId, zoneId, lat, lng)
    const cached = await getCachedResult(cacheKey)
    if (cached) {
      return NextResponse.json({ ...cached, cached: true })
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
    const payload: CacheResult = {
      isDeliveryAvailable: responseZones.length > 0,
      zones: responseZones,
      lowestDeliveryFee: lowestFee,
      location: { lat, lng },
    }

    await setCachedResult(cacheKey, payload)

    return NextResponse.json(payload)
  } catch (error) {
    console.error("Failed to check delivery availability", error)
    return NextResponse.json({ error: "تعذّر التحقق من نطاق التوصيل" }, { status: 500 })
  }
}
