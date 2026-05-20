"use client"

import { MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { OrderType } from "@/types/checkout"
import type { BranchSummary } from "@/lib/branch-utils"
type SelectedAddress = {
  name: string
  address: string
  city?: string
} | null

interface CheckoutAddressCardProps {
  deliveryMethod: OrderType
  addressLine: string
  pickupSummary: string
  selectedAddress: SelectedAddress
  pickupBranch: BranchSummary | null
  labels: {
    addressTitle: string
    addressPlaceholder: string
    editDelivery: string
    editPickup: string
    missingDelivery: string
    missingPickup: string
    branchPhoneLabel: string
  }
  localeSeparator: string
  onEditClick: (nextMode: OrderType) => void
}

export function CheckoutAddressCard({
  deliveryMethod,
  addressLine,
  pickupSummary,
  selectedAddress,
  pickupBranch,
  labels,
  localeSeparator,
  onEditClick,
}: CheckoutAddressCardProps) {
  const isDelivery = deliveryMethod === "DELIVERY"
  const editLabel = isDelivery ? labels.editDelivery : labels.editPickup
  const summaryLine = isDelivery ? addressLine || labels.addressPlaceholder : pickupSummary

  return (
    <div className="mt-5 space-y-4 rounded-2xl border border-[#dfdcff] bg-[#f6f5ff] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-900">{labels.addressTitle}</p>
          <p className="text-xs text-gray-500">{summaryLine}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-[#6c5ce7] bg-white px-4 py-1 text-xs font-semibold text-[#6c5ce7] transition hover:bg-[#f1eeff]"
          onClick={() => onEditClick(deliveryMethod)}
        >
          {editLabel}
        </Button>
      </div>

      {isDelivery ? (
        selectedAddress ? (
          <AddressDetails
            headline={selectedAddress.name}
            lines={[selectedAddress.address, selectedAddress.city]}
            localeSeparator={localeSeparator}
          />
        ) : (
          <EmptyState message={labels.missingDelivery} />
        )
      ) : pickupBranch ? (
        <AddressDetails
          headline={pickupBranch.name}
          lines={[pickupBranch.address, pickupBranch.city]}
          localeSeparator={localeSeparator}
          phone={pickupBranch.phone}
          phoneLabel={labels.branchPhoneLabel}
        />
      ) : (
        <EmptyState message={labels.missingPickup} />
      )}
    </div>
  )
}

function AddressDetails({
  headline,
  lines,
  phone,
  phoneLabel,
  localeSeparator,
}: {
  headline?: string
  lines: Array<string | null | undefined>
  phone?: string | null
  phoneLabel?: string
  localeSeparator: string
}) {
  const isCoord = (value?: string | null) => !!value && /^\s*\d+(\.\d+)?\s*,\s*\d+(\.\d+)?\s*$/.test(value)
  const cleaned = lines.filter(Boolean).filter((line, idx, arr) => {
    // drop duplicate coord strings
    if (isCoord(line) && arr.some((l, i) => i < idx && l === line)) return false
    return true
  })
  const enrichedLines = cleaned.join(localeSeparator)
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 text-xs text-gray-600">
      <div className="flex items-start gap-2">
        <MapPin className="mt-1 h-4 w-4 text-[#6c5ce7]" />
        <div className="text-right">
          <p className="font-semibold text-gray-800">{headline}</p>
          {enrichedLines && <p className="mt-1 text-gray-500">{enrichedLines}</p>}
          {phone && <p className="mt-1 text-gray-500">{phoneLabel ? `${phoneLabel}: ${phone}` : phone}</p>}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#d5cffd] bg-[#f2f0ff] p-3 text-xs text-[#5c4ed4]">
      {message}
    </div>
  )
}
