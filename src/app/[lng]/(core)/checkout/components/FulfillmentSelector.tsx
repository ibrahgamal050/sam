"use client"

import type { OrderType } from "@/types/checkout"

import { SegmentedButton } from "./SegmentedButton"

interface FulfillmentSelectorProps {
  allowDelivery: boolean
  allowPickup: boolean
  activeMethod: OrderType
  labels: {
    delivery: string
    pickup: string
  }
  onSelect: (next: OrderType) => void
}

export function FulfillmentSelector({
  allowDelivery,
  allowPickup,
  activeMethod,
  labels,
  onSelect,
}: FulfillmentSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {allowDelivery && (
        <SegmentedButton
          active={activeMethod === "DELIVERY"}
          label={labels.delivery}
          onClick={() => onSelect("DELIVERY")}
        />
      )}
      {allowPickup && (
        <SegmentedButton
          active={activeMethod === "PICKUP"}
          label={labels.pickup}
          onClick={() => onSelect("PICKUP")}
        />
      )}
    </div>
  )
}
