"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Heart, Loader2, LogOut, Package, Settings2, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface SessionUser {
  id: string
  email?: string
  name?: string
  picture?: string
  email_verified?: boolean
}

type SessionState =
  | { status: "loading" }
  | { status: "authenticated"; user: SessionUser }
  | { status: "unauthenticated" }

const MENU_ITEMS = [
  {
    label: { ar: "طلباتي", en: "Orders" },
    href: { ar: "/ar/orders", en: "/en/orders" },
    icon: Package,
  },
  {
    label: { ar: "المفضلة", en: "Favorites" },
    href: { ar: "/ar/dashboard/favorites", en: "/en/dashboard/favorites" },
    icon: Heart,
  },
  {
    label: { ar: "الإعدادات", en: "Settings" },
    href: { ar: "/ar/account/settings", en: "/en/account/settings" },
    icon: Settings2,
  },
]

export default function MobileProfileMenu() {
  const params = useParams()
  const localeParam = Array.isArray(params?.lng) ? params?.lng[0] : (params as any)?.lng
  const locale = (localeParam === "en" ? "en" : "ar") as "ar" | "en"

  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  const [session, setSession] = useState<SessionState>({ status: "loading" })

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" })
        const data = await res.json()

        if (cancelled) return

        if (data?.status === "authenticated" && data?.user) {
          setSession({ status: "authenticated", user: data.user as SessionUser })
        } else {
          setSession({ status: "unauthenticated" })
        }
      } catch (error) {
        if (!cancelled) {
          console.error("[auth] session fetch failed", error)
          setSession({ status: "unauthenticated" })
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const isAuthenticated = session.status === "authenticated"
  const sessionUser = session.status === "authenticated" ? session.user : null

  const { resolvedName, resolvedEmail, resolvedImage } = useMemo(() => {
    const user = sessionUser ?? {}
    return {
      resolvedName: user.name ?? null,
      resolvedEmail: user.email ?? null,
      resolvedImage: user.picture ?? null,
    }
  }, [sessionUser])

  const avatarFallback = resolvedName?.trim()?.[0] ?? (locale === "ar" ? "م" : "G")
  const displayName = resolvedName ?? (locale === "ar" ? "غير مسجل الدخول" : "Not signed in")
  const displaySubtitle = resolvedEmail ?? (locale === "ar" ? "سجّل الدخول عبر Meelza ID" : "Sign in with Meelza ID")

  const handleSignOut = async () => {
    if (signingOut) return
    try {
      setSigningOut(true)
      await fetch("/api/auth/logout", { method: "POST" })
      router.push(`/${locale}/auth/signin`)
    } catch (error) {
      console.error("[auth] failed to sign out", error)
    } finally {
      setSigningOut(false)
    }
  }

  const handleProfileClick = () => {
    if (session.status === "loading") return
    setOpen(true)
  }

  const handleSignIn = () => {
    if (signingIn) return
    setSigningIn(true)
    const callback = typeof window !== "undefined" ? window.location.href : `/${locale}`
    router.push(`/${locale}/auth/signin?return_url=${encodeURIComponent(callback)}`)
  }

  const dir = locale === "ar" ? "rtl" : "ltr"
  const textAlign = locale === "ar" ? "text-right" : "text-left"
  const alignment = locale === "ar" ? "items-end" : "items-start"

  return (
    <>
      {/* زرار الأفاتار في الموبايل */}
      <div className="flex flex-col items-start gap-1">
        <button
          type="button"
          onClick={handleProfileClick}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition",
            "hover:border-[#6c5ce7]/40 hover:text-[#6c5ce7]",
            "focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/40",
            signingIn && "opacity-70"
          )}
          aria-label={locale === "ar" ? "الملف الشخصي" : "Profile"}
          disabled={signingIn}
        >
          {signingIn ? <Loader2 className="h-4 w-4 animate-spin text-[#6c5ce7]" /> : <User className="h-5 w-5" />}
        </button>
        
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl bg-[#f9f9fb] pb-8"
          dir={dir}
        >
          <SheetHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-semibold text-gray-900">
                {isAuthenticated ? (locale === "ar" ? "حسابك" : "Your account") : (locale === "ar" ? "تسجيل الدخول" : "Sign in")}
              </SheetTitle>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                {locale === "ar" ? "إغلاق" : "Close"}
              </Button>
            </div>

            <div className="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-sm">
              <Avatar className="h-12 w-12">
                <AvatarImage src={resolvedImage ?? "/placeholder-user.jpg"} alt={displayName} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              <div className={cn("flex flex-col", alignment, textAlign)}>
                <span className="font-semibold text-gray-900">{displayName}</span>
                <span className="text-sm text-gray-500">{displaySubtitle}</span>
              </div>
            </div>
          </SheetHeader>

          {isAuthenticated ? (
            <>
              <div className="mt-6 space-y-2">
                {MENU_ITEMS.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href[locale]}
                    href={href[locale]}
                    prefetch={false}
                    className={cn(
                      "flex w-full items-center justify-between rounded-3xl bg-white px-4 py-3",
                      "text-sm font-medium text-gray-700 shadow-sm transition hover:bg-[#6c5ce7]/5"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <span>{label[locale]}</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                      <Icon className="h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>

              <Separator className="my-6" />

              <SheetFooter>
                <Button
                  variant="outline"
                  className="w-full justify-center gap-2 rounded-3xl border-gray-200 py-3 text-sm text-gray-700"
                  onClick={handleSignOut}
                  disabled={signingOut}
                >
                  <LogOut className="h-4 w-4" />
                  {signingOut
                    ? locale === "ar"
                      ? "جارٍ تسجيل الخروج..."
                      : "Signing out..."
                    : locale === "ar"
                    ? "تسجيل الخروج"
                    : "Sign out"}
                </Button>
              </SheetFooter>
            </>
          ) : (
            <div className="mt-6 space-y-3">
              <p className={cn("text-sm text-gray-600", textAlign)}>
                {locale === "ar"
                  ? "أنت غير مسجل الدخول. استخدم Meelza ID لتسجيل الدخول ومتابعة طلباتك."
                  : "You’re not signed in. Use Meelza ID to sign in and manage your orders."}
              </p>
              <Button
                className="w-full justify-center gap-2 rounded-3xl bg-[#6c5ce7] py-3 text-sm font-semibold text-white hover:bg-[#5a4bd1]"
                onClick={handleSignIn}
                disabled={signingIn}
              >
                {signingIn && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                {signingIn
                  ? locale === "ar"
                    ? "جار تسجيل الدخول..."
                    : "Signing in..."
                  : locale === "ar"
                  ? "تسجيل الدخول"
                  : "Sign in"}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
