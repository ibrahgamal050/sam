'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Field } from './Field'
import { cn } from '@/lib/utils'

export function ContactCard({
  name,
  setName,
  phone,
  setPhone,
  email,
  setEmail,
  phoneValid,
}: {
  name: string
  setName: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  email: string
  setEmail: (v: string) => void
  phoneValid: boolean
}) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="text-right">
        <CardTitle className="text-lg text-gray-900">بيانات التواصل</CardTitle>
        <CardDescription className="text-xs text-gray-500">سنستخدم هذه البيانات لتأكيد طلبك والتواصل عند الحاجة.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Field label="الاسم الكامل" htmlFor="checkout-name">
          <Input id="checkout-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="مثال: أحمد القاضي" className="text-right" />
        </Field>
        <Field label="رقم الهاتف" htmlFor="checkout-phone">
          <Input id="checkout-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="05xxxxxxxx" className={cn('text-right', !phoneValid && phone ? 'border-red-400' : '')} />
        </Field>
        <Field label="البريد الإلكتروني (اختياري)" htmlFor="checkout-email" className="md:col-span-2">
          <Input id="checkout-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="text-right" />
        </Field>
      </CardContent>
    </Card>
  )
}