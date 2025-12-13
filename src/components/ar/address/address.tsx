"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import{DeliveryAddressButton} from"./addAddress"
import { useToast } from "@/components/ui/use-toast"
import { useDeliveryAddress } from "@/contexts/delivery-address-context"
import { useRestaurant } from "@/contexts/restaurant-context"
import { ZonesAPI } from "@/lib/api/zones"
import type { DeliveryZone } from "@/types/delivery-zones"
import { cn } from "@/lib/utils"
import { extractPreferredBranchIdsFromZones, findNearestBranch, normalizeBranchId, toBranchSummary } from "@/lib/branch-utils"

import { Bookmark, CheckCircle2, MapPin, Navigation, Pencil, Plus, X } from "lucide-react"
type DeliveryState = {
  isAvailable: boolean
  fee: number | null
  zones: DeliveryZone[]
} | null

type Props = {
  className?: string
}
const BranchItem = ({
  id,
  name,
  address,
  city,
  isMain,
  phone,
  active,
  onClick,
}: {
  id: string
  name: string
  address: string
  city?: string
  isMain?: boolean
  phone?: string
  active?: boolean
  onClick?: () => void
}) => (
  <div
    className="flex items-start justify-between px-1 py-3 hover:bg-gray-50 rounded-xl cursor-pointer"
    role="button"
    onClick={onClick}
  >
    <div className="flex items-start gap-3">
      <MapPin className="mt-1 h-5 w-5 text-[#6c5ce7]" />
      <div className="text-right">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900">{name}</p>
          {isMain && <Badge className="bg-[#6c5ce7] text-white">الفرع الرئيسي</Badge>}
          {active && <CheckCircle2 className="h-4 w-4 text-[#6c5ce7]" />}
        </div>
        <p className="text-sm text-gray-700">{address}</p>
        {(city || phone) && (
          <p className="text-xs text-gray-400">
            {city ? city : ""}{city && phone ? " • " : ""}{phone ? `☎ ${phone}` : ""}
          </p>
        )}
      </div>
    </div>
  </div>
)


