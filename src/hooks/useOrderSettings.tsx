'use client'
import { useEffect, useState } from 'react'
import type { OrderSettingsDTO, PaymentMethod } from '@/types/checkout'

export function useOrderSettings(restaurantId?: string) {
  const [settings, setSettings] = useState<OrderSettingsDTO | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!restaurantId) return
    let mounted = true
    const run = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ restaurantId })
        const res = await fetch(`/api/order-settings?${params.toString()}`, { cache: 'no-store' })
        if (!res.ok) {
          throw new Error(`Failed to load order settings: ${res.status}`)
        }
        const data = await res.json()
        const types = data?.types ?? {}
        const deliveryConfig = data?.delivery ?? {}
        const paymentConfig = data?.paymentMethods ?? {}

        const paymentMethodsFromObject = Object.entries(paymentConfig)
          .filter(([, enabled]) => Boolean(enabled))
          .map(([key]) => key.toUpperCase())
          .filter((key): key is PaymentMethod => key === 'CASH' || key === 'CARD' || key === 'ONLINE')

        const dto: OrderSettingsDTO = {
          minOrderAmount: Number(data?.minOrderAmount ?? 0),
          deliveryFeeFixed: Number(deliveryConfig?.baseFee ?? data?.deliveryFeeFixed ?? 0),
          freeDeliveryThreshold:
            deliveryConfig?.freeDeliveryAbove != null
              ? Number(deliveryConfig.freeDeliveryAbove)
              : data?.freeDeliveryThreshold != null
                ? Number(data.freeDeliveryThreshold)
                : undefined,
          defaultPreparationMinutes: Number(data?.defaultPreparationMinutes ?? 20),
          allowPickup: Boolean(types?.pickup ?? data?.allowPickup ?? true),
          allowDelivery: Boolean(types?.delivery ?? data?.allowDelivery ?? true),
          paymentMethods:
            paymentMethodsFromObject.length > 0
              ? paymentMethodsFromObject
              : Array.isArray(data?.paymentMethods) && data.paymentMethods.length > 0
                ? (data.paymentMethods as PaymentMethod[])
                : ['CASH'],
          taxRate: typeof data?.taxRate === 'number' ? data.taxRate : 0.14,
        }
        if (mounted) setSettings(dto)
      } catch {
        if (mounted)
          setSettings({
            minOrderAmount: 0,
            deliveryFeeFixed: 0,
            defaultPreparationMinutes: 20,
            allowPickup: true,
            allowDelivery: true,
            paymentMethods: ['CASH'],
            taxRate: 0.14,
          })
      } finally {
        setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [restaurantId])

  return { settings, loading }
}
