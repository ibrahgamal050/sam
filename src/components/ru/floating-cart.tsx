"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

export function FloatingCart() {
  const { items } = useCart()
  const count = items.reduce((s, i) => s + i.quantity, 0)
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  if (count === 0) return null

  return (
    <Link
      href="/ru/cart"
      className="fixed bottom-20 right-4 z-50 flex items-center gap-2 bg-[#6C5CE7] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[#5A4BD1] transition-colors"
      aria-label="Перейти в корзину"
    >
      <div className="relative">
        <ShoppingCart className="h-5 w-5" />
        <span className="absolute -top-2 -right-2 text-[10px] bg-white text-[#6C5CE7] rounded-full px-1.5 py-0.5 font-bold">
          {count}
        </span>
      </div>
      <span className="text-sm font-semibold">{subtotal.toFixed(0)} ₽</span>
    </Link>
  )
}
