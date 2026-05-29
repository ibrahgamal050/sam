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
import { DeliveryAddressButton } from "./addAddress"
import { useToast } from "@/components/ui/use-toast"
import { useDeliveryAddress } from "@/contexts/delivery-address-context"
import { useRestaurant } from "@/contexts/restaurant-context"
import { ZonesAPI } from "@/lib/api/zones"
import type { DeliveryZone } from "@/types/delivery-zones"
import { cn } from "@/lib/utils"
import {
  extractPreferredBranchIdsFromZones,
  findNearestBranch,
  normalizeBranchId,
  toBranchSummary,
} from "@/lib/branch-utils"

import {
  Bookmark,
  CheckCircle2,
  MapPin,
  Navigation,
  Pencil,
  Plus,
  X,
} from "lucide-react"

type DeliveryState =
  | {
      isAvailable: boolean
      fee: number | null
      zones: DeliveryZone[]
    }
  | null

type Props = {
  className?: string
}

const BranchItem = ({
  name,
  address,
  city,
  isMain,
  phone,
  active,
  onClick,
}: {
  name: string
  address: string
  city?: string
  isMain?: boolean
  phone?: string
  active?: boolean
  onClick?: () => void
}) => (
  <div
    className="flex cursor-pointer items-start justify-between rounded-xl px-1 py-3 hover:bg-gray-50"
    role="button"
    onClick={onClick}
  >
    <div className="flex items-start gap-3">
      <MapPin className="mt-1 h-5 w-5 text-[#6c5ce7]" />
      <div className="text-left">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900">{name}</p>
          {isMain && <Badge className="bg-[#6c5ce7] text-white">Main branch</Badge>}
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
    fulfillmentType,
    setFulfillmentType,
    pickupBranch,
    setPickupBranch,
    deliveryBranch,
    setDeliveryBranch,
    isLoading: addressesLoading,
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

  const title =
    tab === "pickup"
      ? pickupBranch?.name ?? "Выберите филиал"
      : selectedAddress?.name ?? "Выберите адрес доставки"

  const subtitle =
    tab === "pickup"
      ? pickupBranch?.address ?? "Нажмите, чтобы выбрать филиал"
      : selectedAddress?.address ?? "Нажмите, чтобы выбрать адрес"

  const determineDeliveryBranch = useCallback(
    (lat: number, lng: number, zones: DeliveryZone[] = []) => {
      if (!branches.length) return null

      const preferredIds = extractPreferredBranchIdsFromZones(zones as any)
      const branchFromPreferred =
        preferredIds.size > 0
          ? findNearestBranch(branches, lat, lng, {
              preferredBranchIds: preferredIds,
            })
          : null

      return (
        branchFromPreferred ?? findNearestBranch(branches, lat, lng) ?? null
      )
    },
    [branches],
  )

  const handlePickupSelect = useCallback(
    (branchId: string) => {
      const branch = branches.find(
        (x: any) => normalizeBranchId(x?._id) === branchId,
      )
      if (!branch) return

      const summary = toBranchSummary(branch)
      setPickupBranch(summary)
      syncFulfillmentType("pickup")

      toast({
        title: "Branch selected",
        description: summary.name,
      })

      setOpen(false)
    },
    [branches, setPickupBranch, syncFulfillmentType, toast],
  )

  const checkDeliveryAvailability = useCallback(
    async (lat: number, lng: number) => {
      if (!restaurantId) return null

      try {
        setIsCheckingDelivery(true)
        const result = await ZonesAPI.checkDelivery(restaurantId, lat, lng)

        setDeliveryInfo({
          isAvailable: result.isDeliveryAvailable,
          fee: result.lowestDeliveryFee,
          zones: result.zones,
        })

        if (result.isDeliveryAvailable) {
          const branch = determineDeliveryBranch(
            lat,
            lng,
            result.zones ?? [],
          )
          setDeliveryBranch(branch)
        } else {
          setDeliveryBranch(null)
        }

        return result
      } finally {
        setIsCheckingDelivery(false)
      }
    },
    [restaurantId, determineDeliveryBranch, setDeliveryBranch],
  )

  const handleSelect = async (addressId: string) => {
    const a = addresses.find((x) => x.id === addressId)
    if (!a) return

    if (tab === "delivery") {
      const result = await checkDeliveryAvailability(a.lat, a.lng)
      if (!result?.isDeliveryAvailable) {
        toast({
          variant: "destructive",
          title: "Out of delivery area",
          description: "Choose another address.",
        })
        return
      }

      syncFulfillmentType("delivery")
    } else {
      syncFulfillmentType("pickup")
    }

    selectAddress(addressId)

    toast({
      title: "Address selected",
      description: a.address,
    })

    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-3 rounded-2xl border bg-white px-4 py-2 text-left",
            className,
          )}
        >
          <Navigation className="h-5 w-5 text-[#6c5ce7]" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{title}</span>
            <span className="text-xs text-gray-500">{subtitle}</span>
          </div>
        </button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="rounded-t-3xl bg-white pb-2"
        dir="ltr"
      >
        <SheetHeader>
          <SheetTitle>Delivery</SheetTitle>
        </SheetHeader>

        <Tabs
          value={tab}
          onValueChange={(v) =>
            syncFulfillmentType(v as "delivery" | "pickup")
          }
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="pickup">Pickup</TabsTrigger>
          </TabsList>
        </Tabs>

        <ScrollArea className="max-h-[50vh]">
          <div className="divide-y">
            {tab === "delivery"
              ? addresses.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => handleSelect(a.id)}
                    className="cursor-pointer p-3 hover:bg-gray-50"
                  >
                    {a.name} - {a.address}
                  </div>
                ))
              : branches.map((b: any) => {
                  const id = normalizeBranchId(b?._id)
                  return (
                    <BranchItem
                      key={id}
                      name={b?.name?.en}
                      address={b?.location?.address?.en}
                      city={b?.location?.city}
                      isMain={b?.isMainBranch}
                      phone={b?.phone}
                      onClick={() => handlePickupSelect(id)}
                    />
                  )
                })}
          </div>
        </ScrollArea>

        <SheetFooter>
          <DeliveryAddressButton />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}