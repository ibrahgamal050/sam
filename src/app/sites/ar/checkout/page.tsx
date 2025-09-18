'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/contexts/cart-context'
import { useRestaurant } from '@/contexts/restaurant-context'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const { items } = useCart()
  const { restaurant } = useRestaurant()
  const router = useRouter()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'paypal' | 'stripe'>('cod')

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items])
  const taxes = Math.round(subtotal * 0.14)
  const delivery = deliveryMethod === 'delivery' ? 20 : 0
  const total = subtotal + taxes + delivery

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    // Create order on the server before redirecting to payment
    try {
      const payload = {
        restaurantId: String(restaurant?._id || ''),
        userId: undefined as string | undefined,
        guest: { name, phone, email, address },
        items: items.map((i) => ({ productId: i.id, name: i.name, quantity: i.quantity, price: i.price })),
      }
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Order not created')
      const created = await res.json()
      const createdId = created?._id || created?.id

      const params = new URLSearchParams({
        orderId: String(createdId),
        method: paymentMethod,
        amount: String(total),
        name,
      })
      router.push(`/ar/payment?${params.toString()}`)
    } catch (err) {
      console.error('Failed to create order', err)
      alert('حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.')
    }
  }

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <h1 className="text-xl font-bold mb-4">إتمام الطلب</h1>
      {items.length === 0 ? (
        <div className="bg-white border rounded p-6 text-center">
          <p className="mb-4">سلتك فارغة</p>
          <Link href="/ar/menu" className="text-[#6C5CE7] hover:underline">العودة إلى المنيو</Link>
        </div>
      ) : (
        <form onSubmit={handleProceedToPayment} className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border rounded p-4 space-y-4">
            <section>
              <h2 className="font-semibold mb-3">بيانات العميل</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <input type="text" placeholder="الاسم" className="border p-2 rounded" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="tel" placeholder="رقم الهاتف" className="border p-2 rounded" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                <input type="email" placeholder="البريد الإلكتروني (اختياري)" className="border p-2 rounded sm:col-span-2" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </section>

            <section>
              <h2 className="font-semibold mb-3">التسليم</h2>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input type="radio" name="delivery" checked={deliveryMethod==='delivery'} onChange={() => setDeliveryMethod('delivery')} />
                  توصيل للمنازل
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="delivery" checked={deliveryMethod==='pickup'} onChange={() => setDeliveryMethod('pickup')} />
                  استلام من الفرع
                </label>
              </div>
              {deliveryMethod === 'delivery' && (
                <input type="text" placeholder="عنوان التوصيل" className="border p-2 rounded w-full mt-3" value={address} onChange={(e) => setAddress(e.target.value)} required />
              )}
            </section>

            <section>
              <h2 className="font-semibold mb-3">طريقة الدفع</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <label className="flex items-center gap-2 border p-2 rounded cursor-pointer">
                  <input type="radio" name="payment" checked={paymentMethod==='cod'} onChange={() => setPaymentMethod('cod')} />
                  دفع عند الاستلام
                </label>
                <label className="flex items-center gap-2 border p-2 rounded cursor-pointer">
                  <input type="radio" name="payment" checked={paymentMethod==='card'} onChange={() => setPaymentMethod('card')} />
                  بطاقة بنكية
                </label>
                <label className="flex items-center gap-2 border p-2 rounded cursor-pointer">
                  <input type="radio" name="payment" checked={paymentMethod==='paypal'} onChange={() => setPaymentMethod('paypal')} />
                  PayPal
                </label>
                <label className="flex items-center gap-2 border p-2 rounded cursor-pointer">
                  <input type="radio" name="payment" checked={paymentMethod==='stripe'} onChange={() => setPaymentMethod('stripe')} />
                  Stripe
                </label>
              </div>
            </section>

            <section>
              <h2 className="font-semibold mb-3">ملخص المنتجات</h2>
              <ul className="divide-y border rounded">
                {items.map((item) => (
                  <li key={item.id} className="flex justify-between p-2 text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{(item.price * item.quantity).toFixed(0)} ج.م</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="bg-white border rounded p-4 h-fit">
            <h2 className="font-semibold mb-3">ملخص الدفع</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>المجموع</span><span>{subtotal.toFixed(0)} ج.م</span></div>
              <div className="flex justify-between"><span>الضريبة (14%)</span><span>{taxes.toFixed(0)} ج.م</span></div>
              <div className="flex justify-between"><span>التوصيل</span><span>{delivery.toFixed(0)} ج.م</span></div>
              <div className="flex justify-between font-bold border-t pt-2"><span>الإجمالي</span><span>{total.toFixed(0)} ج.م</span></div>
            </div>
            <button type="submit" className="mt-4 w-full bg-[#6C5CE7] text-white py-2 rounded hover:bg-[#5A4BD1]">
              المتابعة للدفع
            </button>
            <p className="text-xs text-gray-500 mt-2">بالنقر على متابعة، سيتم نقلك لصفحة الدفع الآمن (تجريبي).</p>
          </aside>
        </form>
      )}
    </div>
  )
}
