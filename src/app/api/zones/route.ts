import { NextResponse } from "next/server"

import dbConnect from "@/lib/db"
import DeliveryZoneLegacy from "@/models/delivery-zone-legacy"
import { Types } from "mongoose"
import { normalizeHost } from "@/lib/host-utils"
import { getRestaurantByHost } from "@/lib/services/restaurant-service"

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const activeOnly = searchParams.get("active") === "true"

  let restaurantId = searchParams.get("restaurantId")

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

  if (!restaurantId) {
    return NextResponse.json({ error: "restaurantId is required" }, { status: 400 })
  }

  try {
    await dbConnect()

    const filter: Record<string, unknown> = { restaurantId: new Types.ObjectId(restaurantId) }
    if (activeOnly) {
      filter.is_active = true
    }

    const zones = await DeliveryZoneLegacy.find(filter).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ zones: zones.map(toZoneResponse) })
  } catch (error) {
    console.error("Failed to fetch delivery zones", error)
    return NextResponse.json({ error: "تعذّر تحميل نطاقات التوصيل" }, { status: 500 })
  }
}
