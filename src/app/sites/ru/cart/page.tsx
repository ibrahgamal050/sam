import type { Metadata } from 'next'
import { CartPageClient } from '@/components/ru/cart-page'

export const metadata: Metadata = {
  title: 'Корзина',
  description: 'Просмотрите выбранные товары и перейдите к оформлению заказа',
}

export default function CartPage() {
  return <CartPageClient />
}

