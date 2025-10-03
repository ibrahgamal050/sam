import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { getOrdersForCustomer } from "@/lib/services/order-service"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const restaurantId = searchParams.get("restaurantId") ?? undefined

  try {
    const orders = await getOrdersForCustomer(session.user.id, restaurantId ?? undefined)
    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Failed to fetch customer orders", error)
    return NextResponse.json({ error: "تعذّر جلب الطلبات" }, { status: 500 })
  }
}
