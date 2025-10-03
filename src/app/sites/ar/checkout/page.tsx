'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useCart } from '@/contexts/cart-context'
import { useRestaurant } from '@/contexts/restaurant-context'
import { useDeliveryAddress } from '@/contexts/delivery-address-context'
import CustomerDeliverySelector from '@/components/ar/address/customer-delivery-selector'

const PAYMENT_OPTIONS = [
  { value: 'cod', label: 'دفع عند الاستلام' },
  { value: 'card', label: 'بطاقة بنكية' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'stripe', label: 'Stripe' },
] as const

type PaymentMethod = (typeof PAYMENT_OPTIONS)[number]['value']

export default function CheckoutPage() {
  const { items } = useCart()
  const { restaurant } = useRestaurant()
  const { selectedAddress } = useDeliveryAddress()
  const router = useRouter()
  const { data: session } = useSession()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addressSheetOpen, setAddressSheetOpen] = useState(false)

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])
  const taxes = Math.round(subtotal * 0.14)
  const delivery = deliveryMethod === 'delivery' ? 20 : 0
  const total = subtotal + taxes + delivery

  useEffect(() => {
    if (session?.user) {
      if (!name && session.user.name) setName(session.user.name)
      if (!email && session.user.email) setEmail(session.user.email)
    }
  }, [session, name, email])

  useEffect(() => {
    if (selectedAddress && deliveryMethod === 'delivery') {
      setAddress(selectedAddress.address)
    }
  }, [selectedAddress, deliveryMethod])

  const handleProceedToPayment = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmitting || items.length === 0) return

    try {
      if (!restaurant?._id) {
        throw new Error('Restaurant not resolved')
      }

      setIsSubmitting(true)

      const payload = {
        restaurantId: String(restaurant._id),
        userId: session?.user?.id ?? undefined,
        guest: {
          name,
          phone,
          email,
          address:
            deliveryMethod === 'delivery'
              ? address
              : `${restaurant.name?.ar ?? 'المطعم'} - استلام من الفرع`,
          notes,
          deliveryMethod,
        },
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Order not created')

      const created = await response.json()
      const createdId = created?._id || created?.id

      const params = new URLSearchParams({
        orderId: String(createdId),
        method: paymentMethod,
        amount: String(total),
        name,
      })

      router.push(`/ar/payment?${params.toString()}`)
    } catch (error) {
      console.error('Failed to create order', error)
      alert('حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderEmptyState = () => (
    <section className="mt-10 rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-600">
      سلتك حاليًا فارغة.{' '}
      <Link href="/ar/menu" className="font-semibold text-[#6c5ce7] hover:text-[#5a4bd1]">
        تصفّح المنيو
      </Link>{' '}
      لإضافة الأصناف المفضلة لديك.
    </section>
  )

  const renderContactCard = () => (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="text-right">
        <CardTitle className="text-lg text-gray-900">بيانات العميل</CardTitle>
        <CardDescription className="text-xs text-gray-500">
          سنستخدم هذه المعلومات للتواصل معك بخصوص الطلب.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Field label="الاسم الكامل" htmlFor="checkout-name">
          <Input
            id="checkout-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="مثال: أحمد القاضي"
            className="text-right"
          />
        </Field>
        <Field label="رقم الهاتف" htmlFor="checkout-phone">
          <Input
            id="checkout-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
            placeholder="05xxxxxxxx"
            className="text-right"
          />
        </Field>
        <Field label="البريد الإلكتروني (اختياري)" htmlFor="checkout-email" className="md:col-span-2">
          <Input
            id="checkout-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            className="text-right"
          />
        </Field>
      </CardContent>
    </Card>
  )

  const renderDeliveryCard = () => (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="text-right">
        <CardTitle className="text-lg text-gray-900">العنوان وطريقة الاستلام</CardTitle>
        <CardDescription className="text-xs text-gray-500">
          اختر الطريقة المناسبة واستعرض عنوانك الحالي أو حدّثه.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-3 text-sm font-medium text-gray-600">
          {['delivery', 'pickup'].map((option) => (
            <Button
              key={option}
              type="button"
              variant={deliveryMethod === option ? 'default' : 'outline'}
              className={cn(
                'rounded-full px-4 py-2 text-xs',
                deliveryMethod === option
                  ? 'bg-[#6c5ce7] text-white hover:bg-[#5a4bd1]'
                  : 'border border-gray-200 bg-gray-50 text-gray-700 hover:border-[#6c5ce7]/40 hover:text-[#6c5ce7]'
              )}
              onClick={() => setDeliveryMethod(option as 'delivery' | 'pickup')}
            >
              {option === 'delivery' ? 'توصيل للمنازل' : 'استلام من الفرع'}
            </Button>
          ))}
        </div>

        {deliveryMethod === 'delivery' ? (
          <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">عنوان التوصيل الحالي</p>
                <p className="mt-1 font-medium text-gray-900">{address || 'لم يتم تحديد عنوان بعد'}</p>
                {selectedAddress?.city && (
                  <p className="text-xs text-gray-500">{selectedAddress.city}</p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full border-[#6c5ce7] text-[#6c5ce7] hover:bg-[#6c5ce7]/10"
                onClick={() => setAddressSheetOpen(true)}
              >
                تغيير العنوان
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkout-address" className="text-xs text-gray-600">
                يمكنك تعديل العنوان يدويًا قبل الإرسال
              </Label>
              <Textarea
                id="checkout-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                required
                placeholder="رقم الشارع، المبنى، المعلم القريب..."
                className="min-h-[84px] text-right"
              />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            سيتم تجهيز طلبك للاستلام من الفرع الرئيسي للمطعم. يرجى الحضور خلال 30 دقيقة من التأكيد.
          </div>
        )}

        <Field label="ملاحظات إضافية" htmlFor="checkout-notes">
          <Textarea
            id="checkout-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="مثال: يرجى الاتصال قبل الوصول أو لا تضف بصلًا."
            className="min-h-[76px] text-right"
          />
        </Field>
      </CardContent>
    </Card>
  )

  const renderPaymentCard = () => (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="text-right">
        <CardTitle className="text-lg text-gray-900">طريقة الدفع</CardTitle>
        <CardDescription className="text-xs text-gray-500">
          اختر الطريقة التي تفضلها لإتمام عملية الدفع.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm md:grid-cols-2">
        {PAYMENT_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition',
              paymentMethod === option.value
                ? 'border-[#6c5ce7] bg-[#6c5ce7]/10 text-[#6c5ce7]'
                : 'border-gray-200 bg-white text-gray-700 hover:border-[#6c5ce7]/40'
            )}
          >
            <input
              type="radio"
              name="payment-method"
              className="h-4 w-4"
              checked={paymentMethod === option.value}
              onChange={() => setPaymentMethod(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </CardContent>
    </Card>
  )

  const renderSummaryCard = () => (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="text-right">
        <CardTitle className="text-lg text-gray-900">ملخص الطلب</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-gray-600">
        <div className="space-y-2">
          <SummaryRow label="المجموع" value={`${subtotal.toFixed(0)} ج.م`} />
          <SummaryRow label="الضريبة (14%)" value={`${taxes.toFixed(0)} ج.م`} />
          <SummaryRow label="رسوم التوصيل" value={`${delivery.toFixed(0)} ج.م`} />
          <SummaryRow label="الإجمالي" value={`${total.toFixed(0)} ج.م`} highlight />
        </div>
        <div className="rounded-2xl bg-gray-50 p-4 text-xs text-gray-500">
          سيتم التواصل معك لتأكيد الطلب قبل البدء في التحضير. يمكنك متابعة حالة طلبك عبر صفحة طلباتي.
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 rounded-2xl bg-[#6c5ce7] text-sm font-semibold text-white shadow-lg shadow-[#6c5ce7]/25 transition hover:bg-[#5a4bd1] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'جاري تجهيز الطلب...' : 'تأكيد وإتمام الطلب'}
        </Button>
        <p className="text-center text-[11px] leading-5 text-gray-500">
          بإتمام الطلب فأنت توافق على شروط الاستخدام وسياسة الخصوصية الخاصة بميلزا.
        </p>
      </CardFooter>
    </Card>
  )

  return (
    <main className="min-h-screen bg-gray-50" dir="rtl">
      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <header className="space-y-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#6c5ce7]">إتمام الشراء</p>
          <h1 className="text-3xl font-bold text-gray-900">تفاصيل الطلب والدفع</h1>
          <p className="text-sm text-gray-500">
            أدخل بياناتك لتأكيد الطلب. سنراجع التفاصيل قبل التواصل لتأكيد عملية التوصيل أو الاستلام.
          </p>
        </header>

        {items.length === 0 ? (
          renderEmptyState()
        ) : (
          <form onSubmit={handleProceedToPayment} className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              {renderContactCard()}
              {renderDeliveryCard()}
              {renderPaymentCard()}
            </div>
            {renderSummaryCard()}
          </form>
        )}
      </section>

      <Sheet open={addressSheetOpen} onOpenChange={setAddressSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-[32px] bg-white p-0" dir="rtl">
          <SheetHeader className="px-6 py-4 text-right">
            <SheetTitle className="text-lg font-semibold text-gray-900">اختر عنوان التوصيل</SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-y-auto px-2 pb-6">
            <CustomerDeliverySelector showIntro={false} onClose={() => setAddressSheetOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </main>
  )
}

function Field({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-2 text-right', className)}>
      <Label htmlFor={htmlFor} className="text-xs font-medium text-gray-600">
        {label}
      </Label>
      {children}
    </div>
  )
}

function SummaryRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-xl px-3 py-2',
        highlight ? 'bg-[#6c5ce7]/5 text-[#6c5ce7] font-semibold' : 'bg-gray-50'
      )}
    >
      <span className="text-xs text-gray-600">{label}</span>
      <span className={highlight ? 'text-sm' : 'text-xs text-gray-800'}>{value}</span>
    </div>
  )
}
