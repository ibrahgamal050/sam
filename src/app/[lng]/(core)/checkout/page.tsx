'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import {
  ArrowLeft,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  CreditCard,
  Wallet,
  Smartphone,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useCart, type CartExtraSelection } from '@/contexts/cart-context'
import { useRestaurant } from '@/contexts/restaurant-context'
import { useDeliveryAddress } from '@/contexts/delivery-address-context'
import { useSession } from '@/lib/nextauth-shim'
import { useOrderSettings } from '@/hooks/useOrderSettings'
import CustomerDeliverySelector from '@/components/ar/address/AddressSheet'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { FulfillmentSelector } from './components/FulfillmentSelector'
import { CheckoutAddressCard } from './components/CheckoutAddressCard'
import { ContactInfoFields } from './components/ContactInfoFields'
import { PaymentMethodSelector } from './components/PaymentMethodSelector'
import { CheckoutErrorBanner } from './components/CheckoutErrorBanner'
import { ZonesAPI } from '@/lib/api/zones'

import type { OrderSettingsDTO, OrderType, PaymentMethod } from '@/types/checkout'
import { isObjectId, toNumber, safeJson, phoneIsValid } from '@/lib/utils/checkout'

const STRINGS = {
  ar: {
    back: 'رجوع',
    title: 'العنوان والدفع',
    subtitle: 'راجع تفاصيل التوصيل وأكمل عملية الدفع',
    deliveryTab: 'توصيل',
    pickupTab: 'استلام',
    addressLabel: 'مكان التوصيل',
    addressPlaceholder: 'مثال: شارع النصر، عمارة 12',
    apartmentPlaceholder: 'شقة',
    entrancePlaceholder: 'مدخل',
    floorPlaceholder: 'الدور',
    intercomPlaceholder: 'الرمز',
    courierNote: 'ملاحظات للمندوب',
    courierNotePlaceholder: 'أضف تعليمات إضافية للتوصيل',
    leaveAtDoor: 'اترك الطلب عند الباب',
    leaveAtDoorHint: 'لن يتم طرق الجرس',
    callIfIssue: 'الاتصال عند وجود مشكلة',
    callIfIssueHint: 'سيتواصل المندوب إن لم يجدك',
    paymentTitle: 'طرق الدفع',
    promoTitle: 'العروض والدفعات',
    promoHint: 'اليوم 0 رس للتقسيط',
    promoSubHint: 'بدون مصاريف إضافية',
    promoToggle: 'تفعيل',
    codesTitle: 'رموز الخصم',
    codesHint: 'لديك 2 كوبون متاح',
    tipsTitle: 'إكرامية المندوب',
    summaryTime: (min: number, max: number) => `${min}-${max} دقيقة`,
    payButton: 'ادفع الآن',
    payButtonProcessing: 'جارٍ الإرسال...',
    emptyCartTitle: 'سلتك فارغة',
    emptyCartHint: 'أضف بعض الأصناف من المنيو قبل إتمام الطلب.',
    browseMenu: 'تصفّح المنيو',
    cardCash: 'دفع نقدي',
    cardCard: 'بطاقة',
    cardOnline: 'دفع إلكتروني',
    nameLabel: 'الاسم',
    phoneLabel: 'رقم الهاتف',
    emailLabel: 'البريد الإلكتروني',
    pickupAddress: 'استلام من الفرع',
    validationError: 'يُرجى استكمال البيانات المطلوبة واستيفاء الحد الأدنى.',
    restaurantMissing: 'تعذّر تحديد المطعم.',
    addressMissing: 'يُرجى إدخال عنوان التوصيل.',
    errorSubmitting: 'حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.',
  },
  en: {
    back: 'Back',
    title: 'Address & Payment',
    subtitle: 'Review delivery details and complete payment',
    deliveryTab: 'Delivery',
    pickupTab: 'Pickup',
    addressLabel: 'Delivery address',
    addressPlaceholder: 'e.g. 12 Victory St, Building 4',
    apartmentPlaceholder: 'Apartment',
    entrancePlaceholder: 'Entrance',
    floorPlaceholder: 'Floor',
    intercomPlaceholder: 'Code',
    courierNote: 'Courier notes',
    courierNotePlaceholder: 'Add any instructions for the courier',
    leaveAtDoor: 'Leave at the door',
    leaveAtDoorHint: 'Courier will not ring the bell',
    callIfIssue: 'Call if something is missing',
    callIfIssueHint: 'Courier will contact you on arrival',
    paymentTitle: 'Payment methods',
    promoTitle: 'Promotions & split payments',
    promoHint: 'Today 0 EGP in Split',
    promoSubHint: 'No extra fees',
    promoToggle: 'Enable',
    codesTitle: 'Promo codes',
    codesHint: 'You have 2 active codes',
    tipsTitle: 'Courier tip',
    summaryTime: (min: number, max: number) => `${min}-${max} min`,
    payButton: 'Pay now',
    payButtonProcessing: 'Processing...',
    emptyCartTitle: 'Your cart is empty',
    emptyCartHint: 'Add some items from the menu before checking out.',
    browseMenu: 'Browse menu',
    cardCash: 'Cash',
    cardCard: 'Card',
    cardOnline: 'Online',
    nameLabel: 'Full name',
    phoneLabel: 'Phone number',
    emailLabel: 'Email',
    pickupAddress: 'Pickup from branch',
    validationError: 'Please complete the required fields and meet the minimum order.',
    restaurantMissing: 'Unable to detect restaurant.',
    addressMissing: 'Please enter a delivery address.',
    errorSubmitting: 'Something went wrong while creating the order. Please try again.',
  },
}

