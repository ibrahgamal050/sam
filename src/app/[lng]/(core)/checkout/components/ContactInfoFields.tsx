"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ContactInfoFieldsProps {
  name: string
  phone: string
  email: string
  labels: {
    name: string
    phone: string
    email: string
    phoneHelp?: string
  }
  phoneStatus: "neutral" | "success" | "error"
  onNameChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onEmailChange: (value: string) => void
}

export function ContactInfoFields({
  name,
  phone,
  email,
  labels,
  phoneStatus,
  onNameChange,
  onPhoneChange,
  onEmailChange,
}: ContactInfoFieldsProps) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      <LabeledInput
        label={labels.name}
        value={name}
        onChange={onNameChange}
        placeholder={labels.name}
      />

      <LabeledInput
        label={labels.phone}
        value={phone}
        onChange={onPhoneChange}
        placeholder={labels.phone}
        status={phoneStatus}
        helper={phoneStatus === "error" ? labels.phoneHelp : undefined}
        inputMode="tel"
      />

      <LabeledInput
        label={labels.email}
        value={email}
        onChange={onEmailChange}
        placeholder={labels.email}
        inputMode="email"
      />
    </div>
  )
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  status = "neutral",
  helper,
  inputMode,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  status?: "neutral" | "success" | "error"
  helper?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
}) {
  return (
    <label className="space-y-1 text-xs font-semibold text-gray-500">
      <span>{label}</span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className={cn(
          "h-11 rounded-2xl border bg-[#fafafa] text-sm font-medium text-gray-800 focus-visible:ring-0",
          status === "success" && "border-emerald-300 text-emerald-700",
          status === "error" && "border-red-300 text-red-600 focus-visible:border-red-400",
        )}
      />
      {helper && (
        <span className="block text-[10px] font-normal text-red-500">
          {helper}
        </span>
      )}
    </label>
  )
}
