import { NextResponse } from "next/server"
import { getPagesByRestaurantId } from "@/lib/services/page-service"

export async function GET(request: Request, { params }: { params: { restaurantId: string } }) {
  try {
    const { restaurantId } = params
    const pages = await getPagesByRestaurantId(restaurantId)
    return NextResponse.json(pages)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch pages" }, { status: 500 })
  }
}