const isLikelyCoordinates = (value?: string | null) => {
  if (!value) return false
  const parts = value.split(",").map((p) => Number(p.trim()))
  if (parts.length !== 2) return false
  return parts.every((n) => Number.isFinite(n))
}

const PAYMENT_ICONS: Record<PaymentMethod, React.ComponentType<{ className?: string }>> = {
  CASH: Wallet,
  CARD: CreditCard,
  ONLINE: Smartphone,
}

const VALIDATION_MESSAGES: Record<
  string,
  {
    ar: string
    en: string
  }
> = {
  "cart-empty": {
    ar: "سلة التسوق فارغة",
    en: "Your cart is empty",
  },
  "settings-missing": {
    ar: "تعذّر تحميل إعدادات المتجر",
    en: "Restaurant settings are unavailable",
  },
  "name-missing": {
    ar: "يرجى إدخال الاسم",
    en: "Please enter your name",
  },
  "phone-invalid": {
    ar: "رقم الهاتف غير صالح",
    en: "Phone number looks invalid",
  },
  "delivery-address-missing": {
    ar: "اختر عنوان التوصيل قبل المتابعة",
    en: "Select a delivery address before continuing",
  },
  "pickup-branch-missing": {
    ar: "اختر فرعًا للاستلام",
    en: "Select a pickup branch",
  },
  "min-order": {
    ar: "قيمة الطلب أقل من الحد الأدنى المسموح",
    en: "Order total is below the minimum amount",
  },
  "restaurant-missing": {
    ar: "تعذّر تحديد المطعم. يرجى تحديث الصفحة أو المحاولة لاحقاً",
    en: "Restaurant could not be resolved. Please refresh and try again",
  },
}

type Locale = keyof typeof STRINGS

const normalizeNumber = (value: unknown, fallback = 0): number => {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value.replace(/[^\d.-]/g, ''))
        : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const formatCurrency = (amount: number, locale: Locale, currency = 'EGP') => {
  const safeAmount = Number.isFinite(amount) ? amount : 0
  try {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(safeAmount)
  } catch {
    return `${safeAmount.toFixed(0)} ${currency}`
  }
}

