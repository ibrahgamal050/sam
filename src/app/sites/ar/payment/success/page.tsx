import type { Metadata } from 'next'
import { PaymentSuccessClient } from '@/components/ar/payment-success-page'

export const metadata: Metadata = {
  title: 'تم الدفع بنجاح',
  description: 'شكرًا لك! تم تأكيد الطلب والدفع.'
}

export default function PaymentSuccessPage() {
  return <PaymentSuccessClient />
}

