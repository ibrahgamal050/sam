"use client"

import { useParams, useRouter } from 'next/navigation'

export function OrderConfirmationClient() {
  const params = useParams()
  const router = useRouter()
  const orderId = (params?.orderId as string) || '—'

  return (
    <div className="container mx-auto p-4 text-center" dir="rtl">
      <h1 className="text-2xl font-bold mb-2">تم تأكيد الطلب</h1>
      <p className="text-gray-600 mb-2">رقم الطلب: <span className="font-mono">{orderId}</span></p>
      <p className="text-gray-600 mb-6">الوقت المتوقع للتسليم: 30-45 دقيقة</p>
      <div className="space-x-0 space-y-2">
        <button onClick={() => router.push('/ru/menu')} className="inline-block bg-[#6C5CE7] text-white px-4 py-2 rounded hover:bg-[#5A4BD1]">تصفّح المزيد</button>
        <div className="mt-3">
          <button className="text-gray-600 cursor-not-allowed" disabled>تتبّع طلبي (قريباً)</button>
        </div>
      </div>
    </div>
  )
}

