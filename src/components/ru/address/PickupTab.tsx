import { MapPin, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getLocalizedText } from "@/lib/localize"

type Branch = {
  _id: string
  name?: string | { ar?: string; en?: string }
  address?: string | { ar?: string; en?: string }
  city?: string
  phone?: string
  isMainBranch?: boolean
  isActive?: boolean
  location?: any
}

type PickupTabProps = {
  branches: Branch[]
  pickupBranch?: { id?: string | null } | null
  onSelectBranch: (branch: Branch) => void
}

export default function PickupTab({
  branches,
  pickupBranch,
  onSelectBranch,
}: PickupTabProps) {
  const normalizeId = (b: Branch) =>
    typeof b._id === "string" ? b._id : (b._id as any)?.toString?.() || ""

  if (!branches?.length) {
    return (
      <div className="px-1 py-6 text-center text-sm text-gray-500">
        Нет доступных филиалов.
      </div>
    )
  }

  return (
    <div className="divide-y">
      {branches.map((b: any) => {
        const id = normalizeId(b)

        const name = getLocalizedText(b?.name, "Филиал без названия")

        const address = getLocalizedText(b?.address, "Без адреса")

        const city = b?.city || b?.location?.city
        const active = pickupBranch?.id === id

        return (
          <div
            key={id}
            className="flex items-start justify-between px-1 py-3 hover:bg-gray-50 rounded-xl cursor-pointer"
            role="button"
            onClick={() => onSelectBranch(b)}
          >
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-[#6c5ce7]" />
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{name}</p>

                  {b?.isMainBranch && (
                    <Badge className="bg-[#6c5ce7] text-white">
                      Главный филиал
                    </Badge>
                  )}

                  {active && (
                    <CheckCircle2 className="h-4 w-4 text-[#6c5ce7]" />
                  )}
                </div>

                <p className="text-sm text-gray-700">{address}</p>

                {(city || b?.phone) && (
                  <p className="text-xs text-gray-400">
                    {city ? city : ""}
                    {city && b?.phone ? " • " : ""}
                    {b?.phone ? `☎ ${b.phone}` : ""}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}