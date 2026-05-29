"use client"

import { useMemo, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

import { DeliveryAddressButton } from "@/components/ru/header/delivery-address-button"
import { DesktopProfileMenu } from "@/components/ru/header/desktop-profile-menu"
import MobileProfileMenu from "@/components/ru/header/mobile-profile-menu"

type Locale = "ar" | "en" | "ru"

const getLocale = (pathname: string): Locale => {
  if (pathname?.startsWith("/en")) return "en"
  if (pathname?.startsWith("/ru")) return "ru"
  return "ar"
}

export function ProfileEntry() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [redirecting, setRedirecting] = useState(false)

  const locale: Locale = getLocale(pathname || "/")

  const isAuthenticated = useMemo(
    () => status === "authenticated" && Boolean(session?.user),
    [status, session]
  )

  const isRtl = locale === "ar"

  if (!isAuthenticated) {
    return (
      <div className={`flex flex-col items-start gap-1 ${isRtl ? "text-right" : "text-left"}`}>
        <button
          type="button"
          onClick={() => {
            if (redirecting) return
            setRedirecting(true)

            const callback =
              typeof window !== "undefined"
                ? window.location.href
                : pathname || "/"

            router.push(
              `/${locale}/auth/signin?return_url=${encodeURIComponent(callback)}`
            )
          }}
          className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:border-[#6c5ce7]/40 hover:text-[#6c5ce7] disabled:opacity-70"
          disabled={redirecting}
        >
          {redirecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-[#6c5ce7]" />
              {locale === "ru"
                ? "Вход..."
                : locale === "en"
                  ? "Signing in..."
                  : "جار تسجيل الدخول..."}
            </>
          ) : (
            <>
              <span className="hidden md:inline">
                {locale === "ru"
                  ? "Войти"
                  : locale === "en"
                    ? "Sign in"
                    : "تسجيل الدخول"}
              </span>
              <span className="md:hidden">
                {locale === "ru"
                  ? "Войти"
                  : locale === "en"
                    ? "Login"
                    : "دخول"}
              </span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-500">
          {redirecting
            ? locale === "ru"
              ? "Открываем страницу входа..."
              : locale === "en"
                ? "Opening sign in..."
                : "جار فتح صفحة تسجيل الدخول..."
            : locale === "ru"
              ? "Вы не вошли в систему. Войдите, чтобы продолжить."
              : locale === "en"
                ? "You’re not signed in. Sign in to continue."
                : "أنت غير مسجل الدخول الآن. سجّل الدخول بالبريد الإلكتروني."}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden items-center gap-4 md:flex" dir={isRtl ? "rtl" : "ltr"}>
        <DeliveryAddressButton />
        <DesktopProfileMenu
          userName={session?.user?.name}
          userEmail={session?.user?.email ?? undefined}
          locale={locale}
        />
      </div>

      {/* Mobile */}
      <div className="flex flex-1 items-center gap-3 md:hidden" dir={isRtl ? "rtl" : "ltr"}>
        <DeliveryAddressButton className="flex-1" />
        <MobileProfileMenu />
      </div>
    </>
  )
}