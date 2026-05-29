import type { Metadata } from 'next'
import { OrderConfirmationClient } from '@/components/ru/order-confirmation-page'

export const metadata: Metadata = {
  title: 'تأكيد الطلب',
  description: 'تم استلام طلبك. شكرًا لتسوقك!'
}

export default function OrderConfirmationPage() {
  return <OrderConfirmationClient />
}

