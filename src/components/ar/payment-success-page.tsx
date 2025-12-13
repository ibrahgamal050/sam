"use client"

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/contexts/cart-context'

export function PaymentSuccessClient() {
  const params = useSearchParams()
  const orderId = params.get('orderId') || '—'
  const router = useRouter()
  const { clearCart } = useCart()

  useEffect(() => {
    async function markPaid() {
      try {
        if (orderId && orderId !== '—') {
          await fetch(`/api/v0/orders/${orderId}/status`, { method: 'PATCH' })
          clearCart()
        }
      } catch (e) {
        console.warn('Failed to update order status')
      }
    }
    markPaid()
  }, [orderId, clearCart])

  return (
    <div className="container mx-auto p-4 text-center" dir="rtl">
      <h1 className="text-2xl font-bold mb-2">تم الدفع بنجاح</h1>
      <p className="text-gray-600 mb-6">رقم الطلب: <span className="font-mono">{orderId}</span></p>
      <div className="space-x-0 space-y-2">
        <Link href={`/ar/order/${orderId}`} className="inline-block bg-[#6C5CE7] text-white px-4 py-2 rounded hover:bg-[#5A4BD1]">عرض تفاصيل الطلب</Link>
        <div className="mt-3">
          <button onClick={() => router.push('/ar/menu')} className="text-[#6C5CE7] hover:underline">العودة إلى المنيو</button>
        </div>
      </div>
    </div>
  )
}
