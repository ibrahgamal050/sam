"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { ShoppingCart, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react"

import { useCart } from "@/contexts/cart-context"

const formatValue = (value: number) => {
  if (!Number.isFinite(value)) return "0"
  const normalized = Math.max(0, value)
  return Number.isInteger(normalized) ? normalized.toFixed(0) : normalized.toFixed(2)
}

export function CartPageClient() {
  const { items, increaseItem, decreaseItem, clearCart } = useCart()
  const router = useRouter()
  const params = useParams()
  const rawLocale = params?.lng
  const locale = (Array.isArray(rawLocale) ? rawLocale[0] : rawLocale) ?? "ar"
  const basePath = `/${locale}`

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const taxes = Math.round(subtotal * 0.14)
  const delivery = items.length > 0 ? 20 : 0
  const total = subtotal + taxes + delivery
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const hasItems = itemCount > 0

  const handleProceed = () => {
    router.push(`${basePath}/checkout`)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900" dir="rtl">
      <div className="mx-auto w-full max-w-5xl px-4 pb-32 pt-10 sm:px-6 lg:pt-12">
        

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
              href={`${basePath}/menu`}
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
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                    {item.variant?.name && <p className="text-xs text-gray-500">النوع: {item.variant.name}</p>}
                    {item.extras.length > 0 && (
                      <ul className="space-y-1 text-[11px] text-gray-500">
                        {item.extras.map((extra) => (
                          <li key={`${item.id}-${extra.id}`}>
                            {extra.qty} × {extra.name || "إضافة"}{" "}
                            {extra.price > 0 ? (
                              <span className="text-gray-400">
                                (+{formatValue(extra.price)} ج.م)
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.note && <p className="text-[11px] text-gray-400">ملاحظة: {item.note}</p>}
                    <p className="text-xs text-gray-500">
                      {formatValue(item.unitPrice)} ج.م لكل عنصر
                    </p>
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
                      onClick={() => increaseItem(item.id)}
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
                  <span>{formatValue(subtotal)} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span>الضريبة (14%)</span>
                  <span>{formatValue(taxes)} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span>التوصيل المتوقع</span>
                  <span>{formatValue(delivery)} ج.م</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
                  <span>الإجمالي</span>
                  <span>{formatValue(total)} ج.م</span>
                </div>
              </div>


              <Link
                href={`${basePath}/menu`}
                className="mt-3 block text-center text-xs font-semibold text-[#6c5ce7] hover:text-[#5a4bd1]"
              >
                متابعة التسوق
              </Link>
            </aside>
          </div>
        )}

        {hasItems ? (
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-12px_30px_-20px_rgba(15,23,42,0.35)] backdrop-blur md:hidden">
            <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
              <div className="flex flex-1 items-center justify-between text-sm font-semibold text-gray-900">
                <span>الإجمالي</span>
                <span>{formatValue(total)} ج.م</span>
              </div>
              <button
                type="button"
                onClick={handleProceed}
                className="w-[45%] min-w-[180px] rounded-2xl bg-[#6c5ce7] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#5a4bd1]"
              >
                المتابعة لإتمام الطلب
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
