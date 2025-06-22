"use client"

import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { IMenuItem } from "@/types/menu"
import { useState, useEffect } from "react"

interface MenuItemCardProps {
  item: IMenuItem
  currency: string
}

export function MenuItemCard({ item, currency }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(item.quantity || 0)
  
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
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 0) {
      setQuantity((prev) => prev - 1)
    }
  }

  return (
    <article
      className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
      itemScope
      itemType="https://schema.org/MenuItem"
    >
      <div className="relative">
        {item.image ? (
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

        {/* New Badge */}
        {item.isNew && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-gray-900 hover:bg-gray-800 text-white border-0 text-xs font-bold px-2">جديد</Badge>
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="mb-1 flex justify-between items-start">
          <h3 className="font-medium text-gray-800 text-sm line-clamp-1" itemProp="name">
            {itemName}
          </h3>
          <div
            className="text-xl font-bold text-gray-900"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <span itemProp="price">{item.price}</span> <span itemProp="priceCurrency">{currency}</span>
          </div>
        </div>

        {itemDescription && (
          <p className="text-gray-500 text-xs line-clamp-2 mb-1" itemProp="description">
            {itemDescription}
          </p>
        )}

        {itemWeight && (
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-xs mb-2">{itemWeight}</p>
            <p className="text-gray-400 text-xs mb-2">تكفي 3-4 أفراد</p>
          </div>
        )}

        <div className="flex items-center justify-end mt-2">
          {quantity > 0 ? (
            <QuantityControls quantity={quantity} onIncrement={incrementQuantity} onDecrement={decrementQuantity} />
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-200 text-gray-700 hover:bg-gray-100"
              onClick={incrementQuantity}
              aria-label={`إضافة ${itemName}`}
            >
              <Plus className="h-4 w-4 ml-1" aria-hidden="true" />
              إضافة
            </Button>
          )}
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
