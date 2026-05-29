'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSession } from '@/lib/nextauth-shim'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'

import { Button } from '@/components/ui/button'
import { useCart, type CartExtraSelection } from '@/contexts/cart-context'
import { useRestaurant } from '@/contexts/restaurant-context'
import { useDeliveryAddress } from '@/contexts/delivery-address-context'

import type { OrderSettingsDTO, OrderType, PaymentMethod } from '@/types/checkout'
import { isObjectId, toNumber, safeJson, phoneIsValid } from '@/lib/utils/checkout'
import { useOrderSettings } from '@/hooks/useOrderSettings'
import { ContactCard, DeliveryCard, PaymentCard, SummaryCard } from '@/components/checkout-ru'
import { getLocalizedText } from '@/lib/localize'

export default function CheckoutPage() {
  const { items, clearCart } = useCart()
  const { restaurant } = useRestaurant()
  const { selectedAddress } = useDeliveryAddress()
  const router = useRouter()
  const { data: session } = useSession()

  // form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState<OrderType>('DELIVERY')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

const restaurantId = useMemo(() => {
  return restaurant?._id ? String(restaurant._id) : ""
}, [restaurant])

// Ресторан готов только когда контекст реально загрузил его id
const restaurantReady = restaurantId.length > 0

  // settings
// settings
const { settings: rawSettings } = useOrderSettings(restaurantId)

const settings = rawSettings ?? {
  allowDelivery: true,
  allowPickup: true,
  taxRate: 0.14,
  minOrderAmount: 50,
  deliveryFeeFixed: 20,
  freeDeliveryThreshold: 200,
  paymentMethods: ['CASH'],
  defaultPreparationMinutes: 20,
}

const allowDelivery = settings.allowDelivery
const allowPickup = settings.allowPickup
const taxRate = settings.taxRate


  // preload session info
  useEffect(() => {
    if (!session?.user) return
    if (!name && session.user.name) setName(session.user.name)
    if (!email && session.user.email) setEmail(session.user.email)
    if (!phone && (session.user as any).phone) setPhone((session.user as any).phone)
  }, [session, name, email, phone])

  // totals
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [items])
  const deliveryFee = useMemo(() => {
    if (deliveryMethod === 'PICKUP') return 0
    if (!settings) return 0
    if (settings.freeDeliveryThreshold && subtotal >= settings.freeDeliveryThreshold) return 0
    return settings.deliveryFeeFixed ?? 0
  }, [deliveryMethod, settings, subtotal])
  const taxes = Math.round((subtotal + deliveryFee) * taxRate)
  const total = subtotal + deliveryFee + taxes

  // derived UI
  const phoneValid = useMemo(() => phoneIsValid(phone), [phone])
  const canSubmit = useMemo(() => {
    if (!items.length) return false
    if (!settings) return false
    if (!name || !phoneValid) return false
    if (deliveryMethod === 'DELIVERY' && !address.trim()) return false
    if (subtotal < (settings.minOrderAmount ?? 0)) return false
    return true
  }, [items.length, settings, name, phoneValid, deliveryMethod, address, subtotal])
  // Подробно диагностируем недостающие данные
const missing: string[] = []

if (!items.length) missing.push('Корзина пуста')
if (!settings) missing.push('Настройки ресторана ещё не загружены')
if (!name.trim()) missing.push('Не введено имя')
if (!phoneValid) missing.push('Недействительный номер телефона')
if (deliveryMethod === 'DELIVERY' && !address.trim()) missing.push('Не введён адрес доставки')
if (subtotal < (settings?.minOrderAmount ?? 0)) missing.push('Не достигнута минимальная сумма заказа')

