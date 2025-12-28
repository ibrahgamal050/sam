"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { useCart } from "@/contexts/cart-context"

type CardStyle = "soft" | "outlined" | "flat"

type CardBaseProps = {
  name: string
  description?: string
  image?: string
  price?: number
  badgeText?: string
  aspectRatio?: string // "4 / 3"
  cardStyle?: CardStyle
}

const cardBaseClass = (cardStyle?: CardStyle) => {
  return cardStyle === "outlined"
    ? "border border-slate-200 bg-white shadow-sm"
    : cardStyle === "flat"
      ? "bg-white"
      : "bg-white shadow-sm"
}

function MenuItemCardSimple({
  name,
  description,
  image,
  price,
  badgeText = "جنيه",
  aspectRatio = "4 / 3",
  cardStyle,
}: CardBaseProps) {
  return (
    <article className={cn("rounded-[28px] p-4", cardBaseClass(cardStyle))}>
      <div className="mb-3 overflow-hidden rounded-2xl bg-slate-100" style={{ aspectRatio }}>
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-sm text-slate-400">صورة</div>
        )}
      </div>

      <h3 className="text-base font-extrabold leading-snug text-slate-900 line-clamp-2 md:text-lg">{name}</h3>

      <div className="mt-2">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
          {badgeText}
        </span>
      </div>

      {description ? (
        <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2 md:text-sm">{description}</p>
      ) : null}

      <div className="mt-2 text-lg font-extrabold text-slate-900 md:text-xl">
        {typeof price === "number" ? `${price} جنيه` : "—"}
      </div>
    </article>
  )
}

type StepperProps = CardBaseProps & {
  qty?: number
  onInc: () => void
  onDec: () => void
}

function MenuItemCardStepper({
  name,
  description,
  image,
  price,
  badgeText = "جنيه",
  aspectRatio = "4 / 3",
  qty = 0,
  onInc,
  onDec,
  cardStyle,
}: StepperProps) {
  return (
    <article className={cn("rounded-[28px] p-4", cardBaseClass(cardStyle))}>
      <div className="mb-3 overflow-hidden rounded-2xl bg-slate-100" style={{ aspectRatio }}>
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-sm text-slate-400">صورة</div>
        )}
      </div>

      <h3 className="text-base font-extrabold leading-snug text-slate-900 line-clamp-2 md:text-lg">{name}</h3>

      <div className="mt-2">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
          {badgeText}
        </span>
      </div>

      {description ? (
        <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2 md:text-sm">{description}</p>
      ) : null}

      <div className="mt-2 text-lg font-extrabold text-slate-900 md:text-xl">
        {typeof price === "number" ? `${price} جنيه` : "—"}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1">
          <button
            type="button"
            onClick={onDec}
            className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-xl leading-none text-slate-700"
            aria-label="نقصان"
            disabled={qty <= 0}
          >
            –
          </button>

          <span className="w-6 text-center font-bold text-slate-800">{qty}</span>

          <button
            type="button"
            onClick={onInc}
            className="grid h-9 w-9 place-items-center rounded-full bg-indigo-600 text-xl leading-none text-white"
            aria-label="زيادة"
          >
            +
          </button>
        </div>
      </div>
    </article>
  )
}

type AddProps = CardBaseProps & {
  onAdd: () => void
  qty?: number
}

function MenuItemCardAdd({
  name,
  image,
  price,
  badgeText = "جنيه",
  aspectRatio = "4 / 3",
  onAdd,
  qty = 0,
  cardStyle,
}: AddProps) {
  return (
    <article className={cn("rounded-[28px] p-4", cardBaseClass(cardStyle))}>
      <div className="mb-3 overflow-hidden rounded-2xl bg-slate-100" style={{ aspectRatio }}>
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-sm text-slate-400">صورة</div>
        )}
      </div>

      <h3 className="text-base font-extrabold leading-snug text-slate-900 line-clamp-2 md:text-lg">{name}</h3>

      <div className="mt-2">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
          {badgeText}
        </span>
      </div>

      <div className="mt-2 text-lg font-extrabold text-slate-900 md:text-xl">
        {typeof price === "number" ? `${price} جنيه` : "—"}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-600">{qty > 0 ? `في السلة: ${qty}` : "أضف إلى السلة"}</span>
        <button
          type="button"
          onClick={onAdd}
          className="grid h-10 w-10 place-items-center rounded-full bg-indigo-600 text-xl leading-none text-white"
          aria-label="أضف"
        >
          +
        </button>
      </div>
    </article>
  )
}

