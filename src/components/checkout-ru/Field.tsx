'use client'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'


export function Field({
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
<div className={cn('space-y-2 text-left', className)}>
<Label htmlFor={htmlFor} className="text-xs font-medium text-gray-600">
{label}
</Label>
{children}
</div>
)
}