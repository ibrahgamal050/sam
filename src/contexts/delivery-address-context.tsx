"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useSession } from "next-auth/react"

export interface DeliveryAddress {
  id: string
  name: string
  address: string
  city: string
  lat: number
  lng: number
  isDefault?: boolean
}

interface DeliveryAddressContextValue {
  addresses: DeliveryAddress[]
  selectedAddress: DeliveryAddress | null
  selectAddress: (id: string) => void
  addAddress: (address: Omit<DeliveryAddress, "id"> & { id?: string; isDefault?: boolean }) => Promise<DeliveryAddress>
  updateAddress: (
    id: string,
    updates: Partial<Omit<DeliveryAddress, "id">> & { isDefault?: boolean },
  ) => Promise<DeliveryAddress>
  deleteAddress: (id: string) => Promise<void>
  setDefaultAddress: (id: string) => Promise<void>
  isLoading: boolean
}

const DEFAULT_ADDRESSES: DeliveryAddress[] = [
  {
    id: "1",
    name: "المنزل",
    address: "١٢ شارع التحرير، الدقي",
    city: "الجيزة",
    lat: 30.0376,
    lng: 31.2118,
    isDefault: true,
  },
  {
    id: "2",
    name: "العمل",
    address: "١٠ شارع الثورة، مصر الجديدة",
    city: "القاهرة",
    lat: 30.0902,
    lng: 31.3234,
  },
  {
    id: "3",
    name: "الأسرة",
    address: "شارع ٩، المعادي",
    city: "القاهرة",
    lat: 29.9604,
    lng: 31.2599,
  },
]

const DeliveryAddressContext = createContext<DeliveryAddressContextValue | undefined>(undefined)

