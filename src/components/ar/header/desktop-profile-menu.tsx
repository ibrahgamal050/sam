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

type Locale = "ar" | "en"

type DesktopProfileMenuProps = {
  userName?: string | null
  userEmail?: string | null
  locale?: Locale // افتراضي عربي لو مش مبعوت
}

export function DesktopProfileMenu({ userName, userEmail, locale = "ar" }: DesktopProfileMenuProps) {
  const isAr = locale === "ar"

  const displayName =
    userName ??
    (isAr ? "مستخدم ميلزا" : "Meelza User")

  const displayEmail =
    userEmail ??
    (isAr ? "مرحبًا بك" : "Welcome")

  const avatarFallback = userName?.trim()?.[0] ?? (isAr ? "م" : "G")

  const profileLabel = isAr ? "الملف الشخصي" : "Profile"
  const settingsLabel = isAr ? "الإعدادات" : "Settings"
  const logoutLabel = isAr ? "تسجيل الخروج" : "Sign out"
  const accountLabel = isAr ? "حسابي" : "My account"

  const dir = isAr ? "rtl" : "ltr"
  const textAlign = isAr ? "text-right" : "text-left"
  const justifyText = isAr ? "justify-between" : "justify-between" // هنا ثابت، بس مخليها جاهزة لو حبينا نعدل

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
          <span
            className={`max-w-[140px] truncate ${
              isAr ? "text-right" : "text-left"
            }`}
          >
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

        {/* الملف الشخصي */}
        <DropdownMenuItem asChild className={cn(justifyText, textAlign)}>
          <Link
            href={profileHref}
            className="flex w-full items-center justify-between gap-2"
          >
            <span>{profileLabel}</span>
            <User className="h-4 w-4 text-[#6c5ce7]" />
          </Link>
        </DropdownMenuItem>

        {/* الإعدادات */}
        <DropdownMenuItem asChild className={cn(justifyText, textAlign)}>
          <Link
            href={settingsHref}
            className="flex w-full items-center justify-between gap-2"
          >
            <span>{settingsLabel}</span>
            <Settings2 className="h-4 w-4 text-[#6c5ce7]" />
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* تسجيل الخروج */}
        <DropdownMenuItem
          className={cn("text-red-500", justifyText, textAlign)}
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

// محتاج تضيف cn لو مش متضافه فوق:
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