export default function CheckoutPage() {
  const params = useParams()
  const locale = (Array.isArray(params?.lng) ? params?.lng[0] : params?.lng) as Locale | undefined
  const currentLocale: Locale = locale && locale in STRINGS ? locale : 'ar'
  const t = STRINGS[currentLocale]
  const direction = currentLocale === 'ar' ? 'rtl' : 'ltr'

  const router = useRouter()
  const pathname = usePathname()
  const { items, clearCart } = useCart()
  const { restaurant } = useRestaurant()
  const {
    selectedAddress,
    fulfillmentType,
    setFulfillmentType,
    pickupBranch,
  } = useDeliveryAddress()
  const { data: session, status: sessionStatus } = useSession()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [profileLoaded, setProfileLoaded] = useState(false)
  const deliveryMethod: OrderType = fulfillmentType === 'pickup' ? 'PICKUP' : 'DELIVERY'
  const setDeliveryMethod = useCallback(
    (method: OrderType) => {
      setFulfillmentType(method === 'PICKUP' ? 'pickup' : 'delivery')
    },
    [setFulfillmentType],
  )
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [leaveAtDoor, setLeaveAtDoor] = useState(false)
  const [callIfMissing, setCallIfMissing] = useState(true)
  const [promoEnabled, setPromoEnabled] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [addressSheetOpen, setAddressSheetOpen] = useState(false)

  const restaurantId = useMemo(() => {
    return restaurant?._id ? String(restaurant._id) : null
  }, [restaurant])

  const restaurantReady = Boolean(restaurantId)
  const currency = (restaurant as any)?.currency ?? 'EGP'

  const { settings: rawSettings } = useOrderSettings(restaurantId ?? undefined)
  const settings: OrderSettingsDTO = rawSettings ?? {
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
  const taxRate = settings.taxRate ?? 0.14

  useEffect(() => {
    if (!session?.user) return
    if (!name && session.user.name) setName(session.user.name)
    if (!email && session.user.email) setEmail(session.user.email)
    if (!phone && (session.user as any).phone) setPhone((session.user as any).phone)
  }, [session, name, email, phone])

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      setProfileLoaded(false)
    }
  }, [sessionStatus])

  const phoneValid = useMemo(() => phoneIsValid(phone), [phone])

  useEffect(() => {
    if (sessionStatus !== 'authenticated' || profileLoaded) return
    let cancelled = false

    const loadProfile = async () => {
      try {
        const res = await fetch('/api/account/profile', {
          cache: 'no-store',
          credentials: 'include',
        })
        if (!res.ok) {
          return
        }

        const profile = await res.json().catch(() => null)
        if (!profile || cancelled) return

        if (!name && profile.name) {
          setName(profile.name)
        }
        if (!email && profile.email) {
          setEmail(profile.email)
        }
        if ((!phone || !phoneValid) && profile.phone) {
          setPhone(String(profile.phone))
        }
      } catch (error) {
        console.warn('[checkout] failed to load user profile:', error)
      } finally {
        if (!cancelled) {
          setProfileLoaded(true)
        }
      }
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [sessionStatus, profileLoaded, name, email, phone, phoneValid])

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      const callback = encodeURIComponent(pathname ?? '/')
      router.replace(`/auth/signin?callbackUrl=${callback}`)
    }
  }, [sessionStatus, router, currentLocale, pathname])

  useEffect(() => {
    if (settings?.paymentMethods?.length) {
      setPaymentMethod(settings.paymentMethods[0] as PaymentMethod)
    }
    if (settings && !settings.allowDelivery && settings.allowPickup) setDeliveryMethod('PICKUP')
  }, [settings, setDeliveryMethod])

  const addressLine = useMemo(() => {
    if (!selectedAddress) return ''
    const addr = selectedAddress.address
    const safeAddress = isLikelyCoordinates(addr) ? selectedAddress.city || selectedAddress.name : addr
    return [selectedAddress.name, safeAddress, selectedAddress.city].filter(Boolean).join(', ')
  }, [selectedAddress])

  const localeSeparator = currentLocale === 'ar' ? '، ' : ', '

  const pickupSummary = useMemo(() => {
    if (!pickupBranch) return t.pickupAddress
    const headline = pickupBranch.name || t.pickupAddress
    const details = [pickupBranch.address, pickupBranch.city].filter(Boolean).join(localeSeparator)
    return [headline, details].filter(Boolean).join(' — ')
  }, [pickupBranch, t.pickupAddress, localeSeparator])

  const fulfillmentLabels = useMemo(
    () => ({
      delivery: t.deliveryTab,
      pickup: t.pickupTab,
    }),
    [t.deliveryTab, t.pickupTab],
  )

  const addressCardLabels = useMemo(
    () => ({
      addressTitle: t.addressLabel,
      addressPlaceholder: t.addressPlaceholder,
      editDelivery: currentLocale === 'ar' ? 'تغيير العنوان' : 'Change address',
      editPickup: currentLocale === 'ar' ? 'تغيير الفرع' : 'Change branch',
      missingDelivery:
        currentLocale === 'ar'
          ? 'لم يتم اختيار عنوان بعد. يمكنك إضافة عنوانك من صفحة العناوين.'
          : 'No delivery address selected yet. Add one from the addresses page.',
      missingPickup:
        currentLocale === 'ar'
          ? 'لم يتم اختيار فرع للاستلام بعد. استخدم زر تغيير الفرع لاختيار الموقع المناسب.'
          : 'No pickup branch selected yet. Use the change branch button to pick one.',
      branchPhoneLabel: currentLocale === 'ar' ? 'هاتف الفرع' : 'Branch phone',
    }),
    [t.addressLabel, t.addressPlaceholder, t.pickupAddress, currentLocale],
  )

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const unitPrice = normalizeNumber((item as any).unitPrice ?? item.price)
        const qty = normalizeNumber(item.quantity, 0)
        return sum + unitPrice * qty
      }, 0),
    [items],
  )

  const deliveryFee = useMemo(() => {
    if (deliveryMethod === 'PICKUP') return 0
    if (!settings) return 0
    const fee = normalizeNumber(settings.deliveryFeeFixed)
    const threshold = settings.freeDeliveryThreshold != null ? normalizeNumber(settings.freeDeliveryThreshold, Infinity) : Infinity
    if (subtotal >= threshold) return 0
    return fee
  }, [deliveryMethod, settings, subtotal])

  const taxes = useMemo(() => {
    const base = (subtotal + deliveryFee) * taxRate
    return Math.round(Number.isFinite(base) ? base : 0)
  }, [subtotal, deliveryFee, taxRate])

  const total = subtotal + deliveryFee + taxes
  const formattedTotal = useMemo(
    () => formatCurrency(total, currentLocale, currency),
    [total, currentLocale, currency],
  )

  const fullAddress = useMemo(() => {
    if (deliveryMethod === 'PICKUP') {
      return pickupSummary
    }
    return addressLine
  }, [deliveryMethod, addressLine, pickupSummary])

  const openAddressSelector = useCallback(
    (mode: OrderType) => {
      setDeliveryMethod(mode)
      setAddressSheetOpen(true)
    },
    [setDeliveryMethod],
  )

  const validationIssues = useMemo(() => {
    const issues: string[] = []
    if (!restaurantId) issues.push("restaurant-missing")
    if (!items.length) issues.push("cart-empty")
    if (!name.trim()) issues.push("name-missing")
    if (!phoneValid) issues.push("phone-invalid")
    if (deliveryMethod === "DELIVERY" && !selectedAddress) issues.push("delivery-address-missing")
    if (deliveryMethod === "PICKUP" && !pickupBranch) issues.push("pickup-branch-missing")
    if (subtotal < (settings?.minOrderAmount ?? 0)) issues.push("min-order")
    return issues
  }, [restaurantId, items.length, name, phoneValid, deliveryMethod, selectedAddress, pickupBranch, subtotal, settings?.minOrderAmount])

  const canSubmit = validationIssues.length === 0

  const localizedValidationIssues = useMemo(
    () =>
      validationIssues.map(
        (code) => VALIDATION_MESSAGES[code]?.[currentLocale] ?? code,
      ),
    [validationIssues, currentLocale],
  )

  useEffect(() => {
    if (!validationIssues.length) return
    console.warn("[checkout] Missing data:", validationIssues)
  }, [validationIssues.join("|")])

  useEffect(() => {
    if (errorMsg === t.validationError && canSubmit) {
      setErrorMsg(null)
    }
  }, [errorMsg, canSubmit, t.validationError])

  const handleProceedToPayment = async (event: React.FormEvent) => {
    event.preventDefault()
    setErrorMsg(null)
    if (isSubmitting) return

    const type: OrderType = deliveryMethod === 'PICKUP' ? 'PICKUP' : 'DELIVERY'

    if (!canSubmit) {
      setErrorMsg(t.validationError)
      return
    }
    if (!restaurantReady) {
      setErrorMsg(t.restaurantMissing)
      return
    }
    if (!restaurantId) {
      setErrorMsg(t.restaurantMissing)
      return
    }
    if (type === 'DELIVERY' && !selectedAddress) {
      setErrorMsg(t.addressMissing)
      return
    }

    const itemsBlock = items.map((ci) => {
      const itemId = String(ci.payload?.itemId || ci.id || "")
      const qty = toNumber(ci.quantity, NaN)
      const unitPrice = toNumber(ci.unitPrice, NaN)
      const lineTotal = toNumber(unitPrice * qty, NaN)
      const rawExtras = Array.isArray(ci.payload?.extras) ? ci.payload.extras : []
      const extras = rawExtras.map((extra) => ({
        extraId: String(extra.extraId),
        qty: toNumber(extra.qty, NaN),
      }))

      return {
        itemId,
        name: ci.name || "",
        qty,
        unitPrice,
        total: lineTotal,
        variantId: ci.payload?.variantId,
        extras,
        note: ci.payload?.note,
        variantName: ci.variant?.name,
        extrasDetails: ci.extras,
      }
    })

    const badIds = itemsBlock.filter((i) => !isObjectId(i.itemId)).map((i) => i.itemId)
    if (badIds.length) {
      setErrorMsg('Product identifiers are invalid. Please re-add your items.')
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
      setErrorMsg('Quantities or prices look incorrect. Please review your cart.')
      console.error('Invalid numeric items:', badNums)
      return
    }

    const safeSubtotal = itemsBlock.reduce((sum, i) => sum + i.unitPrice * i.qty, 0)
    const safeDelivery =
      type === 'PICKUP'
        ? 0
        : settings?.freeDeliveryThreshold && safeSubtotal >= (settings.freeDeliveryThreshold ?? Infinity)
          ? 0
          : settings?.deliveryFeeFixed ?? 0
    const safeTaxes = Math.round((safeSubtotal + safeDelivery) * (settings?.taxRate ?? 0.14))
    const safeTotal = safeSubtotal + safeDelivery + safeTaxes

    try {
      setIsSubmitting(true)

      let deliveryZoneId: string | undefined
      let deliveryLocation: { lat: number; lng: number } | undefined
      let effectiveDeliveryFee = safeDelivery
      let effectiveTaxes = safeTaxes
      let effectiveTotal = safeTotal

      if (type === 'DELIVERY' && selectedAddress) {
        const lat = normalizeNumber((selectedAddress as any).lat, NaN)
        const lng = normalizeNumber((selectedAddress as any).lng, NaN)
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          deliveryLocation = { lat, lng }
          try {
            const zoneResult = await ZonesAPI.checkDelivery(restaurantId, lat, lng)
            if (!zoneResult.isDeliveryAvailable) {
              throw new Error(currentLocale === 'ar' ? 'العنوان خارج نطاق التوصيل' : 'Address is outside delivery zones')
            }
            deliveryZoneId = zoneResult.zones?.[0]?.id
            if (typeof zoneResult.lowestDeliveryFee === 'number') {
              effectiveDeliveryFee = zoneResult.lowestDeliveryFee
              effectiveTaxes = Math.round((safeSubtotal + effectiveDeliveryFee) * (settings?.taxRate ?? 0.14))
              effectiveTotal = safeSubtotal + effectiveDeliveryFee + effectiveTaxes
            }
          } catch (zoneError: any) {
            setErrorMsg(zoneError?.message ?? (currentLocale === 'ar' ? 'العنوان خارج نطاق التوصيل' : 'Address is outside delivery zones'))
            return
          }
        }
      }

      const customerBlock =
        type === 'DELIVERY'
          ? {
              name: name || 'Guest',
              phone: phone || 'N/A',
              email: email || undefined,
              address: fullAddress,
              location: deliveryLocation
                ? {
                    type: 'Point' as const,
                    coordinates: [deliveryLocation.lng, deliveryLocation.lat],
                  }
                : undefined,
              notes: notes || undefined,
              leaveAtDoor,
              callIfMissing,
            }
          : {
              name,
              phone,
              email: email || undefined,
              address:
                pickupSummary ||
                `${restaurant?.name?.ar ?? restaurant?.name?.en ?? 'Restaurant'} - ${t.pickupAddress}`,
              notes: notes || undefined,
            }

    const orderItems = itemsBlock.map((item) => ({
  productId: item.itemId,
  name: item.name,
  qty: item.qty,
}))
      const payload = {
        restaurantId: restaurantId as string,
        type,
        items: orderItems,
        payment: { method: paymentMethod },
        totals: {
          subtotal: safeSubtotal,
          delivery: effectiveDeliveryFee,
          taxes: effectiveTaxes,
          total: effectiveTotal,
        },
        customer: customerBlock,
      }

      if (deliveryLocation) {
        ;(payload as any).deliveryLocation = deliveryLocation
      }
      if (deliveryZoneId) {
        ;(payload as any).deliveryZoneId = deliveryZoneId
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': uuidv4() },
        body: JSON.stringify(payload),
        credentials: 'include',
      })

      const body = await safeJson(res)
      if (!res.ok) {
        const apiError = (body as any)?.error
        const code = typeof apiError?.code === 'string' ? apiError.code : (body as any)?.code
        if (code === 'ITEM_NOT_FOUND' || code === 'INVALID_ITEM_ID') {
          clearCart?.()
          throw new Error(
            currentLocale === 'ar'
              ? 'تم تحديث المنيو وبعض الأصناف في السلة لم تعد متاحة. تم تفريغ السلة، يرجى إضافة الأصناف مرة أخرى.'
              : 'The menu was updated and some cart items are no longer available. Your cart was cleared; please add the items again.',
          )
        }

        const msg =
          (typeof apiError?.message === 'string' && apiError.message) ||
          (typeof (body as any)?.message === 'string' && (body as any).message) ||
          (typeof (body as any)?.error === 'string' && (body as any).error) ||
          t.errorSubmitting
        throw new Error(String(msg))
      }

    const created: any = body
