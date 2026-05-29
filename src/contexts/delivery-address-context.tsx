"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useSession } from "@/lib/nextauth-shim"
import type { BranchSummary } from "@/lib/branch-utils"

export interface DeliveryAddress {
  id: string
  name: string
  address: string
  city: string
  lat: number
  lng: number
  isDefault?: boolean
  tenantKey?: string | null
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
  fulfillmentType: FulfillmentType
  setFulfillmentType: (type: FulfillmentType) => void
  pickupBranch: BranchSummary | null
  setPickupBranch: (branch: BranchSummary | null) => void
  deliveryBranch: BranchSummary | null
  setDeliveryBranch: (branch: BranchSummary | null) => void
}

type DefaultsLocale = "ar" | "en" | "ru"

const DEFAULT_ADDRESSES_BY_LOCALE: Record<DefaultsLocale, DeliveryAddress[]> = {
  ar: [
    { id: "1", name: "المنزل", address: "شارع بولشايا سادوفايا 25", city: "روستوف-نا-دونو", lat: 47.2357, lng: 39.7015, isDefault: true, tenantKey: null },
    { id: "2", name: "العمل", address: "شارع بوشكين 10", city: "روستوف-نا-دونو", lat: 47.2221, lng: 39.7187, tenantKey: null },
    { id: "3", name: "الأسرة", address: "شارع فوروبيوف 8", city: "روستوف-نا-دونو", lat: 47.2304, lng: 39.7205, tenantKey: null },
  ],

  en: [
    { id: "1", name: "Home", address: "25 Bolshaya Sadovaya St", city: "Rostov-on-Don", lat: 47.2357, lng: 39.7015, isDefault: true, tenantKey: null },
    { id: "2", name: "Work", address: "10 Pushkin St", city: "Rostov-on-Don", lat: 47.2221, lng: 39.7187, tenantKey: null },
    { id: "3", name: "Family", address: "8 Vorobyov St", city: "Rostov-on-Don", lat: 47.2304, lng: 39.7205, tenantKey: null },
  ],

  ru: [
    { id: "1", name: "Дом", address: "ул. Большая Садовая, 25", city: "Ростов-на-Дону", lat: 47.2357, lng: 39.7015, isDefault: true, tenantKey: null },
    { id: "2", name: "Работа", address: "ул. Пушкина, 10", city: "Ростов-на-Дону", lat: 47.2221, lng: 39.7187, tenantKey: null },
    { id: "3", name: "Семья", address: "ул. Воробьёва, 8", city: "Ростов-на-Дону", lat: 47.2304, lng: 39.7205, tenantKey: null },
  ],
};

const detectDefaultsLocale = (): DefaultsLocale => {
  if (typeof window === "undefined") return "ar"
  const path = window.location.pathname
  if (path.startsWith("/ru")) return "ru"
  if (path.startsWith("/en")) return "en"
  return "ar"
}

const getDefaultAddresses = (): DeliveryAddress[] => DEFAULT_ADDRESSES_BY_LOCALE[detectDefaultsLocale()]

export type FulfillmentType = "delivery" | "pickup"

const DeliveryAddressContext = createContext<DeliveryAddressContextValue | undefined>(undefined)

export const useDeliveryAddressOptional = () => useContext(DeliveryAddressContext)

