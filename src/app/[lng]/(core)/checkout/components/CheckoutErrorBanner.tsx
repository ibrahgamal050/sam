"use client"

import { AlertCircle } from "lucide-react"

interface CheckoutErrorBannerProps {
  message: string
  details?: string[]
}

export function CheckoutErrorBanner({ message, details }: CheckoutErrorBannerProps) {
  if (!message) return null

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <div className="space-y-1">
        <p>{message}</p>
        {!!details?.length && (
          <ul className="list-disc ps-4 text-[11px] text-red-500">
            {details.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