type MenuDynamicItem = {
  id: string
  name: string
  description?: string
  price?: number
  image?: string
}

type MenuDynamicGroup = {
  id?: string // ✅ عشان key يبقى ثابت
  title?: string
  items: MenuDynamicItem[]
}

type MenuDynamicClientProps = {
  groups: MenuDynamicGroup[]
  variant: "simple" | "add" | "stepper"
  gridClasses: string
  aspectRatio: string
  cardStyle?: CardStyle
  emptyLabel: string

  // ✅ NEW: من السيرفر/JSON
  showCategoryTitle?: boolean
  stickyCategoryTitle?: boolean
  stickyTopClass?: string
}

export function MenuDynamicClient({
  groups,
  variant,
  gridClasses,
  aspectRatio,
  cardStyle,
  emptyLabel,
  showCategoryTitle = true,
  stickyCategoryTitle = true,
  stickyTopClass = "top-[120px] md:top-[80px]",
}: MenuDynamicClientProps) {
  const { items: cartItems, addItem, increaseItem, decreaseItem } = useCart()

  const { quantityByItemId, cartIdByItemId } = useMemo(() => {
    const quantities = new Map<string, number>()
    const ids = new Map<string, string>()

    cartItems.forEach((cartItem: any) => {
      const key = cartItem?.payload?.itemId
      if (!key) return

      const prev = quantities.get(key) ?? 0
      quantities.set(key, prev + (cartItem?.quantity ?? 0))

      if (!ids.has(key) && cartItem?.id) ids.set(key, cartItem.id)
    })

    return { quantityByItemId: quantities, cartIdByItemId: ids }
  }, [cartItems])

  const handleAdd = (item: MenuDynamicItem) => {
    const basePrice = typeof item.price === "number" && Number.isFinite(item.price) ? Math.max(0, item.price) : 0
    addItem({
      itemId: item.id,
      itemName: item.name,
      basePrice,
      quantity: 1,
      extras: [],
    })
  }

  const handleIncrease = (item: MenuDynamicItem, currentQty: number) => {
    if (currentQty > 0) {
      const cartId = cartIdByItemId.get(item.id)
      if (!cartId) return handleAdd(item)
      increaseItem(cartId)
    } else {
      handleAdd(item)
    }
  }

  const handleDecrease = (itemId: string, currentQty: number) => {
    if (currentQty <= 0) return
    const cartId = cartIdByItemId.get(itemId)
    if (!cartId) return
    decreaseItem(cartId)
  }

  const totalItems = (groups ?? []).reduce((sum, group) => sum + (group.items?.length ?? 0), 0)

  if (!totalItems) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-28 md:pb-0">
      {(groups ?? []).map((group, idx) => {
        const groupKey = group.id ?? `${group.title ?? "group"}-${idx}`

        return (
          <div key={groupKey} className="space-y-4">
            {showCategoryTitle && group.title ? (
              stickyCategoryTitle ? (
                <div
                  className={cn(
                    "sticky z-20",
                    stickyTopClass,
                    "border-b border-slate-200 bg-white/90 pb-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md"
                  )}
                >
                  <h2 className="text-xl font-extrabold text-slate-900 md:text-2xl">{group.title}</h2>
                </div>
              ) : (
                <h2 className="text-xl font-extrabold text-slate-900 md:text-2xl">{group.title}</h2>
              )
            ) : null}

            <div className={gridClasses}>
              {(group.items ?? []).map((item) => {
                const qty = quantityByItemId.get(item.id) ?? 0

                const commonProps: CardBaseProps = {
                  name: item.name,
                  description: item.description,
                  image: item.image,
                  price: item.price,
                  badgeText: "جنيه",
                  aspectRatio,
                  cardStyle,
                }

                if (variant === "stepper") {
                  return (
                    <MenuItemCardStepper
                      key={item.id}
                      {...commonProps}
                      qty={qty}
                      onInc={() => handleIncrease(item, qty)}
                      onDec={() => handleDecrease(item.id, qty)}
                    />
                  )
                }

                if (variant === "add") {
                  return (
                    <MenuItemCardAdd
                      key={item.id}
                      {...commonProps}
                      qty={qty}
                      onAdd={() => handleIncrease(item, qty)}
                    />
                  )
                }

                return <MenuItemCardSimple key={item.id} {...commonProps} />
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
