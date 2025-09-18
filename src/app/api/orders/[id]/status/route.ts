import { NextResponse } from 'next/server'
import { updateOrderStatus } from '@/lib/services/order-service'

export async function PATCH(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const updated = await updateOrderStatus(id, 'paid' as any)
    if (!updated) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'SERVER_ERROR' }, { status: 500 })
  }
}
