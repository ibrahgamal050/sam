"use client"

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export function PaymentFailureClient() {
  const params = useSearchParams()
  const orderId = params.get('orderId') || '—'

  return (
    <div className="container mx-auto p-4 text-center" dir="rtl">
      <h1 className="text-2xl font-bold mb-2 text-red-600">فشل الدفع</h1>
      <p className="text-gray-600 mb-6">لم تكتمل عملية الدفع للطلب <span className="font-mono">{orderId}</span></p>
      <div className="space-y-2">
        <Link href={`/ru/payment?orderId=${orderId}`} className="inline-block bg-[#6C5CE7] text-white px-4 py-2 rounded hover:bg-[#5A4BD1]">إعادة المحاولة</Link>
        <div className="mt-3">
          <Link href="/ru/cart" className="text-[#6C5CE7] hover:underline">العودة إلى السلة</Link>
        </div>
      </div>
    </div>
  )
}

