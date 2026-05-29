"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { CheckCircle2, MapPin, Navigation, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useDeliveryAddress } from "@/contexts/delivery-address-context"
import { useRestaurant } from "@/contexts/restaurant-context"
import { ZonesAPI } from "@/lib/api/zones"
import type { DeliveryZone } from "@/types/delivery-zones"

import CustomerMap from "./map"

type DeliveryMethod = "delivery" | "pickup"

type DeliveryState =
  | { isAvailable: boolean; fee: number | null; zones: DeliveryZone[] }
  | null

export default function CustomerDeliverySelector() {
  const { restaurant } = useRestaurant()
  const restaurantId = restaurant?._id ?? ""
  const { toast } = useToast()

  const {
    addresses,
    selectedAddress,
    selectAddress,
    fulfillmentType,
    setFulfillmentType,
    deliveryBranch,
    setDeliveryBranch,
    pickupBranch,
    setPickupBranch,
  } = useDeliveryAddress()

  const [method, setMethod] = useState<DeliveryMethod>(fulfillmentType)
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryState>(null)
  const [isChecking, setIsChecking] = useState(false)

  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const cacheRef = useRef(new Map<string, DeliveryState>())

  const dir = "ltr"

  useEffect(() => setMethod(fulfillmentType), [fulfillmentType])

  const checkDelivery = useCallback(
    async (lat: number, lng: number) => {
      if (!restaurantId || method === "pickup") return true

      const key = `${restaurantId}:${lat}:${lng}`

      if (cacheRef.current.has(key)) {
        const cached = cacheRef.current.get(key)!
        setDeliveryInfo(cached)
        return cached.isAvailable
      }

      if (debounceRef.current) clearTimeout(debounceRef.current)

      return new Promise<boolean>((resolve) => {
        debounceRef.current = setTimeout(async () => {
          setIsChecking(true)

          try {
            const res = await ZonesAPI.checkDelivery(restaurantId, lat, lng)

            const state: DeliveryState = {
              isAvailable: res.isDeliveryAvailable,
              fee: res.lowestDeliveryFee,
              zones: res.zones ?? [],
            }

            cacheRef.current.set(key, state)
            setDeliveryInfo(state)

            resolve(state.isAvailable)
          } catch {
            setDeliveryInfo({ isAvailable: false, fee: null, zones: [] })
            toast({
              variant: "destructive",
              title: "Ошибка доставки",
              description: "Не удалось проверить зону доставки",
            })
            resolve(false)
          } finally {
            setIsChecking(false)
          }
        }, 400)
      })
    },
    [restaurantId, method, toast]
  )

  useEffect(() => {
    if (!selectedAddress) return
    void checkDelivery(selectedAddress.lat, selectedAddress.lng)
  }, [selectedAddress?.id, method])

  return (
    <div className="relative flex flex-col bg-white" dir={dir}>
      <CustomerMap
        restaurantId={restaurantId}
        pickupMode={method === "pickup"}
        selectedAddress={
          selectedAddress
            ? { lat: selectedAddress.lat, lng: selectedAddress.lng, name: selectedAddress.name }
            : null
        }
        branches={[]}
        onLocationSelect={checkDelivery}
      />

      <div className="absolute top-4 left-4 z-30">
        <Tabs value={method} onValueChange={(v) => {
          const next = v as DeliveryMethod
          setMethod(next)
          setFulfillmentType(next)
        }}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="delivery">Доставка</TabsTrigger>
            <TabsTrigger value="pickup">Самовывоз</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4">
        {isChecking && (
          <div className="text-sm text-gray-500 flex gap-2">
            <MapPin className="animate-pulse" />
            Проверка зоны доставки…
          </div>
        )}

        {deliveryInfo?.isAvailable === false && (
          <div className="text-red-500 text-sm flex gap-2">
            <AlertCircle className="h-4 w-4" />
            Адрес вне зоны доставки
          </div>
        )}

        {deliveryInfo?.isAvailable && (
          <div className="text-green-600 text-sm flex gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Доступно для доставки
          </div>
        )}

        <Button className="w-full mt-4">
          Выбрать этот адрес
        </Button>
      </div>
    </div>
  )
}