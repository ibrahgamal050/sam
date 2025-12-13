'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { SummaryRow } from './SummaryRow'
import { formatMoney } from '@/lib/utils/checkout'

type DeliveryMethod = 'DELIVERY' | 'PICKUP'

type SummaryCardProps = {
  subtotal: number
  taxes: number
  deliveryFee: number
  total: number
  taxRate: number
  minOrderAmount: number
  freeDeliveryThreshold?: number
  deliveryMethod: DeliveryMethod
  isSubmitting: boolean
  canSubmit: boolean
  errorMsg?: string | null
}

export function SummaryCard(props: SummaryCardProps) {
  const {
    subtotal = 0,
    taxes = 0,
    deliveryFee = 0,
    total = 0,
    taxRate = 0,
    minOrderAmount = 0,
    freeDeliveryThreshold,
    deliveryMethod,
    isSubmitting,
    canSubmit,
    errorMsg,
  } = props

  const underMin = subtotal < (minOrderAmount ?? 0)
  const isDelivery = deliveryMethod === 'DELIVERY'
  const showDeliveryRow = isDelivery && deliveryFee > 0
  const showTaxRow = taxRate > 0 && taxes > 0
  const showFreeDeliveryHint = !!freeDeliveryThreshold && isDelivery

  const remainingForMin =
    minOrderAmount > 0 ? Math.max(0, minOrderAmount - subtotal) : 0

  const remainingForFreeDelivery =
    (freeDeliveryThreshold ?? 0) > 0
      ? Math.max(0, (freeDeliveryThreshold as number) - subtotal)
      : 0

  // حماية إضافية: لا نسمح بالإرسال إذا تحت الحد الأدنى
  const submitDisabled = isSubmitting || !canSubmit || underMin

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="text-right">
        <CardTitle className="text-lg text-gray-900">ملخص الطلب</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-sm text-gray-600">
        {underMin && (
          <div
            className="rounded-2xl bg-red-50 p-3 text-xs text-red-600"
            role="alert"
            aria-live="polite"
          >
            الحد الأدنى للطلب هو {formatMoney(minOrderAmount)} — أضف منتجات بقيمة{' '}
            {formatMoney(remainingForMin)} لإتمام الطلب.
          </div>
        )}

        {showFreeDeliveryHint && (
          <div
            className="rounded-2xl bg-emerald-50 p-3 text-xs text-emerald-700"
            aria-live="polite"
          >
            توصيل مجاني فوق {formatMoney(freeDeliveryThreshold!)} — تبقى{' '}
            {formatMoney(remainingForFreeDelivery)}.
          </div>
        )}

        <div className="space-y-2">
          <SummaryRow label="المجموع" value={formatMoney(subtotal)} />
          {showTaxRow && (
            <SummaryRow
              label={`الضريبة (${Math.round(taxRate * 100)}%)`}
              value={formatMoney(taxes)}
            />
          )}
          {showDeliveryRow && (
            <SummaryRow label="رسوم التوصيل" value={formatMoney(deliveryFee)} />
          )}
          <SummaryRow label="الإجمالي" value={formatMoney(total)} highlight />
        </div>

        <div className="rounded-2xl bg-gray-50 p-4 text-xs text-gray-500">
          سيتم التواصل معك لتأكيد الطلب قبل البدء في التحضير. يمكنك متابعة حالة طلبك عبر صفحة طلباتي.
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          type="submit"
          disabled={submitDisabled}
          className="h-12 rounded-2xl bg-[#6c5ce7] text-sm font-semibold text-white shadow-lg shadow-[#6c5ce7]/25 transition hover:bg-[#5a4bd1] disabled:cursor-not-allowed disabled:opacity-60"
          aria-busy={isSubmitting || undefined}
        >
          {isSubmitting ? 'جاري تجهيز الطلب...' : 'تأكيد وإتمام الطلب'}
        </Button>

        {!canSubmit && !isSubmitting && (
          <p className="text-center text-[11px] leading-5 text-rose-600" role="status" aria-live="polite">
            يُرجى استيفاء جميع المتطلبات قبل الإتمام.
          </p>
        )}

        <p className="text-center text-[11px] leading-5 text-gray-500">
          بإتمام الطلب فأنت توافق على شروط الاستخدام وسياسة الخصوصية الخاصة بميلزا.
        </p>

        {errorMsg && (
          <p className="text-center text-xs text-rose-600" role="alert" aria-live="assertive">
            {errorMsg}
          </p>
        )}
      </CardFooter>
    </Card>
  )
}
