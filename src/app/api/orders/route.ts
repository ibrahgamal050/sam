import { NextResponse } from 'next/server'
import { createOrder, getOrdersByRestaurantId } from '@/lib/services/order-service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { restaurantId, userId, guest, items } = body || {}

    if (!restaurantId) return NextResponse.json({ error: 'restaurantId is required' }, { status: 400 })
    if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ error: 'items are required' }, { status: 400 })

    const order = await createOrder({ restaurantId, userId, guest, items })
    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create order' }, { status: 500 })
  }
}

// Example fetch: /api/orders?restaurantId=... -> returns that restaurant's orders
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const restaurantId = searchParams.get('restaurantId')
  if (!restaurantId) return NextResponse.json({ error: 'restaurantId is required' }, { status: 400 })
  try {
    const orders = await getOrdersByRestaurantId(restaurantId)
    return NextResponse.json(orders)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch orders' }, { status: 500 })
  }
}

