"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

import { useDeliveryAddress } from "@/contexts/delivery-address-context"
import { Plus } from "lucide-react"

import CustomerDeliverySelector from "./select-map"
import { usePathname } from "next/navigation"

interface DeliveryAddressButtonProps {
  className?: string
}

type Locale = "ar" | "en" | "ru"

const getLocale = (pathname: string): Locale => {
  if (pathname?.startsWith("/en")) return "en"
  if (pathname?.startsWith("/ru")) return "ru"
  return "ar"
}

export function DeliveryAddressButton({
  className,
}: DeliveryAddressButtonProps = {}) {
  const { selectedAddress } = useDeliveryAddress()
  const [open, setOpen] = useState(false)

  const pathname = usePathname()
  const locale = getLocale(pathname || "/")

  const isRtl = locale === "ar"

  const buttonText = useMemo(() => {
    if (locale === "ru") return "Добавить новый адрес"
    if (locale === "en") return "Add new address"
    return "أضف عنواناً جديداً"
  }, [locale])

  const emptyTitle = useMemo(() => {
    if (!selectedAddress) {
      if (locale === "ru") return "Выберите адрес доставки"
      if (locale === "en") return "Select delivery address"
      return "حدد عنوان التوصيل"
    }
    return selectedAddress.name
  }, [selectedAddress, locale])

  const emptySubtitle = useMemo(() => {
    if (!selectedAddress) {
      if (locale === "ru") return "Нажмите, чтобы выбрать"
      if (locale === "en") return "Tap to choose"
      return "اضغط للاختيار"
    }
    return selectedAddress.address
  }, [selectedAddress, locale])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-center gap-2 rounded-2xl border-dashed"
        >
          <Plus className="h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="flex h-[90vh] w-[min(100%,900px)] flex-col overflow-hidden border-none bg-transparent p-0 sm:max-w-4xl"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="flex-1 overflow-y-auto rounded-b-3xl border border-t-0 border-gray-200 bg-white">
          <CustomerDeliverySelector
            showIntro={false}
            onClose={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}