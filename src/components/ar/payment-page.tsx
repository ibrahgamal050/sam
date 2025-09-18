"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export function PaymentPageClient() {
  const params = useSearchParams()
  const router = useRouter()
  const orderId = params.get('orderId') || `ORD-${Date.now()}`
  const method = (params.get('method') || 'cod').toUpperCase()
  const amount = params.get('amount') || '0'
  const [card, setCard] = useState('')
  const [name, setName] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const ok = method === 'COD' || card.trim().length >= 8
    router.push(ok ? `/ar/payment/success?orderId=${orderId}` : `/ar/payment/failure?orderId=${orderId}`)
  }

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <h1 className="text-xl font-bold mb-4">الدفع الآمن</h1>
      <div className="bg-white border rounded p-4 max-w-lg">
        <p className="text-sm text-gray-600 mb-4">رقم الطلب: <span className="font-mono">{orderId}</span></p>
        <p className="text-sm text-gray-600 mb-4">الطريقة المختارة: {method}</p>
        <p className="font-semibold mb-4">المبلغ المطلوب: {amount} ج.م</p>

        {method !== 'COD' ? (
          <form onSubmit={submit} className="space-y-3">
            <input type="text" placeholder="اسم حامل البطاقة" className="w-full border p-2 rounded" value={name} onChange={(e)=>setName(e.target.value)} required />
            <input type="text" placeholder="رقم البطاقة (وهمي)" className="w-full border p-2 rounded" value={card} onChange={(e)=>setCard(e.target.value)} required />
            <button type="submit" className="w-full bg-[#6C5CE7] text-white py-2 rounded hover:bg-[#5A4BD1]">إتمام الدفع</button>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">اخترت الدفع عند الاستلام. أكد طلبك للمتابعة.</p>
            <button onClick={submit} className="w-full bg-[#6C5CE7] text-white py-2 rounded hover:bg-[#5A4BD1]">تأكيد الطلب</button>
          </div>
        )}

        <div className="mt-4 text-center">
          <Link href="/ar/cart" className="text-[#6C5CE7] hover:underline">العودة إلى السلة</Link>
        </div>
      </div>
    </div>
  )
}

