"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
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
import { MapPin, Navigation, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

import { useDeliveryAddress, useDeliveryAddressOptional } from "@/contexts/delivery-address-context"
import { useRestaurant } from "@/contexts/restaurant-context"
import { ZonesAPI } from "@/lib/api/zones"
import type { DeliveryZone } from "@/types/delivery-zones"

import { rankBranchesForClientPoint, toBranchSummary } from "@/lib/branch-utils"
import DeliveryTab from "./DeliveryTab"
import PickupTab from "./PickupTab"
import { DeliveryAddressButton } from "./addAddress"

type DeliveryState = {
  isAvailable: boolean
  fee: number | null
  zones: DeliveryZone[]
} | null

type Props = {
  className?: string
}

export default function AddressSheet({ className }: Props) {
  const maybeContext = useDeliveryAddressOptional()
  if (!maybeContext) return null

  const { toast } = useToast()
  const { restaurant } = useRestaurant()

  const {
    addresses,
    selectedAddress,
    selectAddress,
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
  const [searchQuery] = useState("")
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false)
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryState>(null)

  const restaurantId = restaurant?._id ?? ""
  const branches = useMemo(() => restaurant?.branches ?? [], [restaurant])

  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => setTab(fulfillmentType), [fulfillmentType])

  const locale = "ru"
  const isRTL = false
  const dir = "ltr"
  const textAlign = "text-left"

  const syncFulfillmentType = useCallback(
    (value: "delivery" | "pickup") => {
      setTab(value)
      setFulfillmentType(value)
    },
    [setFulfillmentType]
  )

  const title = useMemo(() => {
    if (tab === "pickup") return pickupBranch?.name || "Выберите филиал самовывоза"
    if (!selectedAddress) return "Выберите адрес доставки"
    return selectedAddress.name
  }, [pickupBranch, selectedAddress, tab])

  const subtitle = useMemo(() => {
    if (tab === "pickup") {
      if (pickupBranch) {
        const details = [pickupBranch.address, pickupBranch.city].filter(Boolean).join(", ")
        return details || "Заказ будет готов в выбранном филиале"
      }
      return "Нажмите, чтобы выбрать"
    }
    if (!selectedAddress) return "Нажмите, чтобы выбрать"
    return `${selectedAddress.address}${selectedAddress.city ? `, ${selectedAddress.city}` : ""}`
  }, [pickupBranch, selectedAddress, tab])

  const determineDeliveryBranch = useCallback(() => {
    return branches?.[0] || null
  }, [branches])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-2 shadow-sm transition",
            "hover:border-[#6c5ce7]/40 hover:text-[#6c5ce7]",
            "w-full md:w-auto",
            textAlign,
            className
          )}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6c5ce7]/15 text-[#6c5ce7]">
            <Navigation className="h-5 w-5" />
          </span>

          <span className="flex flex-col">
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
          "md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:w-[600px]"
        )}
        dir={dir}
      >
        <SheetHeader className="pb-3">
          <div className="flex items-center justify-between">
            <SheetTitle className={cn("text-lg font-semibold text-gray-900", textAlign)}>
              Адреса
            </SheetTitle>

            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Tabs
            value={tab}
            onValueChange={(v) => syncFulfillmentType(v as "delivery" | "pickup")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-full bg-gray-100 p-1">
              <TabsTrigger value="delivery" className="rounded-full data-[state=active]:bg-white">
                Доставка
              </TabsTrigger>
              <TabsTrigger value="pickup" className="rounded-full data-[state=active]:bg-white">
                Самовывоз
              </TabsTrigger>
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
              onSelectAddress={(a) => selectAddress(a.id)}
              isCheckingDelivery={isCheckingDelivery}
              deliveryInfo={deliveryInfo}
              deliveryBranch={deliveryBranch}
            />
          ) : (
            <PickupTab
              branches={branches}
              pickupBranch={pickupBranch ? { id: pickupBranch.id } : null}
              onSelectBranch={(b) => setPickupBranch(b as unknown as typeof pickupBranch)}
            />
          )}
        </ScrollArea>

        <Separator className="my-4" />

        <SheetFooter className="grid gap-2">
          <Button
            type="button"
            className="w-full rounded-2xl bg-[#6c5ce7] text-white hover:bg-[#5a4bd1]"
            disabled={tab === "pickup" ? !pickupBranch : !selectedAddress}
            onClick={() => setOpen(false)}
          >
            Выбрать этот адрес
          </Button>
          <DeliveryAddressButton />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}