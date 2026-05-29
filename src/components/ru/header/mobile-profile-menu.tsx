"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

type Locale = "ar" | "en" | "ru"

type SessionState =
  | { status: "loading" }
  | { status: "authenticated"; user: SessionUser }
  | { status: "unauthenticated" }

const MENU_ITEMS = [
  {
    label: {
      ar: "طلباتي",
      en: "Orders",
      ru: "Заказы",
    },
    href: {
      ar: "/ar/orders",
      en: "/en/orders",
      ru: "/ru/orders",
    },
    icon: Package,
  },
  {
    label: {
      ar: "المفضلة",
      en: "Favorites",
      ru: "Избранное",
    },
    href: {
      ar: "/ar/dashboard/favorites",
      en: "/en/dashboard/favorites",
      ru: "/ru/dashboard/favorites",
    },
    icon: Heart,
  },
  {
    label: {
      ar: "الإعدادات",
      en: "Settings",
      ru: "Настройки",
    },
    href: {
      ar: "/ar/account/settings",
      en: "/en/account/settings",
      ru: "/ru/account/settings",
    },
    icon: Settings2,
  },
]

export default function MobileProfileMenu() {
  const locale: Locale = "ru"

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
          setSession({ status: "authenticated", user: data.user })
        } else {
          setSession({ status: "unauthenticated" })
        }
      } catch {
        if (!cancelled) setSession({ status: "unauthenticated" })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const isAuthenticated = session.status === "authenticated"
  const sessionUser = isAuthenticated ? session.user : null

  const { resolvedName, resolvedEmail, resolvedImage } = useMemo(() => {
    return {
      resolvedName: sessionUser?.name ?? null,
      resolvedEmail: sessionUser?.email ?? null,
      resolvedImage: sessionUser?.picture ?? null,
    }
  }, [sessionUser])

  const avatarFallback =
    resolvedName?.trim()?.[0] ??
    (locale === "ru" ? "П" : locale === "en" ? "U" : "م")

  const displayName =
    resolvedName ??
    (locale === "ru"
      ? "Не выполнен вход"
      : locale === "en"
        ? "Not signed in"
        : "غير مسجل الدخول")

  const displaySubtitle =
    resolvedEmail ??
    (locale === "ru"
      ? "Войдите в систему"
      : locale === "en"
        ? "Sign in with email"
        : "سجّل الدخول بالبريد الإلكتروني")

  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    await fetch("/api/auth/logout", { method: "POST" })
    router.push(`/${locale}/auth/signin`)
    setSigningOut(false)
  }

  const handleSignIn = () => {
    if (signingIn) return
    setSigningIn(true)
    const callback = window.location.href
    router.push(
      `/${locale}/auth/signin?return_url=${encodeURIComponent(callback)}`
    )
  }

  const dir = locale === "ar" ? "rtl" : "ltr"
  const textAlign = locale === "ar" ? "text-right" : "text-left"
  const alignment = locale === "ar" ? "items-end" : "items-start"

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full border bg-white"
      >
        <User className="h-5 w-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl bg-[#f9f9fb]" dir={dir}>
          <SheetHeader>
            <SheetTitle>
              {isAuthenticated
                ? locale === "ru"
                  ? "Профиль"
                  : locale === "en"
                    ? "Account"
                    : "حسابك"
                : locale === "ru"
                  ? "Вход"
                  : locale === "en"
                    ? "Sign in"
                    : "تسجيل الدخول"}
            </SheetTitle>

            <div className="flex items-center gap-3 rounded-3xl bg-white p-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={resolvedImage ?? ""} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>

              <div className={cn("flex flex-col", alignment, textAlign)}>
                <span className="font-semibold">{displayName}</span>
                <span className="text-sm text-gray-500">{displaySubtitle}</span>
              </div>
            </div>
          </SheetHeader>

          {isAuthenticated ? (
            <>
              <div className="mt-6 space-y-2">
                {MENU_ITEMS.map((item) => (
                  <Link
                    key={item.href[locale]}
                    href={item.href[locale]}
                    className="flex items-center justify-between rounded-3xl bg-white px-4 py-3"
                    onClick={() => setOpen(false)}
                  >
                    <span>{item.label[locale]}</span>
                    <item.icon className="h-4 w-4" />
                  </Link>
                ))}
              </div>

              <Separator className="my-6" />

              <Button
                onClick={handleSignOut}
                className="w-full rounded-3xl"
                disabled={signingOut}
              >
                <LogOut className="h-4 w-4" />
                {locale === "ru"
                  ? "Выйти"
                  : locale === "en"
                    ? "Sign out"
                    : "تسجيل الخروج"}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleSignIn}
              className="w-full rounded-3xl"
              disabled={signingIn}
            >
              {locale === "ru"
                ? "Войти"
                : locale === "en"
                  ? "Sign in"
                  : "تسجيل الدخول"}
            </Button>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}