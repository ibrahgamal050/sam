"use client"

import { useEffect, useMemo, useState } from "react"
import { Minus, Plus } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { CartItemInput } from "@/contexts/cart-context"
import { cn } from "@/lib/utils"
import type {
  IMenuItem,
  IMenuItemVariant,
  IMenuItemExtrasGroup,
  IMenuItemExtraOption,
} from "@/types/menu"

interface MenuItemConfiguratorProps {
  item: IMenuItem
  currency: string
  imageSrc?: string | null
  onConfirm: (payload: CartItemInput) => void
  onClose?: () => void
}

interface VariantOption {
  id: string
  name: string
  price: number
  source?: IMenuItemVariant
}

interface PreparedExtra {
  id: string
  name: string
  price: number
  maxQty?: number
  option: IMenuItemExtraOption
}

interface PreparedGroup {
  id: string
  name: string
  isRequired: boolean
  maxQty?: number
  extras: PreparedExtra[]
  group: IMenuItemExtrasGroup
}

type SelectedExtrasState = Record<string, number>

const formatPrice = (value: number) => {
  if (!Number.isFinite(value)) return "0"
  const normalized = Math.max(0, value)
  if (normalized === 0) return "0"
  if (normalized % 1 === 0) {
    return normalized.toFixed(0)
  }
  return normalized.toFixed(2)
}

const resolveId = (value: unknown, fallback: string) => {
  if (!value) return fallback
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)
  if (typeof value === "object" && "toString" in value && typeof (value as { toString: () => string }).toString === "function") {
    const result = (value as { toString: () => string }).toString()
    if (typeof result === "string" && result && result !== "[object Object]") {
      return result
    }
  }
  return fallback
}

