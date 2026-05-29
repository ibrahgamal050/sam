import type { Metadata } from 'next'
import { PaymentPageClient } from '@/components/ru/payment-page'

export const metadata: Metadata = {
  title: 'الدفع الآمن',
  description: 'أكمل عملية الدفع بأمان (تجريبي)',
}

export default function PaymentPage() {
  return <PaymentPageClient />
}

