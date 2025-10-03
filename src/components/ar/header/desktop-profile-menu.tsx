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

type DesktopProfileMenuProps = {
  userName?: string | null
  userEmail?: string | null
}

export function DesktopProfileMenu({ userName, userEmail }: DesktopProfileMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hidden h-10 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 shadow-sm transition hover:border-[#6c5ce7]/40 hover:text-[#6c5ce7] md:flex"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt={userName || "المستخدم"} />
            <AvatarFallback>{userName?.[0] ?? "م"}</AvatarFallback>
          </Avatar>
          <span className="max-w-[140px] truncate text-right">{userName ?? "حسابي"}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" dir="rtl">
        <DropdownMenuLabel className="text-right">
          <p className="text-sm font-semibold text-gray-900">{userName ?? "مستخدم ميلزا"}</p>
          <p className="text-xs text-gray-500">{userEmail ?? "مرحبًا بك"}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-between text-right">
          <Link href="/dashboard/profile" className="flex w-full items-center justify-between gap-2">
            <span>الملف الشخصي</span>
            <User className="h-4 w-4 text-[#6c5ce7]" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="justify-between text-right">
          <Link href="/ar/account/settings" className="flex w-full items-center justify-between gap-2">
            <span>الإعدادات</span>
            <Settings2 className="h-4 w-4 text-[#6c5ce7]" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-between text-right text-red-500"
          onSelect={(event) => {
            event.preventDefault()
            signOut({ callbackUrl: "/auth/signin" })
          }}
        >
          <span>تسجيل الخروج</span>
          <LogOut className="h-4 w-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