export default function AddressSheet({ className }: Props) {
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

  const restaurantId = restaurant?._id ?? ""
  const branches = useMemo(() => restaurant?.branches ?? [], [restaurant])

  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"delivery" | "pickup">(fulfillmentType)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false)
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryState>(null)

  useEffect(() => {
    setTab(fulfillmentType)
  }, [fulfillmentType])

  const syncFulfillmentType = useCallback(
    (value: "delivery" | "pickup") => {
      setTab(value)
      setFulfillmentType(value)
    },
    [setFulfillmentType],
  )

  const title = useMemo(() => {
    if (tab === "pickup") {
      if (pickupBranch) return pickupBranch.name
      return "حدد فرع الاستلام"
    }
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

  const determineDeliveryBranch = useCallback(
    (lat: number, lng: number, zones: DeliveryZone[] = []) => {
      if (!branches.length || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null
      }

      const preferredIds = extractPreferredBranchIdsFromZones(zones as any)
      const branchFromPreferred =
        preferredIds.size > 0
          ? findNearestBranch(branches, lat, lng, { preferredBranchIds: preferredIds })
          : null

      return branchFromPreferred ?? findNearestBranch(branches, lat, lng) ?? null
    },
    [branches],
  )

  const filteredAddresses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return addresses
    return addresses.filter((a) => `${a.name} ${a.address} ${a.city}`.toLowerCase().includes(q))
  }, [addresses, searchQuery])

  const filteredBranches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return branches
    return branches.filter((b: any) => {
      const name = (b?.name?.ar || b?.name?.en || "").toLowerCase()
      const addr = (b?.location?.address?.ar || b?.location?.address?.en || "").toLowerCase()
      const city = (b?.location?.city || "").toLowerCase()
      return `${name} ${addr} ${city}`.includes(q)
    })
  }, [branches, searchQuery])

  const handlePickupSelect = useCallback(
    (branchId: string) => {
      const branch = branches.find((x: any) => normalizeBranchId(x?._id) === branchId)
      if (!branch) return
      const summary = toBranchSummary(branch)
      setPickupBranch(summary)
      syncFulfillmentType("pickup")
      toast({
        title: "تم اختيار فرع للاستلام",
        description: `${summary.name}${summary.address ? ` — ${summary.address}` : ""}`,
      })
      setOpen(false)
    },
    [branches, setPickupBranch, syncFulfillmentType, toast],
  )

  // التحقق من التوصيل (نفس منطقك لكن مختصر وآمن)
  const checkDeliveryAvailability = useCallback(
    async (lat: number, lng: number) => {
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
          setDeliveryBranch(assigned)
        } else {
          setDeliveryBranch(null)
        }
        return result
      } catch (e) {
        setDeliveryInfo({ isAvailable: false, fee: null, zones: [] })
        setDeliveryBranch(null)
        toast({
          variant: "destructive",
          title: "تعذر تحديد نطاق التوصيل",
          description: "حدث خطأ أثناء التحقق من توفر التوصيل لهذا العنوان.",
        })
        return null
      } finally {
        setIsCheckingDelivery(false)
      }
    },
    [determineDeliveryBranch, restaurantId, setDeliveryBranch, toast],
  )

  useEffect(() => {
    if (fulfillmentType === "delivery" && selectedAddress) {
      void checkDeliveryAvailability(selectedAddress.lat, selectedAddress.lng)
    }
  }, [checkDeliveryAvailability, fulfillmentType, selectedAddress?.id, selectedAddress?.lat, selectedAddress?.lng])

  // اختيار عنوان من القائمة
  const handleSelect = async (addressId: string) => {
    const a = addresses.find((x) => x.id === addressId)
    if (!a) return
    // في تبويب الاستلام الذاتي، مش محتاجين تحقق التوصيل
    if (tab === "delivery") {
      const result = await checkDeliveryAvailability(a.lat, a.lng)
      if (!result || !result.isDeliveryAvailable) {
        toast({
          variant: "destructive",
          title: "خارج نطاق التوصيل",
          description: "اختر عنوانًا داخل نطاق التوصيل.",
        })
        return
      }
      const branch = determineDeliveryBranch(a.lat, a.lng, result.zones ?? [])
      if (branch) {
        setDeliveryBranch(branch)
      }
      syncFulfillmentType("delivery")
    } else {
      syncFulfillmentType("pickup")
    }

    selectAddress(addressId)
    toast({ title: "تم اختيار العنوان", description: `${a.address}، ${a.city}` })
    setOpen(false)
  }

  // مكوّن عنصر العنوان (مثل لستة ياндекс/لافكا)
  const AddressItem = ({
    id,
    name,
    address,
    city,
    active,
    onEdit,
    onClick,
    isDefault,
  }: {
    id: string
    name: string
    address: string
    city: string
    active?: boolean
    onEdit?: () => void
    onClick?: () => void
    isDefault?: boolean
  }) => (
    <div
      className="flex items-center justify-between px-1"
      role="button"
      onClick={onClick}
    >
      <div className="flex items-start gap-3 py-3">
        <Bookmark className="mt-1 h-5 w-5 text-gray-400" />
        <div className="text-right">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{name}</p>
            {isDefault && (
              <Badge className="bg-[#6c5ce7] text-white">افتراضي</Badge>
            )}
            {active && <CheckCircle2 className="h-4 w-4 text-[#6c5ce7]" />}
          </div>
          <p className="text-sm text-gray-700">{address}</p>
          <p className="text-xs text-gray-400">{city}</p>
        </div>
      </div>

      <button
        type="button"
        className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        onClick={(e) => {
          e.stopPropagation()
          onEdit?.()
        }}
        aria-label="تعديل العنوان"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-right shadow-sm transition",
            "hover:border-[#6c5ce7]/40 hover:text-[#6c5ce7]",
            "w-full md:w-auto",
            className,
          )}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6c5ce7]/15 text-[#6c5ce7]">
            <Navigation  className="h-5 w-5" />
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

      <SheetContent side="bottom" className={cn(
    "rounded-t-3xl bg-white pb-2", 
    "md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:w-[600px] md:h-auto md:shadow-xl"
  )} dir="rtl">
        <SheetHeader className="pb-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold text-gray-900">
              العناوين
            </SheetTitle>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* شريط تبويب مثل (التوصيل / الاستلام الذاتي) */}
          <Tabs value={tab} onValueChange={(v) => syncFulfillmentType(v as "delivery" | "pickup")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-full bg-gray-100 p-1">
              <TabsTrigger value="delivery" className="rounded-full data-[state=active]:bg-white">
                التوصيل
              </TabsTrigger>
              <TabsTrigger value="pickup" className="rounded-full data-[state=active]:bg-white">
                الاستلام الذاتي
              </TabsTrigger>
            </TabsList>
          </Tabs>

          
        </SheetHeader>

        {/* قائمة العناوين */}
       <ScrollArea className="max-h-[48vh]">
  <div className="divide-y">
    {tab === "delivery" ? (
      // === العناوين (التوصيل) ===
      <>
        {addressesLoading && filteredAddresses.length === 0 && (
          <>
            <div className="h-16 animate-pulse bg-gray-100" />
            <div className="h-16 animate-pulse bg-gray-100" />
          </>
        )}

        {filteredAddresses.map((a) => (
          <AddressItem
            key={a.id}
            id={a.id}
            name={a.name}
            address={a.address}
            city={a.city}
            isDefault={a.isDefault}
            active={selectedAddress?.id === a.id}
            onClick={() => void handleSelect(a.id)}
            onEdit={() =>
              toast({ title: "تعديل العنوان", description: "افتح شاشة التعديل الخاصة بك." })
            }
          />
        ))}

        {filteredAddresses.length === 0 && !addressesLoading && (
          <div className="px-1 py-6 text-center text-sm text-gray-500">لا توجد عناوين مطابقة.</div>
        )}
      </>
    ) : (
      // === الفروع (الاستلام الذاتي) ===
      <>
        {(!restaurant || branches.length === 0) && (
          <div className="px-1 py-6 text-center text-sm text-gray-500">
            لا توجد فروع متاحة حالياً.
          </div>
        )}

        {filteredBranches.map((b: any) => {
          const branchId = normalizeBranchId(b?._id)
          return (
            <BranchItem
              key={branchId}
              id={branchId}
              name={b?.name?.ar || b?.name?.en || "فرع بدون اسم"}
              address={b?.location?.address?.ar || b?.location?.address?.en || "بدون عنوان"}
              city={b?.location?.city}
              isMain={b?.isMainBranch}
              phone={b?.phone}
              active={pickupBranch?.id === branchId}
              onClick={() => handlePickupSelect(branchId)}
            />
          )
        })}
        {tab === "pickup" && pickupBranch && (
          <div className="px-1 py-4 text-xs text-gray-500">
            الفرع المختار: <span className="font-semibold text-gray-700">{pickupBranch.name}</span>
            {pickupBranch.address && <span> — {pickupBranch.address}</span>}
          </div>
        )}
      </>
    )}
  </div>
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
         
          <DeliveryAddressButton/>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
