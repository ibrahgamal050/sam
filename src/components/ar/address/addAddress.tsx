"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useDeliveryAddress } from "@/contexts/delivery-address-context"
import { cn } from "@/lib/utils"
import { Navigation , Plus } from "lucide-react"

import CustomerDeliverySelector from "./select-map"

interface DeliveryAddressButtonProps {
  className?: string
}

export function DeliveryAddressButton({ className }: DeliveryAddressButtonProps = {}) {
  const { selectedAddress } = useDeliveryAddress()
  const [open, setOpen] = useState(false)

  const title = useMemo(() => {
    if (!selectedAddress) return "حدد عنوان التوصيل"
    return selectedAddress.name
  }, [selectedAddress])

  const subtitle = useMemo(() => {
    if (!selectedAddress) return "اضغط للاختيار"
    return selectedAddress.address
  }, [selectedAddress])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
       
                <Button
                  variant="outline"
                  className="w-full justify-center gap-2 rounded-2xl border-dashed"
                  
                >
                  <Plus className="h-4 w-4" /> أضف عنواناً جديداً
                </Button>
         
      </DialogTrigger>

      <DialogContent className="flex h-[90vh] w-[min(100%,900px)] flex-col overflow-hidden border-none bg-transparent p-0 sm:max-w-4xl">
       

        <div className="flex-1 overflow-y-auto rounded-b-3xl border border-t-0 border-gray-200 bg-white">
          <CustomerDeliverySelector showIntro={false} onClose={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
