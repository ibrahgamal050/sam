import type { Metadata } from 'next'
import { CartPageClient as EnCartPageClient } from '@/components/en/cart-page'
import { CartPageClient as ArCartPageClient } from '@/components/ar/cart-page'

// Generate metadata dynamically based on locale
export async function generateMetadata({ params }: { params: Promise<{ lng: string }> | { lng: string } }): Promise<Metadata> {
  const { lng } = await params
  const isArabic = lng === 'ar'

  return {
    title: isArabic ? 'سلة المشتريات' : 'Shopping Cart',
    description: isArabic 
      ? 'استعرض المنتجات المختارة وتابع لإتمام الطلب' 
      : 'Review your selected items and proceed to checkout',
  }
}

export default async function CartPage({ params }: { params: Promise<{ lng: string }> | { lng: string } }) {
  const { lng } = await params
  const isArabic = lng === 'ar'

  // Render the appropriate client component based on language
  return isArabic ? <ArCartPageClient /> : <EnCartPageClient />
}