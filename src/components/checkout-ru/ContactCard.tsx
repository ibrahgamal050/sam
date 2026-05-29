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
      <CardHeader className="text-left">
        <CardTitle className="text-lg text-gray-900">Контактные данные</CardTitle>
        <CardDescription className="text-xs text-gray-500">Мы используем эти данные для подтверждения заказа и связи при необходимости.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Field label="Полное имя" htmlFor="checkout-name">
          <Input id="checkout-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Например: Иван Иванов" className="text-left" />
        </Field>
        <Field label="Номер телефона" htmlFor="checkout-phone">
          <Input id="checkout-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+7XXXXXXXXXX" className={cn('text-left', !phoneValid && phone ? 'border-red-400' : '')} />
        </Field>
        <Field label="Электронная почта (необязательно)" htmlFor="checkout-email" className="md:col-span-2">
          <Input id="checkout-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="text-left" />
        </Field>
      </CardContent>
    </Card>
  )
}