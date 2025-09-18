import type { Metadata } from 'next'
import { PaymentFailureClient } from '@/components/ar/payment-failure-page'

export const metadata: Metadata = {
  title: 'فشل الدفع',
  description: 'حدث خطأ أثناء معالجة الدفع. حاول مرة أخرى.'
}

export default function PaymentFailurePage() {
  return <PaymentFailureClient />
}

