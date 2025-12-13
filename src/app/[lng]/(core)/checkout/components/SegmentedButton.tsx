"use client"

import type { ButtonHTMLAttributes } from "react"

import { cn } from "@/lib/utils"

type SegmentedButtonProps = {
  active: boolean
  label: string
} & ButtonHTMLAttributes<HTMLButtonElement>

export function SegmentedButton({ active, label, className, ...props }: SegmentedButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-2xl border px-4 py-2 text-xs font-semibold shadow-sm transition",
        active
          ? "border-[#6c5ce7] bg-[#ece8ff] text-[#3f2fb2]"
          : "border-gray-200 bg-white text-gray-500 hover:border-[#d8d3ff]",
        className,
      )}
      {...props}
    >
      {label}
    </button>
  )
}
