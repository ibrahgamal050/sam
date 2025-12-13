import type { Metadata } from 'next'
import { CartPageClient } from '@/components/ar/cart-page'

export const metadata: Metadata = {
  title: 'سلة المشتريات',
  description: 'استعرض المنتجات المختارة وتابع لإتمام الطلب',
}

export default function CartPage() {
  return <CartPageClient />
}

