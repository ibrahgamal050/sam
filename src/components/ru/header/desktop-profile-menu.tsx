"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Settings2, User } from "lucide-react"

type Locale = "ar" | "en" | "ru"

type DesktopProfileMenuProps = {
  userName?: string | null
  userEmail?: string | null
  locale?: Locale
}

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

export function DesktopProfileMenu({
  userName,
  userEmail,
  locale = "ar",
}: DesktopProfileMenuProps) {

  const isRtl = locale === "ar"

  const displayName =
    userName ??
    (locale === "ru"
      ? "Пользователь"
      : locale === "en"
        ? "Meelza User"
        : "مستخدم ميلزا")

  const displayEmail =
    userEmail ??
    (locale === "ru"
      ? "Добро пожаловать"
      : locale === "en"
        ? "Welcome"
        : "مرحبًا بك")

  const avatarFallback =
    userName?.trim()?.[0] ??
    (locale === "ru" ? "П" : locale === "en" ? "U" : "م")

  const profileLabel =
    locale === "ru"
      ? "Профиль"
      : locale === "en"
        ? "Profile"
        : "الملف الشخصي"

  const settingsLabel =
    locale === "ru"
      ? "Настройки"
      : locale === "en"
        ? "Settings"
        : "الإعدادات"

  const logoutLabel =
    locale === "ru"
      ? "Выйти"
      : locale === "en"
        ? "Sign out"
        : "تسجيل الخروج"

  const accountLabel =
    locale === "ru"
      ? "Аккаунт"
      : locale === "en"
        ? "Account"
        : "حسابي"

  const dir = isRtl ? "rtl" : "ltr"
  const textAlign = isRtl ? "text-right" : "text-left"

  const profileHref = `/${locale}/dashboard/profile`
  const settingsHref = `/${locale}/account/settings`
  const signInHref = `/${locale}/auth/signin`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hidden h-10 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 shadow-sm transition hover:border-[#6c5ce7]/40 hover:text-[#6c5ce7] md:flex"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt={displayName} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>

          <span className={`max-w-[140px] truncate ${textAlign}`}>
            {userName ?? accountLabel}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56" dir={dir}>
        <DropdownMenuLabel className={cn("text-sm", textAlign)}>
          <p className="font-semibold text-gray-900">{displayName}</p>
          <p className="text-xs text-gray-500">{displayEmail}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Profile */}
        <DropdownMenuItem asChild className={cn(textAlign)}>
          <Link href={profileHref} className="flex w-full items-center justify-between gap-2">
            <span>{profileLabel}</span>
            <User className="h-4 w-4 text-[#6c5ce7]" />
          </Link>
        </DropdownMenuItem>

        {/* Settings */}
        <DropdownMenuItem asChild className={cn(textAlign)}>
          <Link href={settingsHref} className="flex w-full items-center justify-between gap-2">
            <span>{settingsLabel}</span>
            <Settings2 className="h-4 w-4 text-[#6c5ce7]" />
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          className={cn("text-red-500", textAlign)}
          onSelect={(event) => {
            event.preventDefault()
            signOut({ callbackUrl: signInHref })
          }}
        >
          <span>{logoutLabel}</span>
          <LogOut className="h-4 w-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}