export function DeliveryAddressProvider({ children }: { children: ReactNode }) {
  const { status } = useSession()
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([])
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const hasFetchedRef = useRef(false)

  const normalizeAddress = useCallback((address: any): DeliveryAddress => ({
    id: address.id ?? address._id ?? "",
    name: address.name,
    address: address.address,
    city: address.city,
    lat: typeof address.lat === "number" ? address.lat : Number(address.lat ?? 0),
    lng: typeof address.lng === "number" ? address.lng : Number(address.lng ?? 0),
    isDefault: Boolean(address.isDefault),
  }), [])

  const applyAddresses = useCallback((list: DeliveryAddress[]) => {
    setAddresses(list)
    setSelectedAddress((current) => {
      if (!list.length) {
        return null
      }

      if (current) {
        const updatedCurrent = list.find((addr) => addr.id === current.id)
        if (updatedCurrent) {
          return updatedCurrent
        }
      }

      return list.find((addr) => addr.isDefault) ?? list[0]
    })
  }, [])

  const loadAddressesFromServer = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/account/addresses")

      if (!response.ok) {
        throw new Error("Failed to load addresses")
      }

      const data = await response.json()
      const list: DeliveryAddress[] = Array.isArray(data.addresses)
        ? data.addresses.map((item: any) => normalizeAddress(item))
        : []

      applyAddresses(list)
    } catch (error) {
      console.error("Failed to fetch addresses", error)
    } finally {
      setIsLoading(false)
      hasFetchedRef.current = true
    }
  }, [applyAddresses, normalizeAddress])

  useEffect(() => {
    if (status === "authenticated" && !hasFetchedRef.current) {
      loadAddressesFromServer()
    }

    if (status === "unauthenticated") {
      hasFetchedRef.current = false
      applyAddresses(DEFAULT_ADDRESSES)
    }
  }, [status, loadAddressesFromServer, applyAddresses])

  useEffect(() => {
    if (status === "authenticated" && hasFetchedRef.current && addresses.length === 0 && !isLoading) {
      // Ensure there is at least a selected address when user has none saved
      setSelectedAddress(null)
    }
  }, [status, addresses, isLoading])

  const selectAddress = useCallback(
    (id: string) => {
      setSelectedAddress((current) => {
        const next = addresses.find((address) => address.id === id)
        return next ?? current
      })
    },
    [addresses],
  )

  const addAddress = useCallback(
    async (address: Omit<DeliveryAddress, "id"> & { id?: string; isDefault?: boolean }) => {
      const generatedId = address.id ?? (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString())
      const newAddress: DeliveryAddress = {
        ...address,
        id: generatedId,
        isDefault: address.isDefault ?? false,
      }

      if (status === "authenticated") {
        const response = await fetch("/api/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...address, id: address.id }),
        })

        if (!response.ok) {
          throw new Error("Failed to save address")
        }

        const saved = normalizeAddress(await response.json())

        setAddresses((prev) => {
          const others = saved.isDefault ? prev.map((item) => ({ ...item, isDefault: false })) : prev
          return [saved, ...others.filter((item) => item.id !== saved.id)]
        })

        setSelectedAddress(saved)
        return saved
      }

      setAddresses((prev) => {
        const others = newAddress.isDefault ? prev.map((item) => ({ ...item, isDefault: false })) : prev
        return [newAddress, ...others]
      })
      setSelectedAddress(newAddress)
      return newAddress
    },
    [status, normalizeAddress],
  )

  const updateAddress = useCallback(
    async (id: string, updates: Partial<Omit<DeliveryAddress, "id">> & { isDefault?: boolean }) => {
      if (status === "authenticated") {
        const response = await fetch(`/api/account/addresses/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        })

        if (!response.ok) {
          throw new Error("Failed to update address")
        }

        const updated = normalizeAddress(await response.json())

        setAddresses((prev) => {
          const mapped = prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
          if (updated.isDefault) {
            return mapped.map((item) => ({ ...item, isDefault: item.id === updated.id }))
          }
          return mapped
        })

        setSelectedAddress((prev) => {
          if (!prev) return updated.isDefault ? updated : prev
          if (prev.id === updated.id) return updated
          if (updated.isDefault) return updated
          return prev
        })

        return updated
      }

      let updatedLocal: DeliveryAddress | null = null

      setAddresses((prev) => {
        const mapped = prev.map((item) => {
          if (item.id === id) {
            const next = { ...item, ...updates, id }
            updatedLocal = next
            return next
          }
          return item
        })

        if (updates.isDefault) {
          return mapped.map((item) => ({ ...item, isDefault: item.id === id }))
        }

        return mapped
      })

      if (!updatedLocal) {
        throw new Error("Address not found")
      }

      setSelectedAddress((prev) => {
        if (!prev) return updatedLocal
        if (prev.id === id) return updatedLocal
        if (updates.isDefault) return updatedLocal
        return prev
      })

      return updatedLocal
    },
    [status, normalizeAddress, addresses],
  )

  const deleteAddress = useCallback(
    async (id: string) => {
      if (status === "authenticated") {
        const response = await fetch(`/api/account/addresses/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete address")
        }
      }

      setAddresses((prev) => {
        const remaining = prev.filter((item) => item.id !== id)
        setSelectedAddress((current) => {
          if (!remaining.length) {
            return null
          }

          if (!current || current.id === id) {
            return remaining.find((item) => item.isDefault) ?? remaining[0]
          }

          const stillExists = remaining.find((item) => item.id === current.id)
          if (stillExists) {
            return stillExists
          }

          return remaining.find((item) => item.isDefault) ?? remaining[0]
        })
        return remaining
      })
    },
    [status],
  )

  const setDefaultAddress = useCallback(
    async (id: string) => {
      await updateAddress(id, { isDefault: true })
    },
    [updateAddress],
  )

  const value = useMemo(
    () => ({
      addresses,
      selectedAddress,
      selectAddress,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      isLoading,
    }),
    [addresses, selectedAddress, addAddress, updateAddress, deleteAddress, setDefaultAddress, isLoading],
  )

  return <DeliveryAddressContext.Provider value={value}>{children}</DeliveryAddressContext.Provider>
}

export function useDeliveryAddress() {
  const context = useContext(DeliveryAddressContext)

  if (!context) {
    throw new Error("useDeliveryAddress must be used within a DeliveryAddressProvider")
  }

  return context
}