export function MenuItemConfigurator({ item, currency, imageSrc, onConfirm, onClose }: MenuItemConfiguratorProps) {
  const itemId = useMemo(() => resolveId(item._id, `item-${item.name?.en || item.name?.ar || "unknown"}`), [item])
  const itemName = useMemo(
    () => item.name?.en || item.name?.ar || "Menu item",
    [item.name?.ar, item.name?.en],
  )
  const itemDescription = useMemo(() => {
    if (!item.description) return ""
    return item.description.en || item.description.ar || ""
  }, [item.description])

  const variantOptions = useMemo<VariantOption[]>(() => {
    const variants: VariantOption[] = []
    if (Array.isArray(item.variants) && item.variants.length > 0) {
      item.variants.forEach((variant, index) => {
        const id = resolveId(variant._id, `variant-${index}`)
        variants.push({
          id,
          name: variant.name?.en || variant.name?.ar || `Option ${index + 1}`,
          price: Number(variant.price ?? item.price ?? 0),
          source: variant,
        })
      })
      return variants
    }

    if (Array.isArray(item.sizes) && item.sizes.length > 0) {
      item.sizes.forEach((size, index) => {
        const id = resolveId(size._id, `size-${index}`)
        variants.push({
          id,
          name: size.name?.en || size.name?.ar || `Size ${index + 1}`,
          price: Number(size.price ?? item.price ?? 0),
        })
      })
    }

    return variants
  }, [item.price, item.sizes, item.variants])

  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(() => {
    const defaultVariant = item.variants?.find((variant) => variant.isDefault)
    if (defaultVariant) {
      return resolveId(defaultVariant._id, "variant-default")
    }
    return variantOptions[0]?.id
  })

  useEffect(() => {
    if (!variantOptions.length) {
      setSelectedVariantId(undefined)
      return
    }
    setSelectedVariantId((prev) => {
      if (prev && variantOptions.some((option) => option.id === prev)) return prev
      return variantOptions[0]?.id
    })
  }, [variantOptions])

  const selectedVariant = useMemo(() => {
    if (!selectedVariantId) return undefined
    return variantOptions.find((variant) => variant.id === selectedVariantId)
  }, [selectedVariantId, variantOptions])

  const preparedGroups = useMemo<PreparedGroup[]>(() => {
    if (!Array.isArray(item.extrasGroups)) return []

    return item.extrasGroups.map((group, groupIndex) => {
      const groupId = resolveId(group._id, `extras-group-${groupIndex}`)
      const extras = Array.isArray(group.extras)
        ? group.extras.map((extra, extraIndex) => ({
            id: resolveId(extra._id, `${groupId}-extra-${extraIndex}`),
            name: extra.name?.en || extra.name?.ar || `Extra ${extraIndex + 1}`,
            price: Number(extra.price ?? 0),
            maxQty: typeof extra.maxQty === "number" ? extra.maxQty : undefined,
            option: extra,
          }))
        : []

      return {
        id: groupId,
        name: group.name?.en || group.name?.ar || `Extras ${groupIndex + 1}`,
        isRequired: Boolean(group.isRequired),
        maxQty: typeof group.maxQty === "number" ? group.maxQty : undefined,
        extras,
        group,
      }
    })
  }, [item.extrasGroups])

  const [selectedExtras, setSelectedExtras] = useState<SelectedExtrasState>({})

  useEffect(() => {
    if (!preparedGroups.length) {
      if (Object.keys(selectedExtras).length > 0) {
        setSelectedExtras({})
      }
      return
    }

    const validExtraIds = new Set<string>()
    preparedGroups.forEach((group) => {
      group.extras.forEach((extra) => validExtraIds.add(extra.id))
    })

    setSelectedExtras((prev) => {
      const next: SelectedExtrasState = {}
      Object.entries(prev).forEach(([extraId, qty]) => {
        if (!validExtraIds.has(extraId)) return
        if (qty > 0) {
          next[extraId] = qty
        }
      })
      return next
    })
  }, [preparedGroups])

  const extraToGroupMap = useMemo(() => {
    const map = new Map<string, PreparedGroup>()
    preparedGroups.forEach((group) => {
      group.extras.forEach((extra) => {
        map.set(extra.id, group)
      })
    })
    return map
  }, [preparedGroups])

  const getGroupTotal = (group: PreparedGroup, state: SelectedExtrasState = selectedExtras) => {
    return Object.entries(state).reduce((sum, [extraId, qty]) => {
      if (qty <= 0) return sum
      const ownerGroup = extraToGroupMap.get(extraId)
      if (!ownerGroup || ownerGroup.id !== group.id) return sum
      return sum + qty
    }, 0)
  }

  const updateExtraQty = (group: PreparedGroup, extra: PreparedExtra, requestedQty: number) => {
    setSelectedExtras((prev) => {
      const next = { ...prev }
      const currentQty = next[extra.id] ?? 0
      const sanitizedQty = Math.max(0, Math.floor(requestedQty))

      let nextQty = sanitizedQty

      if (typeof extra.maxQty === "number") {
        nextQty = Math.min(nextQty, extra.maxQty)
      }

      if (typeof group.maxQty === "number") {
        const totalWithoutCurrent = Object.entries(next).reduce((sum, [extraId, qty]) => {
          if (extraId === extra.id) return sum
          const ownerGroup = extraToGroupMap.get(extraId)
          if (!ownerGroup || ownerGroup.id !== group.id) return sum
          return sum + qty
        }, 0)

        const remaining = group.maxQty - totalWithoutCurrent
        if (remaining <= 0) {
          nextQty = 0
        } else {
          nextQty = Math.min(nextQty, remaining)
        }
      }

      if (nextQty <= 0) {
        delete next[extra.id]
      } else {
        next[extra.id] = nextQty
      }
      return next
    })
  }

  const preparedExtrasList = useMemo(() => {
    const list: Array<{
      id: string
      name: string
      price: number
      qty: number
      groupId: string
      groupName: string
    }> = []

    preparedGroups.forEach((group) => {
      group.extras.forEach((extra) => {
        const qty = selectedExtras[extra.id] ?? 0
        if (qty > 0) {
          list.push({
            id: extra.id,
            name: extra.name,
            price: extra.price,
            qty,
            groupId: group.id,
            groupName: group.name,
          })
        }
      })
    })

    return list
  }, [preparedGroups, selectedExtras])

  const extrasTotal = useMemo(
    () => preparedExtrasList.reduce((sum, extra) => sum + extra.price * extra.qty, 0),
    [preparedExtrasList],
  )

  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState("")

  const basePrice = useMemo(() => {
    if (selectedVariant) return Math.max(0, selectedVariant.price)
    if (Number.isFinite(item.price)) return Math.max(0, Number(item.price))
    return 0
  }, [item.price, selectedVariant])

  const unitPrice = useMemo(() => Math.max(0, basePrice + extrasTotal), [basePrice, extrasTotal])
  const totalPrice = useMemo(() => unitPrice * quantity, [unitPrice, quantity])

  const hasVariants = variantOptions.length > 0
  const hasExtras = preparedGroups.length > 0

  const requiredGroupsFulfilled = useMemo(() => {
    if (!preparedGroups.length) return true
    return preparedGroups.every((group) => {
      if (!group.isRequired) return true
      const total = Object.entries(selectedExtras).reduce((sum, [extraId, qty]) => {
        if (qty <= 0) return sum
        const ownerGroup = extraToGroupMap.get(extraId)
        if (!ownerGroup || ownerGroup.id !== group.id) return sum
        return sum + qty
      }, 0)
      return total > 0
    })
  }, [preparedGroups, selectedExtras, extraToGroupMap])

  const canSubmit = (!hasVariants || Boolean(selectedVariantId)) && requiredGroupsFulfilled

  const handleIncrementQty = () => setQuantity((prev) => Math.min(prev + 1, 99))
  const handleDecrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : prev))

  const handleSubmit = () => {
    if (!canSubmit) return

    const variantPayload = selectedVariant
      ? {
          id: selectedVariant.id,
          name: selectedVariant.name,
          price: selectedVariant.price,
        }
      : undefined

    const extrasPayload = preparedExtrasList.map((extra) => ({
      id: extra.id,
      name: extra.name,
      price: extra.price,
      qty: extra.qty,
      groupId: extra.groupId,
      groupName: extra.groupName,
    }))

    onConfirm({
      itemId,
      itemName,
      basePrice,
      quantity,
      variant: variantPayload,
      extras: extrasPayload,
      note,
    })
    onClose?.()
  }

  const renderVariantTab = () => {
    if (!hasVariants) {
      return (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 px-4 py-5 text-sm text-gray-600">
          No sizes or options are available for this item.
        </div>
      )
    }

    return (
      <RadioGroup value={selectedVariantId} onValueChange={setSelectedVariantId} className="gap-3">
        {variantOptions.map((variant) => (
          <label
            key={variant.id}
            className={cn(
              "flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 transition hover:border-[#6c5ce7]/60",
              selectedVariantId === variant.id ? "border-[#6c5ce7]" : "",
            )}
          >
            <div className="flex items-start gap-3">
              <RadioGroupItem value={variant.id} className="mt-1" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{variant.name}</p>
                <p className="text-xs text-gray-500">{formatPrice(variant.price)} {currency}</p>
              </div>
            </div>
          </label>
        ))}
      </RadioGroup>
    )
  }

  const renderExtrasTab = () => {
    if (!hasExtras) {
      return (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 px-4 py-5 text-sm text-gray-600">
          No extras are available for this item.
        </div>
      )
    }

    return (
      <div className="space-y-5">
        {preparedGroups.map((group) => {
          const groupTotal = getGroupTotal(group)
          const remainingInGroup =
            typeof group.maxQty === "number" ? Math.max(group.maxQty - groupTotal, 0) : undefined

          return (
            <div
              key={group.id}
              className="rounded-3xl border border-gray-200 bg-[#f8fafc] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{group.name}</h3>
                  <div className="mt-1 text-xs text-gray-500">
                    {group.isRequired ? <span className="text-[#ef4444]">Required</span> : <span>Optional</span>}
                    {typeof group.maxQty === "number" && (
                      <span className="ml-2 text-gray-400">Max: {group.maxQty}</span>
                    )}
                  </div>
                </div>
                {typeof group.maxQty === "number" && (
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-gray-500">
                    Remaining: {remainingInGroup}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {group.extras.map((extra) => {
                  const extraQty = selectedExtras[extra.id] ?? 0
                  const groupTotalWithoutCurrent = groupTotal - extraQty
                  const groupRemaining =
                    typeof group.maxQty === "number" ? Math.max(group.maxQty - groupTotalWithoutCurrent, 0) : undefined
                  const extraRemaining =
                    typeof extra.maxQty === "number" ? Math.max(extra.maxQty - extraQty, 0) : undefined
                  const canEnable =
                    typeof groupRemaining === "number"
                      ? groupRemaining > 0 || extraQty > 0
                      : true
                  const canIncrement =
                    (typeof extraRemaining === "number" ? extraRemaining > 0 : true) &&
                    (typeof groupRemaining === "number" ? groupRemaining > 0 : true)

                  const showStepper =
                    (typeof extra.maxQty === "number" && extra.maxQty > 1) ||
                    (typeof group.maxQty === "number" && group.maxQty > 1)

                  const handleIncrease = () => updateExtraQty(group, extra, extraQty + 1)
                  const handleDecrease = () => updateExtraQty(group, extra, extraQty - 1)

                  return (
                    <div
                      key={extra.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-3"
                    >
                      <div className="flex items-start gap-3">
                        {!showStepper && (
                          <Checkbox
                            checked={extraQty > 0}
                            onCheckedChange={(checked) => updateExtraQty(group, extra, checked ? 1 : 0)}
                            disabled={!canEnable}
                            className="mt-1"
                          />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{extra.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatPrice(extra.price)} {currency}
                          </p>
                        </div>
                      </div>

                      {showStepper ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleDecrease}
                            disabled={extraQty === 0}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                            aria-label="Decrease extra"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold text-gray-900">{extraQty}</span>
                          <button
                            type="button"
                            onClick={handleIncrease}
                            disabled={!canIncrement}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6c5ce7] text-white transition hover:bg-[#5a4bd1] disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Increase extra"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-gray-600">{extraQty > 0 ? "Selected" : "Not selected"}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const contentTabs = hasVariants && hasExtras

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto pr-1">
        <header className="space-y-3">
          <div className="aspect-[4/3] overflow-hidden rounded-[28px] border border-gray-200 bg-[#f7f9fc]">
            <img
              src={imageSrc || "/placeholder.svg"}
              alt={itemName}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">{itemName}</h2>
            {itemDescription && <p className="text-sm leading-6 text-gray-600">{itemDescription}</p>}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Base price:</span>
              <span className="font-semibold text-gray-900">
                {formatPrice(basePrice)} {currency}
              </span>
            </div>
          </div>
        </header>

        {contentTabs ? (
          <Tabs defaultValue="variants" className="space-y-4">
            <TabsList className="grid grid-cols-2 bg-[#f1f5f9]">
              <TabsTrigger value="variants">Size/type</TabsTrigger>
              <TabsTrigger value="extras">Extras</TabsTrigger>
            </TabsList>
            <TabsContent value="variants" className="mt-4">
              {renderVariantTab()}
            </TabsContent>
            <TabsContent value="extras" className="mt-4">
              {renderExtrasTab()}
            </TabsContent>
          </Tabs>
        ) : (
          <>
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Size/type</h3>
              {renderVariantTab()}
            </section>
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Extras</h3>
              {renderExtrasTab()}
            </section>
          </>
        )}

        <section className="space-y-2">
          <label htmlFor="item-note" className="text-sm font-semibold text-gray-900">
            Order notes (optional)
          </label>
          <Textarea
            id="item-note"
            placeholder="Add any special notes for the restaurant..."
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="min-h-[90px] resize-none rounded-2xl border-gray-200 bg-white text-sm"
          />
        </section>
      </div>

      <footer className="sticky bottom-0 mt-6 rounded-[26px] border border-gray-200 bg-white px-4 py-4 shadow-[0_12px_35px_-20px_rgba(15,23,42,0.35)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Total</span>
            <span className="text-lg font-semibold text-gray-900">
              {formatPrice(totalPrice)} {currency}
            </span>
            {quantity > 1 && (
              <span className="text-[11px] text-gray-400">
                {quantity} × {formatPrice(unitPrice)} {currency}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-[#f7f9fc] p-1">
              <button
                type="button"
                onClick={handleDecrementQty}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 transition hover:bg-gray-100"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold text-gray-900">{quantity}</span>
              <button
                type="button"
                onClick={handleIncrementQty}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6c5ce7] text-white transition hover:bg-[#5a4bd1]"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="h-11 rounded-2xl bg-[#6c5ce7] px-5 text-sm font-semibold text-white hover:bg-[#5a4bd1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add to cart
            </Button>
          </div>
        </div>

        {!requiredGroupsFulfilled && (
          <p className="mt-3 text-xs text-[#ef4444]">
            Please choose the required extras before continuing.
          </p>
        )}
      </footer>
    </div>
  )
}
