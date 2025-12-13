"use client"

import { useMemo } from "react"
import type { PaymentMethod } from "@/types/checkout"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface PaymentMethodSelectorProps {
  availableMethods: PaymentMethod[]
  selectedMethod: PaymentMethod
  onSelect: (method: PaymentMethod) => void
  paymentIcons: Record<PaymentMethod, LucideIcon>
  getLabel: (method: PaymentMethod) => string
  formattedTotal?: string
}

export function PaymentMethodSelector({
  availableMethods,
  selectedMethod,
  onSelect,
  paymentIcons,
  getLabel,
  formattedTotal,
}: PaymentMethodSelectorProps) {
  const methods = useMemo(
    () => (availableMethods.length ? availableMethods : (["CASH"] as PaymentMethod[])),
    [availableMethods],
  )

  return (
    <div className="flex snap-x gap-3 overflow-x-auto pb-2">
      {methods.map((method) => (
        <PaymentChoice
          key={method}
          active={selectedMethod === method}
          label={getLabel(method)}
          icon={paymentIcons[method]}
          amount={selectedMethod === method ? formattedTotal : undefined}
          onClick={() => onSelect(method)}
        />
      ))}
    </div>
  )
}

function PaymentChoice({
  active,
  label,
  onClick,
  icon: Icon,
  amount,
}: {
  active: boolean
  label: string
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  amount?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-[140px] snap-center flex-col gap-3 rounded-2xl border px-4 py-3 text-left shadow transition",
        active
          ? "border-[#6c5ce7] bg-[#efeaff] text-gray-900"
          : "border-gray-200 bg-[#fafafa] text-gray-600 hover:border-[#d6d0ff]",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          active ? "bg-[#e4dfff] text-[#5d49d8]" : "bg-gray-200 text-gray-600",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold">{label}</p>
        {amount && <p className="text-xs text-gray-500">{amount}</p>}
      </div>
    </button>
  )
}
