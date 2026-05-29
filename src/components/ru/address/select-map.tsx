"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useDeliveryAddress } from "@/contexts/delivery-address-context"
import { useRestaurant } from "@/contexts/restaurant-context"
import { ZonesAPI } from "@/lib/api/zones"
import type { DeliveryZone } from "@/types/delivery-zones"
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Navigation,
  XCircle,
} from "lucide-react"

import CustomerMap from "./map"

type DeliveryState = {
  isAvailable: boolean
  fee: number | null
  zones: DeliveryZone[]
} | null

interface CustomerDeliverySelectorProps {
  showIntro?: boolean
  onClose?: () => void
}

export default function CustomerDeliverySelector({
  showIntro = true,
  onClose,
}: CustomerDeliverySelectorProps = {}) {
  const { restaurant, isLoading: restaurantLoading } = useRestaurant()
  const restaurantId = restaurant?._id ?? ""
  const { toast } = useToast()

  const {
    addresses,
    selectedAddress,
    selectAddress,
    addAddress,
    isLoading: addressesLoading,
  } = useDeliveryAddress()

  const [searchQuery, setSearchQuery] = useState("")
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryState>(null)
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false)

  const [pendingAddress, setPendingAddress] = useState<{
    lat: number
    lng: number
    name: string
    address: string
    city: string
  } | null>(null)

  const checkDeliveryAvailability = useCallback(
    async (lat: number, lng: number) => {
      try {
        if (!restaurantId) {
          return true
        }

        setIsCheckingDelivery(true)

        const result = await ZonesAPI.checkDelivery(restaurantId, lat, lng)

        setDeliveryInfo({
          isAvailable: result.isDeliveryAvailable,
          fee: result.lowestDeliveryFee ?? null,
          zones: result.zones ?? [],
        })

        return result.isDeliveryAvailable
      } catch (error) {
        console.error("Ошибка проверки доставки:", error)

        setDeliveryInfo({
          isAvailable: false,
          fee: null,
          zones: [],
        })

        toast({
          variant: "destructive",
          title: "Не удалось определить зону доставки",
          description:
            "Произошла ошибка при проверке доступности доставки для этого адреса.",
        })

        return false
      } finally {
        setIsCheckingDelivery(false)
      }
    },
    [restaurantId, toast]
  )

  useEffect(() => {
    if (!restaurantId || !selectedAddress) return
    void checkDeliveryAvailability(
      selectedAddress.lat,
      selectedAddress.lng
    )
  }, [restaurantId, selectedAddress, checkDeliveryAvailability])

  const currentAddress = pendingAddress ?? selectedAddress ?? null

  const handleAddressSelect = useCallback(
    async (addressId: string) => {
      const address = addresses.find((a) => a.id === addressId)
      if (!address) return

      const canDeliver = await checkDeliveryAvailability(
        address.lat,
        address.lng
      )

      if (!canDeliver) {
        toast({
          variant: "destructive",
          title: "Вне зоны доставки",
          description:
            "Пожалуйста, выберите адрес внутри зоны доставки ресторана.",
        })
        return
      }

      selectAddress(addressId)

      toast({
        title: "Адрес доставки обновлён",
        description: `${address.address}, ${address.city}`,
      })

      onClose?.()
    },
    [addresses, checkDeliveryAvailability, selectAddress, toast, onClose]
  )

  const handleMapLocationSelect = useCallback(
    async (
      lat: number,
      lng: number,
      addressLabel?: string
    ) => {
      const fallbackCity =
        restaurant?.branches?.find((b) => b.isMainBranch)?.location?.address
          ?.ar ??
        restaurant?.name?.ar ??
        "Москва"

      setPendingAddress({
        name:
          addressLabel && addressLabel.length < 60
            ? addressLabel
            : "Временный адрес",
        address:
          addressLabel ||
          `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        city: fallbackCity,
        lat,
        lng,
      })
    },
    [restaurant]
  )

  const renderAvailability = () => {
    if (isCheckingDelivery) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Проверка зоны доставки...</span>
        </div>
      )
    }

    if (!currentAddress) {
      return (
        <p className="text-sm text-gray-500">
          Выберите точку на карте, чтобы проверить доставку.
        </p>
      )
    }

    if (!deliveryInfo) {
      return (
        <p className="text-sm text-gray-500">
          Выберите адрес или нажмите на карту.
        </p>
      )
    }

    return (
      <div className="flex items-center gap-3">
        {deliveryInfo.isAvailable ? (
          <Badge className="bg-green-50 text-green-700">
            <CheckCircle2 className="mr-1 h-4 w-4" />
            Доставка доступна
          </Badge>
        ) : (
          <Badge className="bg-red-50 text-red-700">
            <XCircle className="mr-1 h-4 w-4" />
            Вне зоны доставки
          </Badge>
        )}

        {deliveryInfo.fee != null && deliveryInfo.isAvailable && (
          <span className="text-sm text-gray-600">
            Минимальная стоимость: {deliveryInfo.fee}
          </span>
        )}
      </div>
    )
  }

  const handleConfirm = async () => {
    if (pendingAddress) {
      try {
        const newAddress = await addAddress({
          ...pendingAddress,
          isDefault: addresses.length === 0,
        })

        if (newAddress?.id) {
          selectAddress(newAddress.id)

          toast({
            title: "Адрес сохранён",
            description: `${newAddress.address}, ${newAddress.city}`,
          })

          setPendingAddress(null)
          onClose?.()
        }
      } catch {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось сохранить адрес.",
        })
      }
      return
    }

    if (selectedAddress) {
      await handleAddressSelect(selectedAddress.id)
    }
  }

  return (
    <section className="relative bg-white py-8" dir="ltr">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative">
          <CustomerMap
            restaurantId={restaurantId}
            onLocationSelect={handleMapLocationSelect}
            selectedAddress={
              currentAddress
                ? {
                    lat: currentAddress.lat,
                    lng: currentAddress.lng,
                    name: currentAddress.name,
                  }
                : null
            }
            className="h-[350px] w-full rounded-3xl"
          />
        </div>

        <div className="mt-6 rounded-3xl bg-white p-5 shadow-xl">
          <div className="flex items-center gap-3">
            <Navigation className="h-5 w-5 text-[#6c5ce7]" />
            <div className="text-left flex-1">
              <p className="text-sm font-semibold">
                Доставка будет выполнена на этот адрес
              </p>
              <p className="text-xs text-gray-500">
                {currentAddress
                  ? `${currentAddress.address} ${currentAddress.city}`
                  : "Выберите адрес на карте"}
              </p>
            </div>
          </div>

          <div className="mt-4">{renderAvailability()}</div>

          <Button
            className="mt-5 w-full bg-yellow-400 text-black"
            onClick={handleConfirm}
            disabled={!currentAddress || isCheckingDelivery}
          >
            Подтвердить адрес
          </Button>
        </div>

        {restaurantLoading && (
          <p className="mt-4 text-center text-sm text-gray-500">
            Загрузка данных ресторана...
          </p>
        )}
      </div>
    </section>
  )
}