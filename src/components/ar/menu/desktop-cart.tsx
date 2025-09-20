"use client"

import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react"
import { useMemo } from "react"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"

interface DesktopCartProps {
  currency: string
}

export function DesktopCart({ currency }: DesktopCartProps) {
  const { items, addItem, decreaseItem, clearCart } = useCart()

  const { subtotal, totalQuantity } = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    return {
      subtotal,
      totalQuantity,
    }
  }, [items])

  return (
    <aside className="hidden lg:flex h-[calc(100vh-3rem)] flex-col rounded-[32px] border border-gray-200 bg-white p-6 text-gray-900 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.35)] sticky top-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">السلة</h2>
          <p className="text-sm text-gray-500">{totalQuantity > 0 ? `${totalQuantity} عنصر` : "لم يتم إضافة عناصر بعد"}</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-[#f7f9fc] px-3 py-1.5 text-xs text-gray-600 transition hover:border-red-200 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            تفريغ السلة
          </button>
        )}
      </header>

      <div className="mt-6 flex-1 overflow-y-auto pr-3" aria-live="polite">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-gray-500">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f7f9fc] text-[#6c5ce7]">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-gray-800">سلتك فارغة</p>
              <p className="text-sm text-gray-500">ابدأ بإضافة أطباقك المفضلة من القائمة</p>
            </div>
          </div>
        ) : (
          <ul className="space-y-5">
            {items.map((item) => (
              <li key={item.id} className="rounded-2xl border border-gray-200 bg-[#f7f9fc] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {item.price.toFixed(0)} {currency}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseItem(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100"
                      aria-label="تقليل الكمية"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => addItem({ id: item.id, name: item.name, price: item.price })}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6c5ce7] text-white transition hover:bg-[#5a4bd1]"
                      aria-label="زيادة الكمية"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>الإجمالي الفرعي</span>
                  <span className="font-semibold text-gray-900">
                    {(item.price * item.quantity).toFixed(0)} {currency}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="pt-6 mt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>الإجمالي</span>
          <span className="text-lg font-semibold text-gray-900">
            {subtotal.toFixed(0)} {currency}
          </span>
        </div>
        <Button
          type="button"
          className="mt-4 w-full rounded-2xl bg-[#6c5ce7] text-white hover:bg-[#5a4bd1] transition text-sm font-semibold py-2 shadow-lg"
          disabled={items.length === 0}
        >
          متابعة الطلب
        </Button>
      </footer>
    </aside>
  )
}
