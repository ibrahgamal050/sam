"use client"

import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { IMenuItem } from "@/types/menu"
import { useEffect, useMemo, useState } from "react"
import { useCart } from "@/contexts/cart-context"

interface MenuItemCardProps {
  item: IMenuItem
  currency: string
}

export function MenuItemCard({ item, currency }: MenuItemCardProps) {
  const { items: cartItems, addItem, decreaseItem } = useCart()
  // Derive current quantity from the cart by item id
  const itemId = useMemo(() => (item._id ? item._id.toString() : `${item.name?.ar || item.name?.en || ""}-${item.price ?? 0}`), [item])
  const quantity = useMemo(() => {
    const found = cartItems.find((ci) => ci.id === itemId)
    return found ? found.quantity : 0
  }, [cartItems, itemId])

  const itemName = typeof item.name === "object" ? item.name.ar : item.name
  const itemDescription =
    typeof item.description === "object" && item.description !== null ? item.description.ar : item.description || ""
  const itemWeight = item.weight || ""
  const [subdomain, setSubdomain] = useState("")

useEffect(() => {
  const host = window.location.hostname
  const sub = host.split(".")[0]
  setSubdomain(sub)
}, [])

  const incrementQuantity = () => {
    // Add to shared cart context
    addItem({
      id: itemId,
      name: itemName || "",
      price: item.price ?? 0,
    })
  }

  const decrementQuantity = () => {
    if (quantity > 0) {
      decreaseItem(itemId)
    }
  }

  return (
    <article
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
      itemScope
      itemType="https://schema.org/MenuItem"
    >
      <div className="relative">
        {item ? (
          <img
            src={`/images/${subdomain}/cover.jpg`}
            alt={`${itemName} `}
            className="h-32 w-full object-cover"
            loading="lazy"
            width="300"
            height="150"
            itemProp="image"
          />
        ) : (
          <div className="h-32 w-full bg-gray-100 flex items-center justify-center" aria-hidden="true">
            <span className="text-gray-400 text-sm">لا توجد صورة</span>
          </div>
        )}

        {item.isNew && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-violet-600 hover:bg-violet-700 text-white border-0 text-xs font-bold px-2">جديد</Badge>
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        <h3 className="font-bold text-gray-900 text-base line-clamp-1" itemProp="name">
          {itemName}
        </h3>
        {itemDescription && (
          <p className="text-gray-600 text-sm leading-snug line-clamp-2" itemProp="description">
            {itemDescription}
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <div
            className="text-[#6C5CE7] font-extrabold text-lg"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <span itemProp="price">{item.price}</span>
            <span className="mr-1 text-sm" itemProp="priceCurrency">{currency || "ج.م"}</span>
          </div>

          <div className="flex items-center">
            {quantity > 0 ? (
              <QuantityControls quantity={quantity} onIncrement={incrementQuantity} onDecrement={decrementQuantity} />
            ) : (
              <button
                onClick={incrementQuantity}
                aria-label={`إضافة ${itemName}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#6C5CE7] text-white px-3 py-1.5 text-sm shadow-sm hover:bg-[#5A4BD1] active:scale-95 transition"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                إضافة
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

interface QuantityControlsProps {
  quantity: number
  onIncrement: () => void
  onDecrement: () => void
}

function QuantityControls({ quantity, onIncrement, onDecrement }: QuantityControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
        onClick={onDecrement}
        aria-label="تقليل الكمية"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </Button>
      <span className="w-5 text-center text-gray-800">{quantity}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
        onClick={onIncrement}
        aria-label="زيادة الكمية"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