const createdId = created?.orderId || created?.data?.id || created?.data?._id || created?._id || created?.id


      if (paymentMethod === 'CASH' || paymentMethod === 'CARD') {
        clearCart?.()
        router.push(`/${currentLocale}/orders/${createdId}`)
      } else {
        if (created?.payment?.initUrl) {
          clearCart?.()
          window.location.href = created.payment.initUrl
          return
        }
        const params = new URLSearchParams({
          orderId: String(createdId),
          method: paymentMethod,
          amount: String(effectiveTotal),
          name,
        })
        clearCart?.()
        router.push(`/${currentLocale}/payment?${params.toString()}`)
      }
    } catch (error: any) {
      console.error('Failed to create order', error)
      setErrorMsg(error?.message || t.errorSubmitting)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmitFinal = canSubmit && restaurantReady && !isSubmitting
  const prepMinutes = settings?.defaultPreparationMinutes ?? 20
  const timeLabel = t.summaryTime(prepMinutes, prepMinutes + 15)

  if (sessionStatus === 'loading') {
    return (
      <main dir={direction} className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-sm text-gray-500">{currentLocale === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</span>
      </main>
    )
  }

  if (sessionStatus !== 'authenticated') {
    return null
  }

  if (!items.length) {
    return (
      <main dir={direction} className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e6e1ff] text-[#5744d4]">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">{t.emptyCartTitle}</h1>
          <p className="text-sm text-gray-600">{t.emptyCartHint}</p>
          <Button asChild>
            <Link href={`/${currentLocale}/menu`}>{t.browseMenu}</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main dir={direction} className="min-h-screen bg-[#f4f2ff] pb-36">
      <form id="checkout-form" onSubmit={handleProceedToPayment} className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pt-6 sm:px-6">
        <header className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-gray-900">{t.title}</span>
            <span className="text-xs text-gray-500">{t.subtitle}</span>
          </div>
        </header>

        <section className="rounded-3xl bg-white p-5 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.45)]">
          <FulfillmentSelector
            allowDelivery={allowDelivery}
            allowPickup={allowPickup}
            activeMethod={deliveryMethod}
            labels={fulfillmentLabels}
            onSelect={setDeliveryMethod}
          />

          <CheckoutAddressCard
            deliveryMethod={deliveryMethod}
            addressLine={addressLine}
            pickupSummary={pickupSummary}
            selectedAddress={selectedAddress}
            pickupBranch={pickupBranch}
            labels={addressCardLabels}
            localeSeparator={localeSeparator}
            onEditClick={openAddressSelector}
          />


          <ContactInfoFields
            name={name}
            phone={phone}
            email={email}
            labels={{
              name: t.nameLabel,
              phone: t.phoneLabel,
              email: t.emailLabel,
              phoneHelp:
                currentLocale === 'ar'
                  ? 'يرجى إدخال رقم هاتف صالح بما في ذلك كود الدولة'
                  : 'Please enter a valid phone number including country code',
            }}
            phoneStatus={phone ? (phoneValid ? 'success' : 'error') : 'neutral'}
            onNameChange={setName}
            onPhoneChange={setPhone}
            onEmailChange={setEmail}
          />

          <div className="mt-5">
            <label className="mb-2 block text-xs font-semibold text-gray-500">{t.courierNote}</label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t.courierNotePlaceholder}
              className="min-h-[96px] resize-none rounded-2xl border border-gray-200 bg-[#fafafa] text-sm focus-visible:ring-0"
            />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.45)] space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">{t.paymentTitle}</h2>
            <span className="text-xs text-gray-500">{settings?.paymentMethods?.length ?? 0} options</span>
          </header>
          <PaymentMethodSelector
            availableMethods={(settings?.paymentMethods ?? []) as PaymentMethod[]}
            selectedMethod={paymentMethod}
            onSelect={setPaymentMethod}
            paymentIcons={PAYMENT_ICONS}
            getLabel={(method) => getPaymentLabel(method, t)}
            formattedTotal={formattedTotal}
          />

          

         
        </section>

        

        <CheckoutErrorBanner
          message={errorMsg ?? ''}
          details={errorMsg === t.validationError ? localizedValidationIssues : undefined}
        />
      </form>

     <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e0dcff] bg-white/95 backdrop-blur">

        <div className="mx-auto flex w-full max-w-4xl items-center gap-4 px-4 py-4 sm:px-6" dir={direction}>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500">{timeLabel}</p>
            <p className="text-lg font-semibold text-gray-900">{formattedTotal}</p>
          </div>
          <Button
            type="submit"
             form="checkout-form"
            className="flex-1 rounded-2xl bg-[#6c5ce7] text-sm font-semibold text-white shadow-lg hover:bg-[#5948d3]"
            disabled={!canSubmitFinal}
          >
            {isSubmitting ? t.payButtonProcessing : `${t.payButton} • ${formattedTotal}`}
          </Button>
       

        </div>
      </footer>

      <Sheet open={addressSheetOpen} onOpenChange={setAddressSheetOpen}>
        <SheetContent
          side="bottom"
          className="h-[90vh] rounded-t-[32px] bg-white p-0"
          dir={direction}
        >
          <SheetHeader className="px-6 py-4 text-right">
            <SheetTitle className="text-lg font-semibold text-gray-900">
              {currentLocale === 'ar' ? 'اختر عنوان التوصيل أو فرع الاستلام' : 'Choose delivery address or pickup branch'}
            </SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-y-auto px-2 pb-6">
            <CustomerDeliverySelector showIntro={false} onClose={() => setAddressSheetOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </main>
  )
}

