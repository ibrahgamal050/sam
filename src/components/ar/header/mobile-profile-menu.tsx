"use client"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { useMemo, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, LogOut, Settings2, User } from "lucide-react"

const MENU_ITEMS = [
  { label: "طلباتي", href: "/dashboard/orders", icon: ChevronLeft },
  { label: "المفضلة", href: "/dashboard/favorites", icon: User },
  { label: "الإعدادات", href: "/ar/account/settings", icon: Settings2 },
]

type MobileProfileMenuProps = {
  userName?: string | null
  userEmail?: string | null
}

export function MobileProfileMenu({ userName, userEmail }: MobileProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()

  const { resolvedName, resolvedEmail } = useMemo(() => {
    const sessionName = session?.user?.name ?? null
    const sessionEmail = session?.user?.email ?? null

    return {
      resolvedName: userName ?? sessionName ?? null,
      resolvedEmail: userEmail ?? sessionEmail ?? null,
    }
  }, [session, userName, userEmail])

  const avatarFallback = resolvedName?.trim()?.[0] ?? "م"
  const displayName = resolvedName ?? "ضيفنا العزيز"
  const displaySubtitle = resolvedEmail ?? "أهلاً بك في ميلزا"

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-[#6c5ce7]/40 hover:text-[#6c5ce7]"
          aria-label="الملف الشخصي"
        >
          <User className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl bg-[#f9f9fb] pb-8" dir="rtl">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold text-gray-900">حسابك</SheetTitle>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              إغلاق
            </Button>
          </div>
          <div className="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-sm">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder-user.jpg" alt={displayName} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-right">
              <span className="font-semibold text-gray-900">{displayName}</span>
              <span className="text-sm text-gray-500">{displaySubtitle}</span>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-2">
          {MENU_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="flex w-full items-center justify-between rounded-3xl bg-white px-4 py-3 text-right text-sm font-medium text-gray-700 shadow-sm transition hover:bg-[#6c5ce7]/5"
              onClick={() => setOpen(false)}
            >
              <span>{label}</span>
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
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
