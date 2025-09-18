"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/contexts/cart-context'
import { Minus, Plus, Trash2 } from 'lucide-react'

export function CartPageClient() {
  const { items, addItem, decreaseItem, clearCart } = useCart()
  const [orderMessage, setOrderMessage] = useState<string | null>(null)

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const taxes = Math.round(subtotal * 0.14)
  const delivery = items.length > 0 ? 20 : 0
  const total = subtotal + taxes + delivery

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <h1 className="text-xl font-bold mb-4">سلة المشتريات</h1>

      {items.length === 0 ? (
        <div className="bg-white border rounded p-6 text-center">
          <p className="mb-4">سلتك فارغة</p>
          <Link href="/ar/menu" className="text-[#6C5CE7] hover:underline">العودة إلى المنيو</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border rounded">
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between p-3">
                  <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-gray-500">{item.price.toFixed(0)} ج.م</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                      aria-label="تقليل الكمية"
                      onClick={() => decreaseItem(item.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button
                      className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                      aria-label="زيادة الكمية"
                      onClick={() => addItem({ id: item.id, name: item.name, price: item.price })}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-between p-3 border-t">
              <button onClick={clearCart} className="text-red-600 flex items-center gap-1 hover:underline">
                <Trash2 className="h-4 w-4" /> تفريغ السلة
              </button>
              <Link href="/ar/menu" className="text-[#6C5CE7] hover:underline">إضافة المزيد</Link>
            </div>
          </div>

          <aside className="bg-white border rounded p-4 h-fit">
            <h2 className="font-semibold mb-3">ملخص الطلب</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>المجموع</span><span>{subtotal.toFixed(0)} ج.م</span></div>
              <div className="flex justify-between"><span>الضريبة (14%)</span><span> ج.م</span></div>
              <div className="flex justify-between"><span>التوصيل</span><span> ج.م</span></div>
              <div className="flex justify-between font-bold border-t pt-2"><span>الإجمالي</span><span> {subtotal.toFixed(0)} ج.م</span></div>
            </div>
            {orderMessage && (
              <p className="mt-3 text-sm text-red-600 text-center">{orderMessage}</p>
            )}
            <button
              type="button"
              onClick={() =>
                setOrderMessage(
                  "عذرًا، المطعم غير متاح لاستقبال الطلبات أونلاين حاليًا. لكن تقدر تطلب مباشرة من المطعم من خلال الخط الساخن. ☎️🍴"
                )
              }
              className="mt-4 w-full text-center bg-[#6C5CE7] text-white py-2 rounded hover:bg-[#5A4BD1]"
            >
              المتابعة لإتمام الطلب
            </button>
          </aside>
        </div>
      )}
    </div>
  )
}