export function DeliveryAddressProvider({ children }: { children: ReactNode }) {
  const { status } = useSession()
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([])
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const hasFetchedRef = useRef(false)
  const tenantKeyRef = useRef<string | null>(null)
  const [fulfillmentType, setFulfillmentTypeState] = useState<FulfillmentType>("delivery")
  const [pickupBranch, setPickupBranchState] = useState<BranchSummary | null>(null)
  const [deliveryBranch, setDeliveryBranchState] = useState<BranchSummary | null>(null)

  const getTenantKey = useCallback((): string | null => {
    if (typeof window !== "undefined") {
      const host = window.location.host.toLowerCase()
      tenantKeyRef.current = tenantKeyRef.current ?? host
    }
    return tenantKeyRef.current
  }, [])

  const normalizeAddress = useCallback((address: any): DeliveryAddress => ({
    id: address.id ?? address._id ?? "",
    name: address.name,
    address: address.address,
    city: address.city,
    lat: typeof address.lat === "number" ? address.lat : Number(address.lat ?? 0),
    lng: typeof address.lng === "number" ? address.lng : Number(address.lng ?? 0),
    isDefault: Boolean(address.isDefault),
    tenantKey: typeof address.tenantKey === "string" ? address.tenantKey : null,
  }), [])

  const applyAddresses = useCallback((list: DeliveryAddress[]) => {
    const tenantKey = getTenantKey()
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

      const tenantDefault = tenantKey
        ? list.find((addr) => addr.tenantKey === tenantKey && addr.isDefault)
        : null
      if (tenantDefault) return tenantDefault
      const anyDefault = list.find((addr) => addr.isDefault)
      if (anyDefault) return anyDefault
      const tenantAny = tenantKey ? list.find((addr) => addr.tenantKey === tenantKey) : null
      return tenantAny ?? list[0]
    })
  }, [getTenantKey])

  const loadAddressesFromServer = useCallback(async () => {
    const tenantKey = getTenantKey()
    try {
      setIsLoading(true)
      const url = new URL("/api/account/addresses", window.location.origin)
      if (tenantKey) {
        url.searchParams.set("tenantKey", tenantKey)
      }
      const response = await fetch(url.toString(), {
        credentials: 'include',
      })
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
  }, [applyAddresses, normalizeAddress, getTenantKey])

  useEffect(() => {
    if (typeof window !== "undefined" && !tenantKeyRef.current) {
      tenantKeyRef.current = window.location.host.toLowerCase()
    }

    if (status === "authenticated" && !hasFetchedRef.current) {
      loadAddressesFromServer()
    }

    if (status === "unauthenticated") {
      hasFetchedRef.current = false
      applyAddresses(getDefaultAddresses())
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

  const setFulfillmentType = useCallback((type: FulfillmentType) => {
    setFulfillmentTypeState(type)
  }, [])

  const setPickupBranch = useCallback((branch: BranchSummary | null) => {
    setPickupBranchState(branch)
  }, [])

  const setDeliveryBranch = useCallback((branch: BranchSummary | null) => {
    setDeliveryBranchState(branch)
  }, [])

  const addAddress = useCallback(
    async (address: Omit<DeliveryAddress, "id"> & { id?: string; isDefault?: boolean }) => {
      const tenantKey = getTenantKey()
      const generatedId = address.id ?? (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString())
      const newAddress: DeliveryAddress = {
        ...address,
        id: generatedId,
        isDefault: address.isDefault ?? false,
        tenantKey,
      }

      if (status === "authenticated") {
        const url = new URL("/api/account/addresses", window.location.origin)
        if (tenantKey) {
          url.searchParams.set("tenantKey", tenantKey)
        }
        const response = await fetch(url.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...address, id: address.id, tenantKey }),
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error("Failed to save address")
        }

        const saved = normalizeAddress(await response.json())

        setAddresses((prev) => {
        const others = saved.isDefault
          ? prev.map((item) => (item.tenantKey === saved.tenantKey ? { ...item, isDefault: false } : item))
          : prev
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
    [status, normalizeAddress, getTenantKey],
  )

  const updateAddress = useCallback(
    async (id: string, updates: Partial<Omit<DeliveryAddress, "id">> & { isDefault?: boolean }) => {
      const tenantKey = getTenantKey()
      if (status === "authenticated") {
        const url = new URL(`/api/account/addresses/${id}`, window.location.origin)
        if (tenantKey) {
          url.searchParams.set("tenantKey", tenantKey)
        }
        const response = await fetch(url.toString(), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...updates, tenantKey }),
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error("Failed to update address")
        }

        const updated = normalizeAddress(await response.json())

        setAddresses((prev) => {
          const mapped = prev.map((item) =>
            item.id === id ? { ...item, ...updated } : item,
          )
          if (updated.isDefault) {
            return mapped.map((item) =>
              item.tenantKey === updated.tenantKey
                ? { ...item, isDefault: item.id === updated.id }
                : item,
            )
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
          return mapped.map((item) =>
            item.tenantKey === updatedLocal?.tenantKey
              ? { ...item, isDefault: item.id === id }
              : item,
          )
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
    [status, normalizeAddress, addresses, getTenantKey],
  )

  const deleteAddress = useCallback(
    async (id: string) => {
      const tenantKey = getTenantKey()
      if (status === "authenticated") {
        const url = new URL(`/api/account/addresses/${id}`, window.location.origin)
        if (tenantKey) {
          url.searchParams.set("tenantKey", tenantKey)
        }
        const response = await fetch(url.toString(), {
          method: "DELETE",
          credentials: 'include',
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
            return (
              remaining.find((item) => item.isDefault && item.tenantKey === tenantKey) ??
              remaining.find((item) => item.isDefault) ??
              remaining[0]
            )
          }

          const stillExists = remaining.find((item) => item.id === current.id)
          if (stillExists) {
            return stillExists
          }

          return (
            remaining.find((item) => item.isDefault && item.tenantKey === tenantKey) ??
            remaining.find((item) => item.isDefault) ??
            remaining[0]
          )
        })
        return remaining
      })
    },
    [status, getTenantKey],
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
      fulfillmentType,
      setFulfillmentType,
      pickupBranch,
      setPickupBranch,
      deliveryBranch,
      setDeliveryBranch,
    }),
    [
      addresses,
      selectedAddress,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      isLoading,
      fulfillmentType,
      setFulfillmentType,
      pickupBranch,
      setPickupBranch,
      deliveryBranch,
      setDeliveryBranch,
    ],
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
