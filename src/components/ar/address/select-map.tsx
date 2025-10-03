"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { useDeliveryAddress } from "@/contexts/delivery-address-context"
import { useRestaurant } from "@/contexts/restaurant-context"
import { ZonesAPI } from "@/lib/api/zones"
import type { DeliveryZone } from "@/types/delivery-zones"
import { CheckCircle2, Loader2, MapPin, Navigation, Plus, Search, XCircle } from "lucide-react"
// import { Address } from "@/components/ar/address/address" // غير مستخدم حالياً
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

export default function CustomerDeliverySelector({ showIntro = true, onClose }: CustomerDeliverySelectorProps = {}) {
  const { restaurant, isLoading: restaurantLoading } = useRestaurant()
  const restaurantId = restaurant?._id ?? ""
  const { toast } = useToast()
  const { addresses, selectedAddress, selectAddress, addAddress, isLoading: addressesLoading } = useDeliveryAddress()

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
          // ما فيش رستوران محدد: اعتبر التوصيل متاح مؤقتاً
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
        console.error("Error checking delivery:", error)
        setDeliveryInfo({ isAvailable: false, fee: null, zones: [] })
        toast({
          variant: "destructive",
          title: "تعذر تحديد نطاق التوصيل",
          description: "حدث خطأ أثناء التحقق من توفر التوصيل لهذا العنوان.",
        })
        return false
      } finally {
        setIsCheckingDelivery(false)
      }
    },
    [restaurantId, toast],
  )

  // لما يتغير العنوان المختار أو المطعم، راجع التغطية
  useEffect(() => {
    if (!restaurantId || !selectedAddress) return
    checkDeliveryAvailability(selectedAddress.lat, selectedAddress.lng)
  }, [restaurantId, selectedAddress, checkDeliveryAvailability])

  const filteredAddresses = useMemo(() => {
    if (!searchQuery.trim()) return addresses
    const query = searchQuery.trim().toLowerCase()
    return addresses.filter((address) =>
      `${address.name} ${address.address} ${address.city}`.toLowerCase().includes(query),
    )
  }, [addresses, searchQuery])

  const handleAddressSelect = useCallback(
    async (addressId: string) => {
      const address = addresses.find((item) => item.id === addressId)
      if (!address) return

      const canDeliver = await checkDeliveryAvailability(address.lat, address.lng)
      if (!canDeliver) {
        toast({
          variant: "destructive",
          title: "خارج نطاق التوصيل",
          description: "يرجى اختيار عنوان داخل نطاق التوصيل المتاح للمطعم.",
        })
        return
      }

      selectAddress(addressId)
      toast({
        title: "تم تحديث عنوان التوصيل",
        description: `${address.address}، ${address.city}`,
      })
      onClose?.()
    },
    [addresses, checkDeliveryAvailability, onClose, selectAddress, toast],
  )

 const handleMapLocationSelect = useCallback(
  async (lat: number, lng: number, addressLabel?: string) => {
    const fallbackCity =
      restaurant?.branches?.find((branch) => branch.isMainBranch)?.location?.address?.ar ??
      restaurant?.name?.ar ??
      "القاهرة"

    setPendingAddress({
      name: addressLabel && addressLabel.length < 60 ? addressLabel : "عنوان مؤقت",
      address: addressLabel || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      city: fallbackCity,
      lat,
      lng,
    })
  },
  [restaurant],
)


  // ======== إضافات كانت ناقصة ========

  // 1) currentAddress
 const currentAddress = pendingAddress ?? selectedAddress ?? null


  // 2) renderAvailability
  const renderAvailability = () => {
    if (isCheckingDelivery) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>جارٍ التحقق من توفر التوصيل…</span>
        </div>
      )
    }

    if (!currentAddress) {
      return <p className="text-sm text-gray-500">حدد موقعك على الخريطة ثم سنعرض حالة التوصيل.</p>
    }

    if (!deliveryInfo) {
      return <p className="text-sm text-gray-500">اختر عنوانًا أو اضغط على الخريطة لمعرفة التغطية.</p>
    }

    return (
      <div className="flex flex-wrap items-center gap-3">
        {deliveryInfo.isAvailable ? (
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="mr-1 h-4 w-4" />
            التوصيل متاح
          </Badge>
        ) : (
          <Badge variant="outline" className="border-rose-300 text-rose-700">
            <XCircle className="mr-1 h-4 w-4" />
            خارج نطاق التوصيل
          </Badge>
        )}

        {"fee" in deliveryInfo && deliveryInfo.fee != null && deliveryInfo.isAvailable && (
          <span className="text-sm text-gray-600">أقل رسوم توصيل: {deliveryInfo.fee} ج</span>
        )}
      </div>
    )
  }

  // 3) handleConfirm
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
          title: "تم حفظ العنوان",
          description: `${newAddress.address}، ${newAddress.city}`,
        })
        setPendingAddress(null)
        onClose?.()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "فشل الحفظ",
        description: "حصل خطأ أثناء حفظ العنوان الجديد.",
      })
    }
    return
  }

  if (selectedAddress) {
    await handleAddressSelect(selectedAddress.id)
  }
}


  // ======== ستايل السيكشن ========
  const sectionClasses = showIntro
    ? "relative overflow-hidden bg-gradient-to-b from-[#f7f5ff] via-white to-white py-12 sm:py-16"
    : "relative overflow-hidden bg-white py-6 sm:py-8"

  return (
   <section className={sectionClasses} dir="rtl">
  {showIntro && (
    <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true">
      <div className="absolute -left-12 top-20 h-48 w-48 rounded-full bg-[#6c5ce7]/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-[#ffb347]/20 blur-3xl" />
    </div>
  )}

  <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
    {/* الخريطة */}
    <div className="relative">
      <CustomerMap
        restaurantId={restaurantId}
        onLocationSelect={handleMapLocationSelect}
        selectedAddress={
          currentAddress
            ? { lat: currentAddress.lat, lng: currentAddress.lng, name: currentAddress.name }
            : null
        }
        className="h-[350px] w-full rounded-3xl"
      />

      {/* أزرار عائمة فوق الخريطة */}
      <div className="absolute inset-x-0 top-4 z-20 flex items-center justify-between px-4">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg"
          onClick={onClose}
          aria-label="إغلاق"
        >
          <span className="text-lg text-gray-600">×</span>
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg"
          onClick={() =>
            currentAddress &&
            toast({ title: currentAddress.name, description: currentAddress.address })
          }
          aria-label="تفاصيل العنوان"
        >
          <MapPin className="h-4 w-4 text-[#6c5ce7]" />
        </button>
      </div>
    </div>

    {/* بطاقة التأكيد أسفل */}
    <div className="relative mt-6 z-40 px-4 pb-4 sm:px-6">
      <div className="rounded-[28px] bg-white p-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6c5ce7]/10 text-[#6c5ce7]">
            <Navigation className="h-5 w-5" />
          </span>
          <div className="flex-1 text-right">
            <p className="text-sm font-semibold text-gray-900">سنوصّل إلى هذا العنوان</p>
            {currentAddress ? (
              <p className="text-xs text-gray-500">
                {currentAddress.address}
                {currentAddress.city ? `، ${currentAddress.city}` : ""}
              </p>
            ) : (
              <p className="text-xs text-gray-500">حدد موقعك على الخريطة أولاً.</p>
            )}
          </div>
        </div>

        <div className="mt-4">{renderAvailability()}</div>

        <Button
          type="button"
          className="mt-5 h-12 w-full rounded-2xl bg-[#f7c325] text-sm font-semibold text-[#1f1f1f] shadow-[0_10px_25px_-15px_rgba(247,195,37,0.8)] transition hover:bg-[#ffd342]"
          onClick={handleConfirm}
          disabled={addressesLoading || isCheckingDelivery || !currentAddress}
        >
          اختيار هذا العنوان
        </Button>
      </div>

      {restaurantLoading && (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white/60 p-4 text-center text-sm text-gray-500">
          جارٍ تحميل بيانات المطعم للتأكد من نطاقات التوصيل...
        </div>
      )}
    </div>
  </div>
</section>

  )
}
