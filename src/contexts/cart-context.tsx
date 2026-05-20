
'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

const STORAGE_KEY = "cart"

interface CartItemIdParams {
  itemId: string
  variantId?: string
  extras?: Array<{ extraId: string; qty: number }>
  note?: string
}

interface CartExtraSelection {
  id: string
  name?: string
  price: number
  qty: number
  groupId?: string
  groupName?: string
}

interface CartVariantSelection {
  id?: string
  name?: string
  price?: number
}

interface CartItemPayloadExtra {
  extraId: string
  qty: number
}

export interface CartItemPayload {
  itemId: string
  variantId?: string
  extras: CartItemPayloadExtra[]
  qty: number
  note?: string
}

export interface CartItem {
  id: string
  name: string
  basePrice: number
  unitPrice: number
  quantity: number
  payload: CartItemPayload
  variant?: CartVariantSelection
  extras: CartExtraSelection[]
  note?: string
}

export interface CartItemInput {
  itemId: string
  itemName: string
  basePrice: number
  quantity?: number
  variant?: CartVariantSelection
  extras?: CartExtraSelection[]
  note?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (input: CartItemInput) => void
  increaseItem: (id: string, amount?: number) => void
  decreaseItem: (id: string) => void
  clearCart: () => void
}

export const CartContext = createContext<CartContextType | undefined>(undefined)

const sanitizeNote = (note?: string) => {
  if (typeof note !== "string") return undefined
  const trimmed = note.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value)

const toPositiveInteger = (value: unknown): number => {
  if (!isFiniteNumber(value)) return 0
  const rounded = Math.floor(value)
  return rounded > 0 ? rounded : 0
}

const computeUnitPrice = (basePrice: number, extras: CartExtraSelection[] = []) => {
  const extrasTotal = extras.reduce((sum, extra) => sum + extra.price * extra.qty, 0)
  return Math.max(0, basePrice + extrasTotal)
}

const normalizeExtras = (extras?: CartExtraSelection[]): CartExtraSelection[] => {
  if (!extras) return []
  return extras
    .map((extra) => {
      const qty = toPositiveInteger(extra.qty)
      if (qty === 0) return null
      return {
        id: String(extra.id),
        name: extra.name ? String(extra.name) : undefined,
        price: isFiniteNumber(extra.price) ? extra.price : 0,
        qty,
        groupId: extra.groupId ? String(extra.groupId) : undefined,
        groupName: extra.groupName ? String(extra.groupName) : undefined,
      }
    })
    .filter((extra): extra is CartExtraSelection => extra !== null)
}

const buildCartItemId = ({ itemId, variantId, extras = [], note }: CartItemIdParams): string => {
  const extrasKey = extras
    .filter((extra) => extra.qty > 0)
    .sort((a, b) => a.extraId.localeCompare(b.extraId))
    .map((extra) => `${extra.extraId}:${extra.qty}`)
    .join("|")

  const noteKey = sanitizeNote(note)

  return [itemId, variantId ?? "", extrasKey, noteKey ? `note:${noteKey}` : ""].filter(Boolean).join("__")
}

const mapExtrasToPayload = (extras: CartExtraSelection[]): CartItemPayloadExtra[] =>
  extras.map((extra) => ({
    extraId: extra.id,
    qty: extra.qty,
  }))

