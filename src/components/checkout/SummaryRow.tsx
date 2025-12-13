'use client'
import { cn } from '@/lib/utils'


export function SummaryRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
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
)}