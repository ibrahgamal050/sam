import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Restaurant from "@/models/restaurant"
import { getMenuByRestaurantId } from "@/lib/services/menu-service"
import { normalizeHost } from "@/lib/host-utils"

type Params = {
  params: Promise<{ restaurantId: string }>
}

export async function GET(_: Request, { params }: Params) {
  const { restaurantId } = await params
  if (!restaurantId) {
    return NextResponse.json({ error: "restaurantId is required" }, { status: 400 })
  }

  try {
    await dbConnect()
    const normalized = normalizeHost(restaurantId) || restaurantId
    const restaurant = await Restaurant.findOne({
      $or: [
        { subdomain: normalized },
        { slug: normalized },
        { canonicalHost: normalized },
        { _id: normalized },
      ],
    })
      .lean()
      .catch(async () =>
        Restaurant.findOne({
          $or: [{ subdomain: normalized }, { slug: normalized }, { canonicalHost: normalized }],
        }).lean(),
      )

    if (!restaurant?._id) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    const menu = await getMenuByRestaurantId(restaurant._id.toString())
    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 })
    }

    return NextResponse.json(menu)
  } catch (error: any) {
    console.error("Failed to load menu", error)
    return NextResponse.json({ error: "Failed to load menu" }, { status: 500 })
  }
}
