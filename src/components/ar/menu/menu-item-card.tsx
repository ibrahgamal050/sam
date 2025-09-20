"use client"

import { Plus, Minus } from "lucide-react"
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

  const imageSrc = useMemo(() => {
    if (!item?.image) return null
    if (item.image.startsWith("http")) return item.image

    if (item.image.startsWith("/")) {
      return subdomain ? `/images/${subdomain}${item.image}` : item.image
    }

    if (subdomain) {
      return `/images/${subdomain}/${item.image}`
    }

    return `/images/${item.image}`
  }, [item?.image, subdomain])

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
const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const FALLBACK_IMAGE = `${base}/placeholder.jpg`;

  return (
    <article
      className="group rounded-[28px] border border-gray-200 bg-white text-gray-900 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-1 hover:shadow-[0_25px_55px_-35px_rgba(15,23,42,0.45)]"
      itemScope
      itemType="https://schema.org/MenuItem"
    >
      <div className="relative px-4 pt-4">
        <div className="flex h-36 items-center justify-center rounded-2xl bg-[#f7f9fc] p-4">
          
            <img
               src={imageSrc || FALLBACK_IMAGE}
              alt={`${itemName}`}
              className="h-full w-full object-contain"
              loading="lazy"
              width={220}
              height={160}
              itemProp="image"
            />
           
        </div>

        {item.isNew && (
          <div className="absolute top-6 right-6">
            <Badge className="rounded-full bg-[#6c5ce7] px-3 py-1 text-xs font-bold text-white shadow-md">جديد</Badge>
          </div>
        )}
      </div>

      <div className="px-4 pb-5 pt-4 space-y-3">
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-base font-semibold text-gray-900" itemProp="name">
            {itemName}
          </h3>
          {itemDescription && (
            <p className="line-clamp-2 text-xs text-gray-500 leading-5" itemProp="description">
              {itemDescription}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400">
          {itemWeight && <span className="text-gray-500">{itemWeight}</span>}
          <span className="rounded-full bg-[#f7f9fc] px-2 py-0.5 text-xs font-medium text-gray-600">{currency}</span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div
            className="text-lg font-bold text-[#111827]"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <span itemProp="price">{item.price}</span>
            <span className="mr-1 text-sm" itemProp="priceCurrency">{currency || "ج.م"}</span>
          </div>

          {quantity > 0 ? (
            <QuantityControls quantity={quantity} onIncrement={incrementQuantity} onDecrement={decrementQuantity} />
          ) : null}
        </div>

        {quantity === 0 && (
          <button
            onClick={incrementQuantity}
            aria-label={`إضافة ${itemName}`}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f7f9fc] py-2 text-sm font-semibold text-gray-700 transition hover:bg-[#eef2f7]"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6c5ce7] text-white">
              <Plus className="h-4 w-4" aria-hidden="true" />
            </span>
            أضف إلى السلة
          </button>
        )}
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
    <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-[#f7f9fc] p-1">
      <button
        onClick={onDecrement}
        aria-label="تقليل الكمية"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-600 transition hover:bg-gray-100"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="w-6 text-center text-sm font-semibold text-gray-900">{quantity}</span>
      <button
        onClick={onIncrement}
        aria-label="زيادة الكمية"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6c5ce7] text-white transition hover:bg-[#5a4bd1]"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
