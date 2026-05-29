import { Bookmark, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Address = {
  id: string
  name: string
  address: string
  city: string
  lat: number
  lng: number
  isDefault?: boolean
}

type DeliveryTabProps = {
  addresses: Address[]
  addressesLoading?: boolean
  selectedAddress?: Address | null
  searchQuery: string
  onSelectAddress: (address: Address) => void
  onEditAddress?: (id: string) => void
  isCheckingDelivery?: boolean
  deliveryInfo: { isAvailable: boolean; fee: number | null } | null
  deliveryBranch?: { name?: string; address?: string } | null
}

export default function DeliveryTab({
  addresses,
  addressesLoading,
  selectedAddress,
  searchQuery,
  onSelectAddress,
  onEditAddress,
  isCheckingDelivery,
  deliveryInfo,
}: DeliveryTabProps) {
  const q = searchQuery.trim().toLowerCase()

  const filtered = q
    ? addresses.filter(a =>
        `${a.name} ${a.address} ${a.city}`.toLowerCase().includes(q)
      )
    : addresses

  return (
    <div className="divide-y">
      {addressesLoading && filtered.length === 0 && (
        <>
          <div className="h-16 animate-pulse bg-gray-100" />
          <div className="h-16 animate-pulse bg-gray-100" />
        </>
      )}

      {filtered.map((a) => (
        <div
          key={a.id}
          className={cn(
            "flex items-center justify-between px-1 py-3 cursor-pointer hover:bg-gray-50 rounded-xl"
          )}
          role="button"
          onClick={() => onSelectAddress(a)}
        >
          <div className="flex items-start gap-3">
            <Bookmark className="mt-1 h-5 w-5 text-gray-400" />
            <div className="text-left">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{a.name}</p>
                {a.isDefault && (
                  <Badge className="bg-[#6c5ce7] text-white">По умолчанию</Badge>
                )}
                {selectedAddress?.id === a.id && (
                  <CheckCircle2 className="h-4 w-4 text-[#6c5ce7]" />
                )}
              </div>
              <p className="text-sm text-gray-700">{a.address}</p>
              <p className="text-xs text-gray-400">{a.city}</p>
            </div>
          </div>

          <button
            type="button"
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            onClick={(e) => {
              e.stopPropagation()
              onEditAddress?.(a.id)
            }}
            aria-label="Редактировать адрес"
          >
            ✎
          </button>
        </div>
      ))}

      {filtered.length === 0 && !addressesLoading && (
        <div className="px-1 py-6 text-center text-sm text-gray-500">
          Нет совпадающих адресов.
        </div>
      )}

      {isCheckingDelivery && (
        <div className="px-1 py-3 text-xs text-gray-500">
          Проверка зоны доставки...
        </div>
      )}

      {deliveryInfo && (
        <div className="px-1 py-3 text-xs">
          {deliveryInfo.isAvailable ? (
            <div className="rounded-xl bg-green-50 text-green-700 px-3 py-2">
              Доставка доступна{" "}
              {deliveryInfo.fee != null ? `— от ${deliveryInfo.fee} ₽` : ""}
            </div>
          ) : (
            <div className="rounded-xl bg-red-50 text-red-700 px-3 py-2">
              Адрес вне зоны доставки
            </div>
          )}
        </div>
      )}
    </div>
  )
}