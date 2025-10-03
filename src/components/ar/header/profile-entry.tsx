"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

import { DeliveryAddressButton } from "@/components/ar/header/delivery-address-button"
import { DesktopProfileMenu } from "@/components/ar/header/desktop-profile-menu"
import { MobileProfileMenu } from "@/components/ar/header/mobile-profile-menu"

export function ProfileEntry() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isAuthenticated = useMemo(() => status === "authenticated" && Boolean(session?.user), [status, session])

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => {
          const callback = typeof window !== "undefined" ? window.location.pathname : "/"
          router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callback)}`)
        }}
        className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:border-[#6c5ce7]/40 hover:text-[#6c5ce7]"
      >
        <span className="hidden md:inline">تسجيل الدخول</span>
        <span className="md:hidden">دخول</span>
      </button>
    )
  }

  return (
    <>
      <div className="hidden items-center gap-4 md:flex">
        <DeliveryAddressButton />
        <DesktopProfileMenu userName={session?.user?.name} userEmail={session?.user?.email ?? undefined} />
      </div>
      <div className="flex flex-1 items-center gap-3 md:hidden">
        <DeliveryAddressButton className="flex-1" />
        <MobileProfileMenu userName={session?.user?.name} userEmail={session?.user?.email ?? undefined} />
      </div>
    </>
  )
}
