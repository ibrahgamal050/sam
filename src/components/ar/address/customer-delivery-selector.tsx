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
import { extractPreferredBranchIdsFromZones, findNearestBranch, toBranchSummary } from "@/lib/branch-utils"
import type { BranchSummary } from "@/lib/branch-utils"

import CustomerMap from "./map"

type DeliveryMethod = "delivery" | "pickup"

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
  const {
    addresses,
    selectedAddress,
    addAddress,
    selectAddress,
    isLoading: addressesLoading,
    fulfillmentType,
    setFulfillmentType,
    deliveryBranch,
    setDeliveryBranch,
    pickupBranch,
    setPickupBranch,
  } = useDeliveryAddress()

  const branches = useMemo(() => restaurant?.branches ?? [], [restaurant])
  const branchSummaries = useMemo(
    () =>
      branches
        .map((branch) => toBranchSummary(branch))
        .filter(
          (summary) =>
            typeof summary.latitude === "number" && typeof summary.longitude === "number",
        ),
    [branches],
  )

  const [method, setMethod] = useState<DeliveryMethod>(fulfillmentType)

  useEffect(() => {
    setMethod(fulfillmentType)
  }, [fulfillmentType])

  const determineDeliveryBranch = useCallback(
    (lat: number, lng: number, zones: DeliveryZone[] = []) => {
      if (!branches.length || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null
      }

      const preferredIds = extractPreferredBranchIdsFromZones(zones as any)
      const preferred =
        preferredIds.size > 0
          ? findNearestBranch(branches, lat, lng, { preferredBranchIds: preferredIds })
          : null

      return preferred ?? findNearestBranch(branches, lat, lng) ?? null
    },
    [branches],
  )
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryState>(null)
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false)

  const currentAddress = selectedAddress ?? addresses[0] ?? null

  const lastKeyRef = useRef<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const checkDeliveryAvailability = useCallback(
    async (lat: number, lng: number) => {
      const key = `${restaurantId ?? "none"}:${method}:${lat.toFixed(5)}:${lng.toFixed(5)}`

      // Skip if pickup or no restaurant
      if (!restaurantId || method === "pickup") {
        setDeliveryInfo(null)
        if (method === "pickup") {
          setDeliveryBranch(null)
        }
        lastKeyRef.current = key
        return true
      }

      // No-op if nothing changed
      if (lastKeyRef.current === key) return deliveryInfo?.isAvailable ?? true
      lastKeyRef.current = key

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }

      return new Promise<boolean>((resolve) => {
        debounceRef.current = setTimeout(async () => {
          setIsCheckingDelivery(true)
          try {
            const result = await ZonesAPI.checkDelivery(restaurantId, lat, lng, { debounceMs: 0 })
            setDeliveryInfo({
              isAvailable: result.isDeliveryAvailable,
              fee: result.lowestDeliveryFee,
              zones: result.zones,
            })
            if (result.isDeliveryAvailable) {
              const assigned = determineDeliveryBranch(lat, lng, result.zones ?? [])
              setDeliveryBranch(assigned)
            } else {
              setDeliveryBranch(null)
            }
            resolve(result.isDeliveryAvailable)
          } catch (error) {
            console.error("Error checking delivery:", error)
            setDeliveryInfo({ isAvailable: false, fee: null, zones: [] })
            setDeliveryBranch(null)
            toast({
              variant: "destructive",
              title: "تعذر تحديد نطاق التوصيل",
              description: "حدث خطأ أثناء التحقق من توفر التوصيل لهذا العنوان.",
            })
            resolve(false)
          } finally {
            setIsCheckingDelivery(false)
          }
        }, 500)
        debounceRef.current.unref?.()
      })
    },
    [determineDeliveryBranch, method, restaurantId, setDeliveryBranch, toast, deliveryInfo?.isAvailable],
  )

  useEffect(() => {
    if (!selectedAddress) return
    void checkDeliveryAvailability(selectedAddress.lat, selectedAddress.lng)
  }, [selectedAddress?.id, method, checkDeliveryAvailability])

  useEffect(() => {
    setFulfillmentType(method)
    if (method === "pickup") {
      setDeliveryBranch(null)
    }
  }, [method, setDeliveryBranch, setFulfillmentType])

  const handleBranchSelect = useCallback(
    (branch: BranchSummary) => {
      setPickupBranch(branch)
      setFulfillmentType("pickup")
      toast({
        title: branch.name,
        description: [branch.address, branch.city].filter(Boolean).join(" — "),
      })
    },
    [setPickupBranch, setFulfillmentType, toast],
  )

  const handleMapLocationSelect = async (lat: number, lng: number, addressLabel?: string) => {
    const fallbackCity =
      restaurant?.branches?.find((branch) => branch.isMainBranch)?.location?.address?.ar ??
      restaurant?.name?.ar ??
      "القاهرة"

    const canDeliver = await checkDeliveryAvailability(lat, lng)
    if (!canDeliver) {
      toast({
        variant: "destructive",
        title: "خارج نطاق التوصيل",
        description: "حدد موقعًا داخل نطاق التوصيل الخاص بالمطعم قبل الحفظ.",
      })
      return
    }

   try {
  const created = await addAddress({
    name: addressLabel && addressLabel.length < 60 ? addressLabel : "موقع مخصص",
    address: addressLabel || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    city: fallbackCity,
    lat,
    lng,
    isDefault: addresses.length === 0,
  })

  // لو addAddress بترجع الـ id
  const newId = (created as any)?.id ?? (created as any)?._id
  if (newId) {
    selectAddress(newId)
  } else {
    // fallback: اعتبر آخر عنصر هو المُضاف للتو
    const last = [...addresses].pop()
    if (last?.id) selectAddress(last.id)
  }

  toast({ title: "تم حفظ عنوان جديد", description: "يمكنك متابعة طلبك بهذا الموقع الآن." })
} catch (error) {
      console.error("Failed to add address", error)
      toast({
        variant: "destructive",
        title: "تعذّر حفظ العنوان",
        description: "حدث خطأ أثناء حفظ العنوان، الرجاء المحاولة مرة أخرى.",
      })
    }
  }

  const handleConfirm = () => {
    if (method === "pickup") {
      if (!pickupBranch) {
        toast({
          variant: "destructive",
          title: "اختر فرعًا أولاً",
          description: "اضغط على أحد فروع المطعم على الخريطة لتحديده.",
        })
        return
      }
      toast({
        title: pickupBranch.name,
        description: [pickupBranch.address, pickupBranch.city].filter(Boolean).join(" — "),
      })
      onClose?.()
      return
    }

    if (!currentAddress) {
      toast({ variant: "destructive", title: "لم يتم تحديد عنوان" })
      return
    }

    if (deliveryInfo && !deliveryInfo.isAvailable) {
      toast({
        variant: "destructive",
        title: "خارج نطاق التوصيل",
        description: "اختر موقعًا داخل نطاق التوصيل لإتمام الطلب.",
      })
      return
    }

    toast({
      title: "تم اختيار عنوان التوصيل",
      description: `${currentAddress.address}${currentAddress.city ? `، ${currentAddress.city}` : ""}`,
    })
    onClose?.()
  }

  const renderAvailability = () => {
    if (method === "pickup") {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {pickupBranch ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>
                سيتم الاستلام من <span className="font-semibold text-gray-800">{pickupBranch.name}</span>
                {pickupBranch.address ? ` — ${pickupBranch.address}` : ""}
              </span>
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 text-[#6c5ce7]" />
              <span>اختر فرع الاستلام من الخريطة للتأكيد.</span>
            </>
          )}
        </div>
      )
    }

    if (isCheckingDelivery) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin className="h-4 w-4 animate-pulse" />
          <span>جارٍ التحقق من نطاق التوصيل…</span>
        </div>
      )
    }

    if (!deliveryInfo) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin className="h-4 w-4" />
          <span>حدد موقعًا على الخريطة لمعرفة توفر التوصيل.</span>
        </div>
      )
    }

    if (deliveryInfo.isAvailable) {
      return (
        <div className="flex items-center gap-3 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span>التوصيل متاح لهذا العنوان</span>
          {deliveryInfo.fee !== null && <span className="text-xs text-gray-500">رسوم تبدأ من {deliveryInfo.fee} ج.م</span>}
        </div>
      )
    }

    return (
      <div className="flex items-center gap-3 text-sm text-red-500">
        <AlertCircle className="h-4 w-4" />
        <span>خارج نطاق التوصيل، اختر موقعًا آخر.</span>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-[520px] flex-col overflow-hidden rounded-3xl bg-white" dir="rtl">
      <div className="relative flex-1">
      <CustomerMap
        restaurantId={restaurantId}
        onLocationSelect={handleMapLocationSelect}
        selectedAddress={
          selectedAddress
            ? { lat: selectedAddress.lat, lng: selectedAddress.lng, name: selectedAddress.name }
            : null
        }
        branches={branchSummaries}
        pickupMode={method === "pickup"}
        selectedBranchId={pickupBranch?.id ?? null}
        onSelectBranch={handleBranchSelect}
        className="h-[520px] w-full rounded-3xl"
      />

        <div className="pointer-events-none absolute inset-x-4 top-4 z-30 flex justify-center">
          <div className="pointer-events-auto rounded-full bg-white p-1 shadow-lg">
            <Tabs
              value={method}
              onValueChange={(value) => {
                const nextMethod = value as DeliveryMethod
                setMethod(nextMethod)
                setFulfillmentType(nextMethod)
              }}
              className="w-[240px]"
            >
              <TabsList className="grid w-full grid-cols-2 rounded-full bg-gray-100 p-1 text-[13px] font-semibold">
                <TabsTrigger
                  value="delivery"
                  className="rounded-full data-[state=active]:bg-white data-[state=active]:text-[#6c5ce7]"
                >
                  التوصيل
                </TabsTrigger>
                <TabsTrigger
                  value="pickup"
                  className="rounded-full data-[state=active]:bg-white data-[state=active]:text-[#6c5ce7]"
                >
                  الاستلام الذاتي
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-between px-4">
          <button
            type="button"
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg"
            onClick={onClose}
            aria-label="إغلاق"
          >
            <span className="text-lg text-gray-600">×</span>
          </button>
          <button
            type="button"
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg"
            onClick={() => {
              if (method === "pickup" && pickupBranch) {
                toast({
                  title: pickupBranch.name,
                  description: [pickupBranch.address, pickupBranch.city].filter(Boolean).join(" — "),
                })
              } else if (currentAddress) {
                toast({ title: currentAddress.name, description: currentAddress.address })
              }
            }}
            aria-label="تفاصيل العنوان"
          >
            <MapPin className="h-4 w-4 text-[#6c5ce7]" />
          </button>
        </div>
      </div>

      <div className="relative z-30 -mt-12 px-4 pb-4 sm:px-6">
        <div className="rounded-[28px] bg-white p-5 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6c5ce7]/10 text-[#6c5ce7]">
              <Navigation className="h-5 w-5" />
            </span>
            <div className="flex-1 text-right">
              <p className="text-sm font-semibold text-gray-900">
                {method === "pickup" ? "الرجاء اختيار فرع للاستلام" : "سنوصّل إلى هذا العنوان"}
              </p>
              {method === "pickup" ? (
                pickupBranch ? (
                  <p className="text-xs text-gray-500">
                    {[pickupBranch.address, pickupBranch.city].filter(Boolean).join("، ") || "سيتم إعلامك بتفاصيل الفرع بعد التأكيد."}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">حدد فرعًا على الخريطة أولاً.</p>
                )
              ) : currentAddress ? (
                <p className="text-xs text-gray-500">
                  {currentAddress.address}
                  {currentAddress.city ? `، ${currentAddress.city}` : ""}
                </p>
              ) : (
                <p className="text-xs text-gray-500">حدد موقعك على الخريطة أولاً.</p>
              )}
              {method === "delivery" && deliveryBranch && (
                <p className="text-[11px] text-gray-500">
                  سيتم تجهيز الطلب عبر <span className="font-semibold text-gray-800">{deliveryBranch.name}</span>
                  {deliveryBranch.address ? ` — ${deliveryBranch.address}` : ""}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            {renderAvailability()}
          </div>

          <Button
            type="button"
            className="mt-5 h-12 w-full rounded-2xl bg-[#f7c325] text-sm font-semibold text-[#1f1f1f] shadow-[0_10px_25px_-15px_rgba(247,195,37,0.8)] transition hover:bg-[#ffd342]"
            onClick={handleConfirm}
            disabled={addressesLoading}
          >
            اختيار هذا العنوان
          </Button>
        </div>
      </div>

      {restaurantLoading && (
        <div className="absolute inset-x-4 top-4 z-40 rounded-2xl border border-dashed border-gray-300 bg-white/90 px-4 py-2 text-center text-xs text-gray-500">
          جارٍ تحميل بيانات المطعم للتأكد من نطاقات التوصيل…
        </div>
      )}
    </div>
  )
} 
