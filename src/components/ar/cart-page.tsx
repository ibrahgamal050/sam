"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react"

import { useCart } from "@/contexts/cart-context"

export function CartPageClient() {
  const { items, addItem, decreaseItem, clearCart } = useCart()
  const router = useRouter()

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const taxes = Math.round(subtotal * 0.14)
  const delivery = items.length > 0 ? 20 : 0
  const total = subtotal + taxes + delivery
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleProceed = () => {
    router.push("/ar/checkout")
  }

  return (
    <div className="min-h-screen bg-white text-gray-900" dir="rtl">
      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:pt-12">
        <section className="relative mb-10 overflow-hidden rounded-[32px] border border-gray-200 bg-gradient-to-br from-[#f7f9fc] via-white to-white shadow-[0_25px_60px_-35px_rgba(15,23,42,0.35)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_65%)]" />
          <div className="relative flex flex-col gap-4 px-8 py-10 text-gray-900 sm:px-12">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-black/5 px-4 py-2 text-xs font-semibold text-gray-600">
              <ShoppingCart className="h-4 w-4" /> سلة المشتريات
            </span>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">راجع اختياراتك قبل الإتمام</h1>
              <p className="text-sm text-gray-600">
                لديك {itemCount} {itemCount === 1 ? "عنصر" : "عناصر"} بقيمة إجمالية {total.toFixed(0)} ج.م
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="rounded-full border border-gray-200 bg-white px-3 py-1">الأسعار شاملة الضريبة</span>
              <span className="rounded-full border border-gray-200 bg-white px-3 py-1">رسوم التوصيل مبدئية</span>
            </div>
          </div>
        </section>

        {items.length === 0 ? (
          <section className="rounded-[32px] border border-gray-200 bg-white p-12 text-center shadow-[0_20px_55px_-40px_rgba(15,23,42,0.45)]">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#f7f9fc] text-[#6c5ce7]">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-gray-900">سلتك فارغة</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              استكشف المنيو وأضف أطباقك المفضلة. بإمكانك العودة للسلة في أي وقت للإتمام.
            </p>
            <Link
              href="/ar/menu"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#6c5ce7] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#5a4bd1]"
            >
              تصفح المنيو الآن
            </Link>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="space-y-4">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-3xl border border-gray-200 bg-white px-4 py-5 shadow-[0_15px_35px_-25px_rgba(15,23,42,0.25)]"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                    <p className="mt-1 text-xs text-gray-500">{item.price.toFixed(0)} ج.م</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f9fc] text-gray-700 transition hover:bg-gray-200"
                      aria-label="تقليل الكمية"
                      onClick={() => decreaseItem(item.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7c325] text-black transition hover:bg-[#ffd342]"
                      aria-label="زيادة الكمية"
                      onClick={() => addItem({ id: item.id, name: item.name, price: item.price })}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  <span>تستطيع إزالة كل العناصر والبدء من جديد.</span>
                </div>
                <button onClick={clearCart} className="font-semibold underline-offset-2 hover:underline">
                  تفريغ السلة
                </button>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-[#f7f9fc] px-4 py-3 text-xs text-gray-600">
                <p>* بعد المتابعة سيتم التواصل معك عبر الهاتف لتأكيد الطلب وتحديد تفاصيل التوصيل.</p>
              </div>
            </section>

            <aside className="h-fit rounded-[32px] border border-gray-200 bg-white p-6 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.45)]">
              <h2 className="text-lg font-semibold text-gray-900">ملخص الطلب</h2>
              <div className="mt-5 space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>المجموع</span>
                  <span>{subtotal.toFixed(0)} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span>الضريبة (14%)</span>
                  <span>{taxes.toFixed(0)} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span>التوصيل المتوقع</span>
                  <span>{delivery.toFixed(0)} ج.م</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
                  <span>الإجمالي</span>
                  <span>{total.toFixed(0)} ج.م</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceed}
                className="mt-5 w-full rounded-2xl bg-[#6c5ce7] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#5a4bd1]"
              >
                المتابعة لإتمام الطلب
              </button>

              <Link
                href="/ar/menu"
                className="mt-3 block text-center text-xs font-semibold text-[#6c5ce7] hover:text-[#5a4bd1]"
              >
                متابعة التسوق
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
