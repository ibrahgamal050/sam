'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { OrderSettingsDTO, OrderType } from '@/lib/checkout/types'
import CustomerDeliverySelector from '@/components/ar/address/customer-delivery-selector'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useDeliveryAddress } from '@/contexts/delivery-address-context'


export function DeliveryCard({
deliveryMethod,
setDeliveryMethod,
address,
setAddress,
notes,
setNotes,
allowDelivery,
allowPickup,
defaultPreparationMinutes,
selectedAddress,
}: {
deliveryMethod: OrderType
setDeliveryMethod: (v: OrderType) => void
address: string
setAddress: (v: string) => void
notes: string
setNotes: (v: string) => void
allowDelivery: boolean
allowPickup: boolean
defaultPreparationMinutes: number
selectedAddress?: { lat?: number; lng?: number; city?: string; address?: string } | null
}) {
const [addressSheetOpen, setAddressSheetOpen] = useState(false)

const { pickupBranch, deliveryBranch, setFulfillmentType } = useDeliveryAddress()

useEffect(() => {
setFulfillmentType(deliveryMethod === 'PICKUP' ? 'pickup' : 'delivery')
}, [deliveryMethod, setFulfillmentType])


useEffect(() => {
if (selectedAddress && deliveryMethod === 'DELIVERY') {
setAddress(selectedAddress.address || '')
}
}, [selectedAddress, deliveryMethod, setAddress])

return (
<Card className="border-gray-200 shadow-sm">
<CardHeader className="text-right">
<CardTitle className="text-lg text-gray-900">طريقة الاستلام</CardTitle>
<CardDescription className="text-xs text-gray-500">اختر بين التوصيل للمنازل أو الاستلام من الفرع.</CardDescription>
</CardHeader>
<CardContent className="space-y-6">
<div className="flex flex-wrap gap-3 text-sm font-medium text-gray-600">
<Button type="button" variant={deliveryMethod === 'DELIVERY' ? 'default' : 'outline'} disabled={!allowDelivery} className={
cn('rounded-full px-4 py-2 text-xs', deliveryMethod === 'DELIVERY' ? 'bg-[#6c5ce7] text-white hover:bg-[#5a4bd1]' : 'border border-gray-200 bg-gray-50 text-gray-700 hover:border-[#6c5ce7]/40 hover:text-[#6c5ce7]', !allowDelivery && 'opacity-50 cursor-not-allowed')
} onClick={() => {
if (!allowDelivery) return
setDeliveryMethod('DELIVERY')
setFulfillmentType('delivery')
}}
>
توصيل للمنازل
</Button>


<Button type="button" variant={deliveryMethod === 'PICKUP' ? 'default' : 'outline'} disabled={!allowPickup} className={
cn('rounded-full px-4 py-2 text-xs', deliveryMethod === 'PICKUP' ? 'bg-[#6c5ce7] text-white hover:bg-[#5a4bd1]' : 'border border-gray-200 bg-gray-50 text-gray-700 hover:border-[#6c5ce7]/40 hover:text-[#6c5ce7]', !allowPickup && 'opacity-50 cursor-not-allowed')
} onClick={() => {
if (!allowPickup) return
setDeliveryMethod('PICKUP')
setFulfillmentType('pickup')
}}
>
استلام من الفرع
</Button>
</div>


{deliveryMethod === 'DELIVERY' ? (
<div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
<div className="flex items-center justify-between">
<div>
<p className="text-xs font-semibold text-gray-500">عنوان التوصيل الحالي</p>
<p className="mt-1 font-medium text-gray-900">{address || 'لم يتم تحديد عنوان بعد'}</p>
{selectedAddress?.city && <p className="text-xs text-gray-500">{selectedAddress.city}</p>}
</div>
<Button type="button" variant="outline" size="sm" className="rounded-full border-[#6c5ce7] text-[#6c5ce7] hover:bg-[#6c5ce7]/10" onClick={() => setAddressSheetOpen(true)}>
تغيير العنوان
</Button>
</div>

{deliveryBranch && (
<div className="rounded-xl border border-dashed border-[#6c5ce7]/40 bg-white/70 px-3 py-2 text-xs text-gray-600">
يتم تجهيز الطلب بواسطة
<span className="font-semibold text-gray-900"> {deliveryBranch.name}</span>
{deliveryBranch.address ? ` — ${deliveryBranch.address}` : ''}
</div>
)}


<div className="space-y-2">
<Label htmlFor="checkout-address" className="text-xs text-gray-600">يمكنك تعديل العنوان يدويًا قبل الإرسال</Label>
<Textarea id="checkout-address" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="رقم الشارع، المبنى، المعلم القريب..." className="min-h-[84px] text-right" />
</div>
</div>
) : (
<div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 space-y-2">
{pickupBranch ? (
<>
<p>
سيتم تجهيز طلبك للاستلام من
<span className="font-semibold text-gray-900"> {pickupBranch.name}</span>
{pickupBranch.address ? ` — ${pickupBranch.address}` : ''}.
</p>
<p className="text-xs text-gray-500">التحضير يستغرق نحو {defaultPreparationMinutes} دقيقة.</p>
</>
) : (
<p className="text-xs text-gray-500">
حدد فرع الاستلام من أيقونة الموقع في أعلى الصفحة قبل إتمام الطلب.
</p>
)}
</div>
)}


<div>
<Label htmlFor="checkout-notes" className="text-xs text-gray-600">ملاحظات إضافية</Label>
<Textarea id="checkout-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="مثال: يرجى الاتصال قبل الوصول أو لا تضف بصلًا." className="mt-2 min-h-[76px] text-right" />
</div>
</CardContent>


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
</Card>
)
}