function getPaymentLabel(method: PaymentMethod, t: (typeof STRINGS)['ar']) {
  switch (method) {
    case 'CARD':
      return t.cardCard
    case 'ONLINE':
      return t.cardOnline
    default:
      return t.cardCash
  }
}

const SegmentedButton = ({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'rounded-2xl border px-4 py-2 text-xs font-semibold shadow-sm transition',
      active
        ? 'border-[#6c5ce7] bg-[#ece8ff] text-[#3f2fb2]'
        : 'border-gray-200 bg-white text-gray-500 hover:border-[#d8d3ff]',
    )}
  >
    {label}
  </button>
)

const ActionToggle = ({
  icon: Icon,
  label,
  hint,
  checked,
  onCheckedChange,
  highlight,
  disabled = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  hint: string
  checked: boolean
  onCheckedChange: (value: boolean) => void
  highlight?: boolean
  disabled?: boolean
}) => (
  <div
    className={cn(
      'flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 shadow-[0_12px_35px_-30px_rgba(15,23,42,0.4)]',
      highlight ? 'border-[#d9d3ff] bg-[#f1eeff]' : 'border-gray-200 bg-white',
      disabled && 'opacity-60 pointer-events-none',
    )}
  >
    <div className="flex items-start gap-3">
      <span
        className={cn(
          'mt-1 flex h-9 w-9 items-center justify-center rounded-xl',
          highlight ? 'bg-[#e7e2ff] text-[#6c5ce7]' : 'bg-gray-100 text-gray-500',
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{hint}</p>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
  </div>
)
