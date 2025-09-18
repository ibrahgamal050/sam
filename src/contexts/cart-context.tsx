
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  decreaseItem: (id: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('cart') : null
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[]
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch (e) {
      console.warn('Failed to load cart from storage', e)
    }
  }, [])

  // Persist cart to localStorage on change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('cart', JSON.stringify(items))
      }
    } catch (e) {
      console.warn('Failed to save cart to storage', e)
    }
  }, [items])

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id)
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const decreaseItem = (id: string) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === id)
      if (!existing) return prev
      if (existing.quantity <= 1) {
        return prev.filter((p) => p.id !== id)
      }
      return prev.map((p) =>
        p.id === id ? { ...p, quantity: p.quantity - 1 } : p
      )
    })
  }

  const clearCart = () => setItems([])

  return (
    <CartContext.Provider value={{ items, addItem, decreaseItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
