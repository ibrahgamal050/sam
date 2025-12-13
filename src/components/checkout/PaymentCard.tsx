'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard } from 'lucide-react'
import type { PaymentMethod } from '@/lib/checkout/types'


const LABELS: Record<PaymentMethod, string> = {
CASH: 'كاش',
CARD: 'بطاقة عند الاستلام',
ONLINE: 'دفع أونلاين',
}


export function PaymentCard({
available,
value,
onChange,
}: {
available: PaymentMethod[]
value: PaymentMethod
onChange: (m: PaymentMethod) => void
}) {
return (
<Card className="border-gray-200 shadow-sm">
<CardHeader className="text-right">
<CardTitle className="text-lg text-gray-900">طريقة الدفع</CardTitle>
<CardDescription className="text-xs text-gray-500">اختر الطريقة التي تفضلها لإتمام عملية الدفع.</CardDescription>
</CardHeader>
<CardContent className="flex gap-3 overflow-x-auto pb-2">
{available.map((option) => (
<label key={option} className={`flex-shrink-0 cursor-pointer border-2 rounded-2xl p-4 min-w-[160px] transition ${
value === option ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white hover:border-yellow-400/40'
}`}
>
<input type="radio" name="payment-method" className="hidden" checked={value === option} onChange={() => onChange(option)} />
<CreditCard className="w-8 h-8 text-gray-400 mb-6" />
<div className="flex items-center justify-between">
<div className="flex gap-1">
<div className="w-6 h-4 bg-red-500 rounded opacity-80"></div>
<div className="w-6 h-4 bg-orange-400 rounded opacity-80"></div>
</div>
<span className="text-base font-medium">{LABELS[option]}</span>
</div>
</label>
))}
</CardContent>
</Card>
)
}