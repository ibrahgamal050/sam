"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Navigation, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

import { useDeliveryAddress, useDeliveryAddressOptional } from "@/contexts/delivery-address-context"
import { useRestaurant } from "@/contexts/restaurant-context"
import { ZonesAPI } from "@/lib/api/zones"
import type { DeliveryZone } from "@/types/delivery-zones"

import { rankBranchesForClientPoint, normalizeBranchId, toBranchSummary } from "@/lib/branch-utils"
import DeliveryTab from "./DeliveryTab"
import PickupTab from "./PickupTab"
import { DeliveryAddressButton } from "./addAddress"

type DeliveryState = { isAvailable: boolean; fee: number | null; zones: DeliveryZone[] } | null
type Props = { className?: string }

export default function AddressSheet({ className }: Props) {
  const maybeContext = useDeliveryAddressOptional()
  if (!maybeContext) {
    return null
  }

  const { toast } = useToast()
  const { restaurant } = useRestaurant()
  const {
    addresses,
    selectedAddress,
    selectAddress,
    addAddress,
    isLoading: addressesLoading,
    fulfillmentType,
    setFulfillmentType,
    pickupBranch,
    setPickupBranch,
    deliveryBranch,
    setDeliveryBranch,
  } = useDeliveryAddress()

  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"delivery" | "pickup">(fulfillmentType)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false)
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryState>(null)

  const restaurantId = restaurant?._id ?? ""
    useEffect(() => {
    if (restaurant) {
      console.log("✅ بيانات المطعم:", restaurant)
    } else {
      console.log("❌ لا يوجد مطعم حالياً")
    }
  }, [restaurant])
  const branches = useMemo(() => restaurant?.branches ?? [], [restaurant])

  useEffect(() => setTab(fulfillmentType), [fulfillmentType])

  const syncFulfillmentType = useCallback((value: "delivery" | "pickup") => {
    setTab(value)
    setFulfillmentType(value)
  }, [setFulfillmentType])

  const title = useMemo(() => {
    if (tab === "pickup") return pickupBranch?.name || "حدد فرع الاستلام"
    if (!selectedAddress) return "حدد عنوان التوصيل"
    return selectedAddress.name
  }, [pickupBranch, selectedAddress, tab])

  const subtitle = useMemo(() => {
    if (tab === "pickup") {
      if (pickupBranch) {
        const details = [pickupBranch.address, pickupBranch.city].filter(Boolean).join("، ")
        return details || "سيتم تجهيز الطلب من الفرع المحدد"
      }
      return "اضغط للاختيار"
    }
    if (!selectedAddress) return "اضغط للاختيار"
    return `${selectedAddress.address}${selectedAddress.city ? `، ${selectedAddress.city}` : ""}`
  }, [pickupBranch, selectedAddress, tab])

  // تحديد فرع التوصيل المناسب (الزون أولاً ثم الأقرب)
  const determineDeliveryBranch = useCallback((lat: number, lng: number, zones: DeliveryZone[] = []) => {
    if (!branches.length || !Number.isFinite(lat) || !Number.isFinite(lng)) return null
    const clientPoint = { type: "Point" as const, coordinates: [lng, lat] as [number, number] }
    const ranked = rankBranchesForClientPoint(clientPoint, zones as any, branches as any, { includeDistance: true })
    return ranked[0]?.branch ?? null
  }, [branches])

  // فحص التوصيل لعنوان معيّن
  const checkDeliveryAvailability = useCallback(async (lat: number, lng: number) => {
    if (!restaurantId) {
      setDeliveryInfo(null)
      setDeliveryBranch(null)
      return null
    }
    try {
      setIsCheckingDelivery(true)
      const result = await ZonesAPI.checkDelivery(restaurantId, lat, lng)
      setDeliveryInfo({
        isAvailable: result.isDeliveryAvailable,
        fee: result.lowestDeliveryFee,
        zones: result.zones,
      })
      if (result.isDeliveryAvailable) {
        const assigned = determineDeliveryBranch(lat, lng, result.zones ?? [])
        setDeliveryBranch(assigned ? toBranchSummary(assigned) : null)
      } else {
        setDeliveryBranch(null)
      }
      return result
    } catch {
      setDeliveryInfo({ isAvailable: false, fee: null, zones: [] })
      setDeliveryBranch(null)
      toast({ variant: "destructive", title: "تعذر تحديد نطاق التوصيل", description: "حدث خطأ أثناء التحقق من توفر التوصيل لهذا العنوان." })
      return null
    } finally {
      setIsCheckingDelivery(false)
    }
  }, [determineDeliveryBranch, restaurantId, setDeliveryBranch, toast])

  useEffect(() => {
    if (fulfillmentType === "delivery" && selectedAddress) {
      void checkDeliveryAvailability(selectedAddress.lat, selectedAddress.lng)
    }
  }, [checkDeliveryAvailability, fulfillmentType, selectedAddress?.id])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-right shadow-sm transition",
            "hover:border-[#6c5ce7]/40 hover:text-[#6c5ce7]", "w-full md:w-auto", className,
          )}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6c5ce7]/15 text-[#6c5ce7]">
            <Navigation className="h-5 w-5" />
          </span>
          <span className="flex flex-col text-right">
            <span className="text-xs font-semibold text-gray-900 sm:text-sm">{title}</span>
            <span className="text-[11px] text-gray-500 line-clamp-1 sm:text-xs">{subtitle}</span>
          </span>
          <span className="ms-auto flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <MapPin className="h-4 w-4" />
          </span>
        </button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className={cn(
          "rounded-t-3xl bg-white pb-2",
          "md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:w-[600px] md:h-auto md:shadow-xl"
        )}
        dir="rtl"
      >
        <SheetHeader className="pb-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold text-gray-900">العناوين</SheetTitle>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button>
          </div>

          <Tabs value={tab} onValueChange={(v) => syncFulfillmentType(v as "delivery" | "pickup")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-full bg-gray-100 p-1">
              <TabsTrigger value="delivery" className="rounded-full data-[state=active]:bg-white">التوصيل</TabsTrigger>
              <TabsTrigger value="pickup" className="rounded-full data-[state=active]:bg-white">الاستلام الذاتي</TabsTrigger>
            </TabsList>
          </Tabs>

          
        </SheetHeader>

        <ScrollArea className="max-h-[48vh]">
          {tab === "delivery" ? (
            <DeliveryTab
              addresses={addresses}
              addressesLoading={addressesLoading}
              selectedAddress={selectedAddress}
              searchQuery={searchQuery}
              onSelectAddress={async (a) => {
                // تحقق التوصيل أولًا
                const result = await checkDeliveryAvailability(a.lat, a.lng)
                if (!result || !result.isDeliveryAvailable) {
                  toast({ variant: "destructive", title: "خارج نطاق التوصيل", description: "اختر عنوانًا داخل نطاق التوصيل." })
                  return
                }
                selectAddress(a.id)
                syncFulfillmentType("delivery")
                setOpen(false)
              }}
              isCheckingDelivery={isCheckingDelivery}
              deliveryInfo={deliveryInfo}
              deliveryBranch={deliveryBranch}
              onEditAddress={(id) => {
                // افتح شاشة تعديلك
                toast({ title: "تعديل العنوان", description: "افتح شاشة التعديل الخاصة بك." })
              }}
            />
          ) : (
            <PickupTab
              branches={branches}
              searchQuery={searchQuery}
              pickupBranch={pickupBranch}
              onSelectBranch={(branch) => {
                const summary = toBranchSummary(branch)
                setPickupBranch(summary)
                syncFulfillmentType("pickup")
                setOpen(false)
              }}
            />
          )}
        </ScrollArea>

        {tab === "delivery" && deliveryBranch && (
          <div className="mb-4 rounded-2xl bg-[#f7f9fc] px-4 py-3 text-xs text-gray-600">
            سيتم تجهيز طلبات التوصيل من فرع
            <span className="font-semibold text-gray-900"> {deliveryBranch.name}</span>
            {deliveryBranch.address ? ` — ${deliveryBranch.address}` : ""}
          </div>
        )}

        <Separator className="my-4" />
        <SheetFooter className="grid gap-2">
          <DeliveryAddressButton />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
