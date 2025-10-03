"use client"

import { useCallback, useMemo, useState } from "react"
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
  onClick,
}: {
  id: string
  name: string
  address: string
  city?: string
  isMain?: boolean
  phone?: string
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
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"delivery" | "pickup">("delivery")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false)
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryState>(null)

  const { toast } = useToast()
  const { restaurant } = useRestaurant()
  const restaurantId = restaurant?._id ?? ""

  const {
    addresses,
    selectedAddress,
    selectAddress,
    addAddress,
    isLoading: addressesLoading,
  } = useDeliveryAddress()

  const title = useMemo(() => {
    if (!selectedAddress) return "حدد عنوان التوصيل"
    return selectedAddress.name
  }, [selectedAddress])

  const subtitle = useMemo(() => {
    if (!selectedAddress) return "اضغط للاختيار"
    return `${selectedAddress.address}${selectedAddress.city ? `، ${selectedAddress.city}` : ""}`
  }, [selectedAddress])
  const handlePickupSelect = (branchId: string) => {
  const b: any = branches.find((x: any) => x._id === branchId)
  if (!b) return
  toast({
    title: "تم اختيار فرع للاستلام",
    description: `${b?.name?.ar || b?.name?.en || "فرع"} — ${b?.location?.address?.ar || b?.location?.address?.en || ""}`,
  })
  setOpen(false)
  // لو عندك سياق خاص لاختيار فرع الاستلام، نادِه هنا (مثلاً: setPickupBranch(b))
}


  // فلترة سريعة زي ما في الصورة (بحث أعلى القائمة)
  const filteredAddresses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return addresses
    return addresses.filter((a) =>
      `${a.name} ${a.address} ${a.city}`.toLowerCase().includes(q),
    )
  }, [addresses, searchQuery])
// فوق جنب باقي useMemo
const branches = useMemo(() => restaurant?.branches ?? [], [restaurant])

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

  // التحقق من التوصيل (نفس منطقك لكن مختصر وآمن)
  const checkDeliveryAvailability = useCallback(
    async (lat: number, lng: number) => {
      if (!restaurantId) {
        setDeliveryInfo(null)
        return false
      }
      try {
        setIsCheckingDelivery(true)
        const result = await ZonesAPI.checkDelivery(restaurantId, lat, lng)
        setDeliveryInfo({
          isAvailable: result.isDeliveryAvailable,
          fee: result.lowestDeliveryFee,
          zones: result.zones,
        })
        return result.isDeliveryAvailable
      } catch (e) {
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

  // اختيار عنوان من القائمة
  const handleSelect = async (addressId: string) => {
    const a = addresses.find((x) => x.id === addressId)
    if (!a) return
    // في تبويب الاستلام الذاتي، مش محتاجين تحقق التوصيل
    if (tab === "delivery") {
      const ok = await checkDeliveryAvailability(a.lat, a.lng)
      if (!ok) {
        toast({
          variant: "destructive",
          title: "خارج نطاق التوصيل",
          description: "اختر عنوانًا داخل نطاق التوصيل.",
        })
        return
      }
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
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
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

        {filteredBranches.map((b: any) => (
          <BranchItem
            key={b._id}
            id={b._id}
            name={b?.name?.ar || b?.name?.en || "فرع بدون اسم"}
            address={b?.location?.address?.ar || b?.location?.address?.en || "بدون عنوان"}
            city={b?.location?.city}
            isMain={b?.isMainBranch}
            phone={b?.phone}
            onClick={() => handlePickupSelect(b._id)}
          />
        ))}
      </>
    )}
  </div>
</ScrollArea>

        <Separator className="my-4" />

        <SheetFooter className="grid gap-2">
         
          <DeliveryAddressButton/>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
