"use client"

import { useMemo, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

import { DeliveryAddressButton } from "@/components/ar/header/delivery-address-button"
import { DesktopProfileMenu } from "@/components/ar/header/desktop-profile-menu"
import MobileProfileMenu from "@/components/ar/header/mobile-profile-menu"

type Locale = "ar" | "en"

export function ProfileEntry() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [redirecting, setRedirecting] = useState(false)

  // استنتاج اللغة من المسار
  const locale: Locale = pathname?.startsWith("/en") ? "en" : "ar"

  const isAuthenticated = useMemo(
    () => status === "authenticated" && Boolean(session?.user),
    [status, session]
  )

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-start gap-1">
        <button
          type="button"
          onClick={() => {
            if (redirecting) return
            setRedirecting(true)
            const callback =
              typeof window !== "undefined"
                ? window.location.href // URL كامل عشان لما يرجع من اللوجين يرجّعه لنفس الصفحة بالظبط
                : pathname || "/"

            router.push(`/${locale}/auth/signin?return_url=${encodeURIComponent(callback)}`)
          }}
          className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:border-[#6c5ce7]/40 hover:text-[#6c5ce7] disabled:opacity-70"
          disabled={redirecting}
        >
          {redirecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-[#6c5ce7]" aria-hidden />
              {locale === "ar" ? "جار تسجيل الدخول..." : "Signing in..."}
            </>
          ) : (
            <>
              <span className="hidden md:inline">
                {locale === "ar" ? "تسجيل الدخول" : "Sign in"}
              </span>
              <span className="md:hidden">
                {locale === "ar" ? "دخول" : "Login"}
              </span>
            </>
          )}
        </button>
        <p className="text-xs text-gray-500">
          {redirecting
            ? locale === "ar"
              ? "جار فتح صفحة تسجيل الدخول..."
              : "Opening sign in..."
            : locale === "ar"
              ? "أنت غير مسجل الدخول الآن. سجّل الدخول بالبريد الإلكتروني."
              : "You’re not signed in. Sign in with email."}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* ديسكتوب */}
      <div className="hidden items-center gap-4 md:flex">
        <DeliveryAddressButton />
        <DesktopProfileMenu
          userName={session?.user?.name}
          userEmail={session?.user?.email ?? undefined}
          locale={locale}
        />
      </div>

      {/* موبايل */}
      <div className="flex flex-1 items-center gap-3 md:hidden">
        <DeliveryAddressButton className="flex-1" />
        {/* MobileProfileMenu حالياً بيشوف الـ locale من الـ params بنفسه، لو حبينا نعدل بعدين نخليه ياخد prop locale برضه */}
        <MobileProfileMenu />
      </div>
    </>
  )
}
