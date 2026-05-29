"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Minus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { useIsMobile } from "@/components/ui/use-mobile"
import { MenuItemConfigurator } from "./menu-item-configurator"
import type { IMenuItem } from "@/types/menu"
import { useCart, type CartItemInput } from "@/contexts/cart-context"
import { getLocalizedText } from "@/lib/localize"

interface MenuItemCardProps {
  item: IMenuItem
  currency: string
}

const formatPrice = (value: number) => {
  if (!Number.isFinite(value)) return "0"
  const normalized = Math.max(0, value)
  if (normalized === 0) return "0"
  if (Number.isInteger(normalized)) return normalized.toFixed(0)
  return normalized.toFixed(2)
}

const resolveId = (value: unknown, fallback: string) => {
  if (!value) return fallback
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)
  if (typeof value === "object" && value !== null && "toString" in value) {
    const result = (value as { toString: () => string }).toString()
    if (result && result !== "[object Object]") return result
  }
  return fallback
}

export function MenuItemCard({ item, currency }: MenuItemCardProps) {
  const { items: cartItems, addItem, increaseItem, decreaseItem } = useCart()
  const isMobile = useIsMobile()
  const [subdomain, setSubdomain] = useState("")
  const [isConfiguratorOpen, setConfiguratorOpen] = useState(false)

  useEffect(() => {
    const host = window.location.hostname
    const sub = host.split(".")[0]
    setSubdomain(sub)
  }, [])

  const itemId = useMemo(
    () => resolveId(item._id, `${getLocalizedText(item.name, "item")}-${item.price ?? 0}`),
    [item._id, item.name, item.price],
  )

  const itemName = useMemo(() => getLocalizedText(item.name, "Блюдо"), [item.name])
  const itemDescription = useMemo(() => getLocalizedText(item.description, ""), [item.description])
  const itemWeight = item.weight || ""

  const variantPrices = useMemo(() => {
    const prices: number[] = []
    if (Array.isArray(item.variants)) {
      item.variants.forEach((variant) => {
        if (Number.isFinite(variant.price)) prices.push(Number(variant.price))
      })
    }
    if (Array.isArray(item.sizes)) {
      item.sizes.forEach((size) => {
        if (Number.isFinite(size.price)) prices.push(Number(size.price))
      })
    }
    return prices.filter((price) => price > 0)
  }, [item.sizes, item.variants])

  const hasVariants = variantPrices.length > 0
  const hasExtras = Array.isArray(item.extrasGroups) && item.extrasGroups.length > 0
  const requiresConfiguration = hasVariants || hasExtras

  const basePrice = useMemo(() => {
    if (Number.isFinite(item.price) && Number(item.price) > 0) return Number(item.price)
    if (variantPrices.length > 0) return Math.min(...variantPrices)
    return 0
  }, [item.price, variantPrices])

  const aggregatedQuantity = useMemo(
    () =>
      cartItems
        .filter((cartItem) => cartItem.payload.itemId === itemId)
        .reduce((sum, cartItem) => sum + cartItem.quantity, 0),
    [cartItems, itemId],
  )

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

  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")
  const FALLBACK_IMAGE = `${base}/placeholder.jpg`

  const openConfigurator = () => setConfiguratorOpen(true)
  const closeConfigurator = () => setConfiguratorOpen(false)

  const handleQuickAdd = () => {
    addItem({
      itemId,
      itemName,
      basePrice,
      quantity: 1,
      extras: [],
    })
  }

  const handleConfiguratorConfirm = (payload: CartItemInput) => {
    addItem(payload)
    setConfiguratorOpen(false)
  }

  const handleIncrease = () => increaseItem(itemId)
  const handleDecrease = () => decreaseItem(itemId)

  return (
    <>
      <article
        className="group rounded-[28px] border border-gray-200 bg-white text-gray-900 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-1 hover:shadow-[0_25px_55px_-35px_rgba(15,23,42,0.45)]"
        itemScope
        itemType="https://schema.org/MenuItem"
      >
        <div className="relative px-4 pt-4">
          <div className="flex h-36 items-center justify-center rounded-2xl bg-[#f7f9fc] p-4">
            <img
              src={imageSrc || FALLBACK_IMAGE}
              alt={itemName}
              className="h-full w-full object-contain"
              loading="lazy"
              width={220}
              height={160}
              itemProp="image"
            />
          </div>

          {item.isNew && (
            <div className="absolute top-6 right-6">
              <Badge className="rounded-full bg-[#6c5ce7] px-3 py-1 text-xs font-bold text-white shadow-md">Новинка</Badge>
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
            <div className="text-lg font-bold text-[#111827]" itemScope itemType="https://schema.org/Offer" itemProp="offers">
              {basePrice > 0 ? (
                <>
                  <span itemProp="price">{formatPrice(basePrice)}</span>
                  <span className="ml-1 text-sm" itemProp="priceCurrency">
                    {currency}
                  </span>
                  {requiresConfiguration && <span className="text-xs text-gray-500">(от)</span>}
                </>
              ) : (
                <span className="text-sm font-normal text-gray-500">Цена после выбора опций</span>
              )}
            </div>

            {!requiresConfiguration && aggregatedQuantity > 0 ? (
              <QuantityControls quantity={aggregatedQuantity} onIncrement={handleIncrease} onDecrement={handleDecrease} />
            ) : null}
          </div>

          {requiresConfiguration ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={openConfigurator}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f7f9fc] py-2 text-sm font-semibold text-gray-700 transition hover:bg-[#eef2f7]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6c5ce7] text-white">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </span>
                Выбрать опции
              </button>
              {aggregatedQuantity > 0 && (
                <p className="text-xs text-gray-500">В корзине: {aggregatedQuantity}</p>
              )}
            </div>
          ) : aggregatedQuantity === 0 ? (
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={`Добавить ${itemName}`}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f7f9fc] py-2 text-sm font-semibold text-gray-700 transition hover:bg-[#eef2f7]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6c5ce7] text-white">
                <Plus className="h-4 w-4" aria-hidden="true" />
              </span>
              Добавить в корзину
            </button>
          ) : null}
        </div>
      </article>

      {isMobile ? (
        <Drawer open={isConfiguratorOpen} onOpenChange={setConfiguratorOpen} shouldScaleBackground>
          <DrawerContent className="max-h-[92vh] rounded-t-[32px] border-none bg-transparent pb-6">
            <div className="mx-auto mt-3 w-full max-w-md rounded-[32px] border border-gray-200 bg-white px-4 py-5 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.35)]">
              <MenuItemConfigurator
                item={item}
                currency={currency}
                imageSrc={imageSrc || FALLBACK_IMAGE}
                onConfirm={handleConfiguratorConfirm}
                onClose={closeConfigurator}
              />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isConfiguratorOpen} onOpenChange={setConfiguratorOpen}>
          <DialogContent className="max-h-[90vh] w-full max-w-3xl overflow-hidden border-none bg-transparent p-0 shadow-none">
            <div className="max-h-[90vh] overflow-hidden rounded-[32px] border border-gray-200 bg-white p-6 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.35)]">
              <MenuItemConfigurator
                item={item}
                currency={currency}
                imageSrc={imageSrc || FALLBACK_IMAGE}
                onConfirm={handleConfiguratorConfirm}
                onClose={closeConfigurator}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
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
        type="button"
        onClick={onDecrement}
        aria-label="Уменьшить количество"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-600 transition hover:bg-gray-100"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="w-6 text-center text-sm font-semibold text-gray-900">{quantity}</span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label="Увеличить количество"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6c5ce7] text-white transition hover:bg-[#5a4bd1]"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