useEffect(() => {
  if (!missing.length) {
    console.log('%c✅ Все требования выполнены, можно оформлять', 'color: green; font-weight: bold;')
  } else {
    console.log('%c⚠️ Не хватает данных:', 'color: orange; font-weight: bold;')
    missing.forEach((m) => console.log('  -', m))
  }
}, [missing.join(','), subtotal, name, phone, address, items.length, settings])


  useEffect(() => {
    if (settings?.paymentMethods?.length) {
      setPaymentMethod(settings.paymentMethods[0])
    }
    if (settings && !settings.allowDelivery && settings.allowPickup) setDeliveryMethod('PICKUP')
  }, [settings])

  const handleProceedToPayment = async (event: React.FormEvent) => {
    event.preventDefault()
    setErrorMsg(null)
    if (isSubmitting) return

    const type: OrderType = deliveryMethod === 'PICKUP' ? 'PICKUP' : 'DELIVERY'

    if (!canSubmit) {
      setErrorMsg('Пожалуйста, заполните обязательные данные и достигните минимальной суммы заказа.')
      return
    }
    if (!restaurantReady) {
      setErrorMsg('Не удалось определить ресторан.')
      return
    }
    if (type === 'DELIVERY' && !address.trim()) {
      setErrorMsg('Пожалуйста, введите адрес доставки.')
      return
    }

    const itemsBlock = items.map((ci) => {
      const itemId = String(ci.payload?.itemId || ci.id || '')
      const qty = toNumber(ci.quantity, NaN)
      const unitPrice = toNumber(ci.unitPrice, NaN)
      const total = toNumber(unitPrice * qty, NaN)
      const rawExtras = Array.isArray(ci.payload?.extras) ? ci.payload.extras : []
      const extras = rawExtras.map((extra) => ({
        extraId: String(extra.extraId),
        qty: toNumber(extra.qty, NaN),
      }))
      return {
        itemId,
        name: ci.name || '',
        qty,
        unitPrice,
        total,
        variantId: ci.payload?.variantId,
        extras,
        note: ci.payload?.note,
        variantName: ci.variant?.name,
        extrasDetails: ci.extras,
      }
    })

    const badIds = itemsBlock.filter((i) => !isObjectId(i.itemId)).map((i) => i.itemId)
    if (badIds.length) {
      setErrorMsg('У одного из товаров недопустимый идентификатор. Пожалуйста, добавьте товары в корзину заново.')
      console.error('Invalid productIds:', badIds)
      return
    }

    const badNums = itemsBlock.filter(
      (i) =>
        !Number.isFinite(i.qty) ||
        i.qty <= 0 ||
        !Number.isFinite(i.unitPrice) ||
        !Number.isFinite(i.total) ||
        i.extras.some((extra) => !Number.isFinite(extra.qty) || extra.qty < 0),
    )
    if (badNums.length) {
      setErrorMsg('Проверьте количество и цены в корзине — есть недопустимые значения.')
      console.error('Invalid numeric items:', badNums)
      return
    }

    const safeSubtotal = itemsBlock.reduce((sum, i) => sum + i.unitPrice * i.qty, 0)
    const safeDelivery = type === 'PICKUP' ? 0 : settings?.freeDeliveryThreshold && safeSubtotal >= (settings.freeDeliveryThreshold ?? Infinity) ? 0 : settings?.deliveryFeeFixed ?? 0
    const safeTaxes = Math.round((safeSubtotal + safeDelivery) * (settings?.taxRate ?? 0.14))
    const safeTotal = safeSubtotal + safeDelivery + safeTaxes

    try {
      setIsSubmitting(true)

      const customerBlock =
        type === 'DELIVERY'
          ? {
              name,
              phone,
              address,
              email: email || undefined,
              location: selectedAddress?.lng != null && selectedAddress?.lat != null ? { type: 'Point', coordinates: [selectedAddress.lng, selectedAddress.lat] } : undefined,
            }
          : {
              name,
              phone,
              email: email || undefined,
              address: `${getLocalizedText(restaurant?.name, 'Ресторан')} — самовывоз из филиала`,
            }
            const branchId =
  restaurant?.defaultBranchId ??
  (settings as any)?.defaultBranchId ??
  undefined
const orderItems = itemsBlock.map((item) => {
  const extrasDetails: CartExtraSelection[] = Array.isArray(item.extrasDetails)
    ? (item.extrasDetails as CartExtraSelection[])
    : []

  return {
    itemId: item.itemId,
    productId: item.itemId,
    name: item.name,
    qty: item.qty,
    unitPrice: item.unitPrice,
    variantId: item.variantId,
    variantName: item.variantName,
    extras: item.extras,
    extrasDetails: extrasDetails.map((extra) => ({
      id: extra.id,
      name: extra.name,
      price: extra.price,
      qty: extra.qty,
      groupId: extra.groupId,
      groupName: extra.groupName,
    })),
    note: item.note,
  }
})

const payload = {
  restaurantId,
  type,
  pm: paymentMethod as 'CASH' | 'CARD' | 'ONLINE',
  addrLine: type === 'DELIVERY' ? address.trim() : '',
  items: orderItems,
  payment: { method: paymentMethod as 'CASH' | 'CARD' | 'ONLINE' },

  // Адрес и геолокация внутри customer в зависимости от типа заказа
  customer:
    type === 'DELIVERY'
      ? {
          name: name || 'Guest',
          phone: phone || 'N/A',
          email: email || undefined,
          address: address.trim(), // одна строка текста
          location:
            selectedAddress?.lng != null && selectedAddress?.lat != null
              ? {
                  type: 'Point',
                  coordinates: [
                    Number(selectedAddress.lng), // сначала lng
                    Number(selectedAddress.lat), // затем lat
                  ],
                }
              : undefined,
        }
      : {
          name,
          phone,
          email: email || undefined,
          address: `${getLocalizedText(restaurant?.name, 'Ресторан')} — самовывоз из филиала`,
        },
}
console.log('[orders] outgoing payload', payload, JSON.stringify(payload).length)


      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': uuidv4() },
        body: JSON.stringify(payload),
         credentials: 'include'
      })

      const body = await safeJson(res)
      if (!res.ok) {
        const apiError = (body as any)?.error
        const code = typeof apiError?.code === 'string' ? apiError.code : (body as any)?.code
        if (code === 'ITEM_NOT_FOUND' || code === 'INVALID_ITEM_ID') {
          clearCart?.()
          throw new Error('Меню обновлено, и некоторые товары в корзине больше недоступны. Корзина очищена, добавьте товары заново.')
        }

        const msg =
          (typeof apiError?.message === 'string' && apiError.message) ||
          (typeof (body as any)?.message === 'string' && (body as any).message) ||
          (typeof (body as any)?.error === 'string' && (body as any).error) ||
          'Произошла ошибка при создании заказа.'
        throw new Error(String(msg))
      }

      const created: any = body
      const createdId = created?.data?._id || created?._id || created?.id

      if (paymentMethod === 'CASH' || paymentMethod === 'CARD') {
        clearCart?.()
        router.push(`/ru/orders/${createdId}`)
      } else {
        if (created?.payment?.initUrl) {
          clearCart?.()
          window.location.href = created.payment.initUrl
          return
        }
        const params = new URLSearchParams({ orderId: String(createdId), method: paymentMethod, amount: String(safeTotal), name })
        clearCart?.()
        router.push(`/ru/payment?${params.toString()}`)
      }
    } catch (error: any) {
      console.error('Failed to create order', error)
      setErrorMsg(error?.message || 'Произошла ошибка при создании заказа. Пожалуйста, попробуйте ещё раз.')
    } finally {
      setIsSubmitting(false)
    }
  }
  const canSubmitFinal = canSubmit && restaurantReady


  return (
    <main className="min-h-screen bg-gray-50" dir="ltr">
      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <header className="space-y-3 text-left">
          <h1 className="text-3xl font-bold text-gray-900">Детали заказа и оплата</h1>
        </header>

        {items.length === 0 ? (
          <section className="mt-10 rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-600">
            Ваша корзина сейчас пуста.{' '}
            <Link href="/ru/menu" className="font-semibold text-[#6c5ce7] hover:text-[#5a4bd1]">Перейти в меню</Link>{' '} чтобы добавить любимые блюда.
          </section>
        ) : (
          <form onSubmit={handleProceedToPayment} className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              {/* Contact */}
              <ContactCard name={name} setName={setName} phone={phone} setPhone={setPhone} email={email} setEmail={setEmail} phoneValid={phoneValid} />

              {/* Delivery */}
              <DeliveryCard deliveryMethod={deliveryMethod} setDeliveryMethod={setDeliveryMethod} address={address} setAddress={setAddress} notes={notes} setNotes={setNotes} allowDelivery={allowDelivery} allowPickup={allowPickup} defaultPreparationMinutes={settings?.defaultPreparationMinutes ?? 20} selectedAddress={selectedAddress as any} />

              {/* Payment */}
              <PaymentCard available={settings?.paymentMethods ?? ['CASH']} value={paymentMethod} onChange={setPaymentMethod} />
            </div>

            {/* Summary */}
            <SummaryCard subtotal={subtotal}
            taxes={taxes}
            deliveryFee={deliveryFee}
            total={total}
            taxRate={taxRate}
            minOrderAmount={settings?.minOrderAmount ?? 0}
            freeDeliveryThreshold={settings?.freeDeliveryThreshold}
            deliveryMethod={deliveryMethod}
            isSubmitting={isSubmitting}
            canSubmit={canSubmitFinal}
            errorMsg={errorMsg} />
          </form>
        )}
      </section>
    </main>
  )
}
