"use client"

import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { IRestaurant } from '@/types'
import { Phone, MapPin, Utensils, Info, Map } from 'lucide-react'

interface DesktopSiteLayoutProps {
  restaurant: IRestaurant
  children: ReactNode
}

export function DesktopSiteLayout({ restaurant, children }: DesktopSiteLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border">
              <Image src={`/images${restaurant.logo}`} alt={restaurant.name.ar} fill className="object-cover" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">{restaurant.name.ar}</h1>
          </div>
          <nav className="flex items-center gap-2">
            <NavLink href="/ru" label="الرئيسية" />
            <NavLink href="/ru/menu" label="المنيو" icon={<Utensils className="h-4 w-4" />} />
            <NavLink href="/ru/branches" label="الفروع" icon={<Map className="h-4 w-4" />} />
            <NavLink href="/ru/about" label="عن المطعم" icon={<Info className="h-4 w-4" />} />
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Main content */}
          <section className="col-span-12 lg:col-span-8 space-y-6">
            {children}
          </section>

        {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border shadow-sm p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3">معلومات التواصل</h2>
              <div className="space-y-3 text-sm">
                {restaurant.phones?.[0] && (
                  <a dir="ltr" href={`tel:${restaurant.phones[0]}`} className="flex items-center gap-2 text-gray-700 hover:text-[#6C5CE7]">
                    <Phone className="h-4 w-4 text-[#6C5CE7]" />
                    {restaurant.phones[0]}
                  </a>
                )}
                {restaurant.branches?.[0]?.location?.address?.ar && (
                  <p className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4 text-[#6C5CE7]" />
                    <span>{restaurant.branches[0].location.address.ar}</span>
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

function NavLink({ href, label, icon }: { href: string; label: string; icon?: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-gray-700 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10"
    >
      {icon}
      {label}
    </Link>
  )
}