const upgradeStoredItem = (raw: unknown): CartItem | null => {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const candidate = raw as Partial<CartItem> & {
    price?: number
  }

  // New shape detection
  if ("payload" in candidate && candidate.payload && "unitPrice" in candidate) {
    const quantity = toPositiveInteger(candidate.quantity)
    if (quantity === 0) return null

    const note = sanitizeNote(candidate.note ?? candidate.payload?.note)
    const extras = normalizeExtras(candidate.extras)
    const payloadExtras = Array.isArray(candidate.payload?.extras)
      ? candidate.payload.extras
          .map((extra) => ({
            extraId: String(extra.extraId),
            qty: toPositiveInteger(extra.qty),
          }))
          .filter((extra) => extra.qty > 0)
      : mapExtrasToPayload(extras)

    const payload: CartItemPayload = {
      itemId: candidate.payload?.itemId ? String(candidate.payload.itemId) : "",
      variantId: candidate.payload?.variantId ? String(candidate.payload.variantId) : undefined,
      extras: payloadExtras,
      qty: quantity,
      note,
    }

    const id = buildCartItemId({
      itemId: payload.itemId,
      variantId: payload.variantId,
      extras: payload.extras,
      note,
    })

    return {
      id,
      name: candidate.name ? String(candidate.name) : "",
      basePrice: isFiniteNumber(candidate.basePrice)
        ? candidate.basePrice
        : isFiniteNumber(candidate.unitPrice)
          ? candidate.unitPrice
          : 0,
      unitPrice: isFiniteNumber(candidate.unitPrice)
        ? candidate.unitPrice
        : isFiniteNumber(candidate.basePrice)
          ? candidate.basePrice
          : 0,
      quantity,
      payload,
      variant: candidate.variant
        ? {
            id: candidate.variant.id ? String(candidate.variant.id) : undefined,
            name: candidate.variant.name ? String(candidate.variant.name) : undefined,
            price: isFiniteNumber(candidate.variant.price) ? candidate.variant.price : undefined,
          }
        : undefined,
      extras,
      note,
    }
  }

  // Legacy shape
  if ("id" in candidate && "price" in candidate && "quantity" in candidate) {
    const quantity = toPositiveInteger(candidate.quantity)
    if (quantity === 0) return null

    const basePrice = isFiniteNumber(candidate.price) ? candidate.price : 0
    const itemId = String(candidate.id ?? "")
    const note = sanitizeNote(candidate.note)

    const payload: CartItemPayload = {
      itemId,
      qty: quantity,
      extras: [],
      note,
    }

    const id = buildCartItemId({
      itemId,
      note,
    })

    return {
      id,
      name: candidate.name ? String(candidate.name) : "",
      basePrice,
      unitPrice: basePrice,
      quantity,
      payload,
      extras: [],
      note,
    }
  }

  return null
}

const loadInitialItems = (): CartItem[] => {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map(upgradeStoredItem).filter((item): item is CartItem => item !== null)
  } catch (error) {
    console.warn("Failed to load cart from storage", error)
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadInitialItems())

  // Persist cart to localStorage on change
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      }
    } catch (error) {
      console.warn("Failed to save cart to storage", error)
    }
  }, [items])

  const addItem = (input: CartItemInput) => {
    const quantity = Math.max(1, toPositiveInteger(input.quantity ?? 1))
    const basePrice = isFiniteNumber(input.basePrice) ? input.basePrice : 0
    const note = sanitizeNote(input.note)
    const extras = normalizeExtras(input.extras)
    const payloadExtras = mapExtrasToPayload(extras)
    const variant: CartVariantSelection | undefined = input.variant
      ? {
          id: input.variant.id ? String(input.variant.id) : undefined,
          name: input.variant.name ? String(input.variant.name) : undefined,
          price: isFiniteNumber(input.variant.price) ? input.variant.price : undefined,
        }
      : undefined

    const cartId = buildCartItemId({
      itemId: String(input.itemId),
      variantId: variant?.id,
      extras: payloadExtras,
      note,
    })

    const newItem: CartItem = {
      id: cartId,
      name: input.itemName,
      basePrice,
      unitPrice: computeUnitPrice(basePrice, extras),
      quantity,
      payload: {
        itemId: String(input.itemId),
        variantId: variant?.id,
        extras: payloadExtras,
        qty: quantity,
        note,
      },
      variant,
      extras,
      note,
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === cartId)
      if (existingIndex === -1) {
        return [...prev, newItem]
      }

      const next = [...prev]
      const existing = next[existingIndex]
      const updatedQuantity = existing.quantity + quantity
      next[existingIndex] = {
        ...existing,
        quantity: updatedQuantity,
        payload: {
          ...existing.payload,
          qty: updatedQuantity,
        },
      }
      return next
    })
  }

  const increaseItem = (id: string, amount = 1) => {
    const increment = Math.max(1, toPositiveInteger(amount))
    setItems((prev) => {
      const index = prev.findIndex((item) => item.id === id)
      if (index === -1) return prev
      const next = [...prev]
      const existing = next[index]
      const updatedQuantity = existing.quantity + increment
      next[index] = {
        ...existing,
        quantity: updatedQuantity,
        payload: {
          ...existing.payload,
          qty: updatedQuantity,
        },
      }
      return next
    })
  }

  const decreaseItem = (id: string) => {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.id === id)
      if (index === -1) return prev
      const next = [...prev]
      const existing = next[index]
      const updatedQuantity = existing.quantity - 1

      if (updatedQuantity <= 0) {
        next.splice(index, 1)
        return next
      }

      next[index] = {
        ...existing,
        quantity: updatedQuantity,
        payload: {
          ...existing.payload,
          qty: updatedQuantity,
        },
      }
      return next
    })
  }

  const clearCart = () => setItems([])

  return (
    <CartContext.Provider value={{ items, addItem, increaseItem, decreaseItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}

export function useCartOptional(): CartContextType | undefined {
  return useContext(CartContext)
}
