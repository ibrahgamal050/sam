"use client"

import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Locale } from "@/lib/translations"

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname()

  // Function to get the equivalent path in another locale
  const getLocalizedPath = (targetLocale: Locale) => {
    // Handle switching from English to Arabic
    if (currentLocale === "en" && targetLocale === "ar") {
      // For paths without a locale prefix, add the Arabic prefix
      return `/ar${pathname}`
    }
    // Handle switching from Arabic to English
    else if (currentLocale === "ar" && targetLocale === "en") {
      // For paths with Arabic prefix, remove it
      return pathname.replace(/^\/ar/, "")
    }

    // Default case (should not happen)
    return pathname
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild className={currentLocale === "en" ? "bg-muted" : ""}>
          <Link href={getLocalizedPath("en")}>English</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={currentLocale === "ar" ? "bg-muted" : ""}>
          <Link href={getLocalizedPath("ar")}>العربية</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
