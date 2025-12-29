import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Restaurant from "@/models/restaurant"
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
      .catch(async () => {
        // إذا فشل الـ ObjectId cast، جرّب بدون _id
        return Restaurant.findOne({
          $or: [{ subdomain: normalized }, { slug: normalized }, { canonicalHost: normalized }],
        }).lean()
      })

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    const branches = Array.isArray((restaurant as any).branches) ? (restaurant as any).branches : []

    return NextResponse.json(
      branches.map((branch: any) => ({
        ...branch,
        id: branch._id?.toString?.() ?? branch.id ?? branch.name,
      })),
    )
  } catch (error: any) {
    console.error("Failed to load branches", error)
    return NextResponse.json({ error: "Failed to load branches" }, { status: 500 })
  }
}
