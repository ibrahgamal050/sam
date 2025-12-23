"use client"

import Link from "next/link"
import React, { useEffect, useMemo, useState, type ReactNode } from "react"

type OrderStatus = "pending" | "confirmed" | "preparing" | "delivered" | "cancelled"
type StepKey = "pending" | "confirmed" | "preparing" | "delivered"

export type OrdersUIItem = {
  id: string
  orderNumber: string
  status: OrderStatus
  totalPrice: number
  createdAtISO: string | null
  guest: { name: string; phone: string; address: string }
  items: { id: string; name: string; quantity: number; price: number }[]
}

export type OrdersShellVariant = "classic" | "brownStepper" | "minimal"

export type OrdersShellLabels = {
  kicker?: string
  title?: string
  subtitle?: string

  listTitle?: string
  listHint?: string

  backLabel?: string

  emptyTitle?: string
  emptySubtitle?: string
  emptyPrimaryCtaLabel?: string
  emptyPrimaryCtaHref?: string
  emptySecondaryCtaLabel?: string
  emptySecondaryCtaHref?: string

  itemsTitle?: string
  deliveryTitle?: string
  totalLabel?: string
}

export type OrdersShellActions = {
  reorder?: { label: string; href: string; style?: "solid" | "outline" }
  support?: { label: string; href: string; style?: "solid" | "outline" }
}

export type OrdersStepperConfig = {
  enabled?: boolean
  steps?: { key: StepKey; label: string; icon?: string }[]
  cancelledLabel?: string
}

export type OrdersBlocks =
  | { type: "stepper"; enabled?: boolean }
  | { type: "bigCode"; enabled?: boolean }
  | { type: "items"; enabled?: boolean }
  | { type: "delivery"; enabled?: boolean }
  | { type: "summary"; enabled?: boolean }
  | { type: "actions"; enabled?: boolean }
  | { type: "offers"; enabled?: boolean }

export type OrdersShellLayout = {
  desktop?: { columns?: string; listMaxHeight?: string }
  mobile?: { fullscreenDetails?: boolean }
}

export type OrdersShellTokens = {
  primary?: string
  secondary?: string
  surface?: string
  background?: string
  card?: string
  text?: string
  muted?: string
}

export type OrdersShellProps = {
  restaurantName: string
  orders: OrdersUIItem[]

  locale?: "ar" | "en"
  dir?: "rtl" | "ltr"

  variant?: OrdersShellVariant
  labels?: OrdersShellLabels
  actions?: OrdersShellActions
  layout?: OrdersShellLayout
  stepper?: OrdersStepperConfig
  detailBlocks?: OrdersBlocks[]

  // إخفاء هيدر الصفحة الأساسي في وضع تفاصيل الموبايل
  hideMainHeaderOnMobileDetails?: boolean

  // Tokens override (أو جاية من theme)
  tokens?: OrdersShellTokens

  // لو عايز تعرض عروض جوه التفاصيل
  renderOffers?: (order: OrdersUIItem) => ReactNode
}

/** =============== Defaults =============== */

const DEFAULT_LABELS_AR: Required<OrdersShellLabels> = {
  kicker: "لوحة العميل",
  title: "طلباتي",
  subtitle: "راجع آخر طلباتك وتابع حالة كل طلب بسهولة.",

  listTitle: "قائمة الطلبات",
  listHint: "اضغط على أي طلب لعرض التفاصيل.",

  backLabel: "رجوع للطلبات",

  emptyTitle: "لا توجد طلبات بعد",
  emptySubtitle: "لم تقم بإرسال أي طلبات حتى الآن. تصفّح المنيو وابدأ اليوم.",
  emptyPrimaryCtaLabel: "تصفح المنيو",
  emptyPrimaryCtaHref: "/ar/menu",
  emptySecondaryCtaLabel: "إتمام الطلب",
  emptySecondaryCtaHref: "/ar/checkout",

  itemsTitle: "المنتجات",
  deliveryTitle: "بيانات التوصيل",
  totalLabel: "إجمالي الطلب",
}

const DEFAULT_BLOCKS: OrdersBlocks[] = [
  { type: "stepper", enabled: true },
  { type: "bigCode", enabled: true },
  { type: "items", enabled: true },
  { type: "delivery", enabled: true },
  { type: "summary", enabled: true },
  { type: "actions", enabled: true },
  { type: "offers", enabled: false },
]

const DEFAULT_STEPS: { key: StepKey; label: string; icon: string }[] = [
  { key: "pending", label: "في المعالجة", icon: "↻" },
  { key: "confirmed", label: "تم التأكيد", icon: "🔥" },
  { key: "preparing", label: "قيد التحضير", icon: "🍔" },
  { key: "delivered", label: "تم التسليم", icon: "✓" },
]

const statusLabels: Record<OrderStatus, string> = {
  pending: "في انتظار التأكيد",
  confirmed: "تم التأكيد",
  preparing: "قيد التحضير",
  delivered: "تم التوصيل",
  cancelled: "تم الإلغاء",
}

const statusPillStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
}

const currencyFormatter = new Intl.NumberFormat("ar-EG", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat("ar-EG", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Cairo",
})

function formatDate(iso: string | null) {
  if (!iso) return ""
  return dateFormatter.format(new Date(iso))
}

function stepIndexFromStatus(status: OrderStatus) {
  if (status === "cancelled") return -1
  if (status === "pending") return 0
  if (status === "confirmed") return 1
  if (status === "preparing") return 2
  if (status === "delivered") return 3
  return 0
}

function resolveTokens(variant: OrdersShellVariant, theme?: any, override?: OrdersShellTokens) {
  const palette = theme?.palette ?? {}

  let base: Required<OrdersShellTokens> = {
    primary: palette.primary ?? "#6c5ce7",
    secondary: palette.secondary ?? "#111827",
    surface: palette.surface ?? "#F5EBDD",
    background: palette.background ?? "#F9FAFB",
    card: palette.card ?? "#FFFFFF",
    text: palette.text ?? "#111827",
    muted: palette.muted ?? "#6B7280",
  }

  if (variant === "brownStepper") {
    base = {
      ...base,
      primary: palette.primary ?? "#4B2518",
      secondary: palette.secondary ?? "#D43B2A",
      surface: palette.surface ?? "#F5EBDD",
    }
  }

  if (variant === "minimal") {
    base = {
      ...base,
      surface: palette.surface ?? "#F3F4F6",
      background: palette.background ?? "#FFFFFF",
    }
  }

  return { ...base, ...(override ?? {}) }
}

function mergeLabels(labels?: OrdersShellLabels): Required<OrdersShellLabels> {
  return { ...DEFAULT_LABELS_AR, ...(labels ?? {}) }
}

function styleButtonClass(style?: "solid" | "outline") {
  const s = style ?? "outline"
  if (s === "solid") return "text-white shadow"
  return "border"
}

/** =============== UI Pieces =============== */

function OrderDetailsHeader({
  title,
  subtitle,
  onBack,
  backLabel,
  primary,
}: {
  title: string
  subtitle?: string
  onBack?: () => void
  backLabel: string
  primary: string
}) {
  return (
    <div className="rounded-3xl px-4 py-4 text-white shadow-sm" style={{ backgroundColor: primary }}>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15"
        >
          <span className="text-base">←</span>
          <span>{backLabel}</span>
        </button>

        <div className="text-right">
          <div className="text-lg font-extrabold">{title}</div>
          {subtitle ? <div className="text-xs text-white/70">{subtitle}</div> : null}
        </div>
      </div>
    </div>
  )
}

function OrderStepper({
  status,
  cfg,
  primary,
}: {
  status: OrderStatus
  cfg: OrdersStepperConfig
  primary: string
}) {
  if (cfg.enabled === false) return null

  const idx = stepIndexFromStatus(status)

  if (status === "cancelled") {
    return (
      <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-right text-sm font-semibold text-red-700">
        {cfg.cancelledLabel ?? "تم إلغاء الطلب"}
      </div>
    )
  }

  const usedSteps = (cfg.steps?.length ? cfg.steps : DEFAULT_STEPS).map((s) => ({
    key: s.key,
    label: s.label,
    icon: s.icon ?? "•",
  }))

  return (
    <div className="mt-4 rounded-3xl px-4 py-4 text-white" style={{ backgroundColor: primary }}>
      <div className="relative flex items-center justify-between">
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2">
          <div className="h-1 rounded-full bg-white/20" />
          <div className="h-1 rounded-full bg-white/70" style={{ width: `${(idx / 3) * 100}%` }} />
        </div>

        {usedSteps.map((s, i) => {
          const done = i <= idx
          return (
            <div key={s.key} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={[
                  "flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold",
                  done ? "bg-white" : "bg-white/15 text-white/80",
                ].join(" ")}
                style={done ? { color: primary } : undefined}
              >
                {s.icon}
              </div>
              <div className="text-[11px] font-semibold">{s.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OrderBigIdCard({
  orderCode,
  surface,
  primary,
  secondary,
}: {
  orderCode: string
  surface: string
  primary: string
  secondary: string
}) {
  return (
    <div className="mt-4 rounded-3xl px-5 py-6 text-right shadow-sm" style={{ backgroundColor: surface }}>
      <div className="text-3xl font-extrabold" style={{ color: primary }}>
        طلب <span style={{ color: secondary }}>{orderCode}</span>
      </div>
    </div>
  )
}

/** =============== Blocks Renderer =============== */

function DetailBlocks({
  blocks,
  order,
  labels,
  actions,
  tokens,
  renderOffers,
}: {
  blocks: OrdersBlocks[]
  order: OrdersUIItem
  labels: Required<OrdersShellLabels>
  actions?: OrdersShellActions
  tokens: Required<OrdersShellTokens>
  renderOffers?: (order: OrdersUIItem) => ReactNode
}) {
  const itemsCount = order.items.reduce((sum, it) => sum + (it.quantity ?? 0), 0)

  return (
    <div className="mt-4 space-y-4">
      {blocks.map((b, idx) => {
        if (b.enabled === false) return null

        if (b.type === "items") {
          return (
            <div key={idx} className="rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold" style={{ color: tokens.text }}>
                  {labels.itemsTitle}
                </h3>
                <div className="text-xs" style={{ color: tokens.muted }}>
                  {itemsCount} عنصر
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {order.items.map((item) => (
                  <div key={item.id + item.name} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold" style={{ color: tokens.text }}>
                        {item.name}
                      </div>
                      <div className="mt-1 text-xs" style={{ color: tokens.muted }}>
                        × {item.quantity}
                      </div>
                    </div>
                    <div className="text-sm font-bold" style={{ color: tokens.text }}>
                      {currencyFormatter.format(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        if (b.type === "delivery") {
          return (
            <div key={idx} className="rounded-2xl bg-gray-50 p-4 text-xs" style={{ color: tokens.muted }}>
              <h3 className="text-sm font-bold" style={{ color: tokens.text }}>
                {labels.deliveryTitle}
              </h3>

              <div className="mt-3 space-y-2">
                {order.guest.name ? (
                  <p>
                    <span className="font-semibold" style={{ color: tokens.text }}>
                      الاسم:
                    </span>{" "}
                    {order.guest.name}
                  </p>
                ) : null}

                {order.guest.phone ? (
                  <p>
                    <span className="font-semibold" style={{ color: tokens.text }}>
                      الهاتف:
                    </span>{" "}
                    {order.guest.phone}
                  </p>
                ) : null}

                {order.guest.address ? (
                  <p>
                    <span className="font-semibold" style={{ color: tokens.text }}>
                      العنوان:
                    </span>{" "}
                    {order.guest.address}
                  </p>
                ) : null}
              </div>
            </div>
          )
        }

        if (b.type === "summary") {
          return (
            <div key={idx} className="rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: tokens.text }}>
                  {labels.totalLabel}
                </span>
                <span className="text-base font-extrabold" style={{ color: tokens.primary }}>
                  {currencyFormatter.format(order.totalPrice)}
                </span>
              </div>
            </div>
          )
        }

        if (b.type === "actions") {
          const reorder = actions?.reorder
          const support = actions?.support

          return (
            <div key={idx} className="flex flex-wrap justify-end gap-2">
              {reorder ? (
                <Link
                  href={reorder.href}
                  className={["rounded-full px-4 py-2 text-xs font-semibold", styleButtonClass(reorder.style)].join(" ")}
                  style={
                    (reorder.style ?? "outline") === "solid"
                      ? { backgroundColor: tokens.primary }
                      : { borderColor: tokens.primary, color: tokens.primary }
                  }
                >
                  {reorder.label}
                </Link>
              ) : null}

              {support ? (
                <Link
                  href={support.href}
                  className={["rounded-full px-4 py-2 text-xs font-semibold", styleButtonClass(support.style)].join(" ")}
                  style={
                    (support.style ?? "solid") === "solid"
                      ? { backgroundColor: tokens.primary }
                      : { borderColor: tokens.primary, color: tokens.primary }
                  }
                >
                  {support.label}
                </Link>
              ) : null}
            </div>
          )
        }

        if (b.type === "offers") {
          return <div key={idx}>{renderOffers ? renderOffers(order) : null}</div>
        }

        // stepper / bigCode handled outside to keep order neat in both desktop/mobile
        return null
      })}
    </div>
  )
}

/** =============== Main Component =============== */

export function OrdersShell({
  restaurantName,
  orders,

  locale = "ar",
  dir = "rtl",

  variant = "classic",
  labels: labelsRaw,
  actions = {
    reorder: { label: "إعادة الطلب", href: "/ar/menu", style: "outline" },
    support: { label: "الدعم والمساعدة", href: "/ar/contact", style: "solid" },
  },

  layout = {
    desktop: { columns: "380px 1fr", listMaxHeight: "70vh" },
    mobile: { fullscreenDetails: true },
  },

  stepper = { enabled: true, steps: DEFAULT_STEPS, cancelledLabel: "تم إلغاء الطلب" },

  detailBlocks = DEFAULT_BLOCKS,

  hideMainHeaderOnMobileDetails = true,
  tokens: tokensOverride,

  renderOffers,
}: OrdersShellProps) {
  const labels = mergeLabels(labelsRaw)
  const tokens = resolveTokens(variant, undefined, tokensOverride) // لو عايز theme هنا: مرره من wrapper
  const [selectedId, setSelectedId] = useState<string>(orders?.[0]?.id ?? "")
  const [mobileMode, setMobileMode] = useState<"list" | "details">(orders?.length ? "list" : "list")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const selectedOrder = useMemo(() => orders.find((o) => o.id === selectedId) ?? null, [orders, selectedId])
  const hasOrders = orders.length > 0

  // tokens from variant (and can be overridden)
  const primary = tokens.primary
  const secondary = tokens.secondary
  const surface = tokens.surface

  const desktopColumns = layout.desktop?.columns ?? "380px 1fr"
  const listMaxHeight = layout.desktop?.listMaxHeight ?? "70vh"
  const mobileFullscreen = layout.mobile?.fullscreenDetails ?? true

  // Helper: render stepper & bigCode based on blocks order
  const wantStepper = detailBlocks.some((b) => b.type === "stepper" && b.enabled !== false)
  const wantBigCode = detailBlocks.some((b) => b.type === "bigCode" && b.enabled !== false)

  const showMainHeader = !(isMobile && mobileMode === "details" && hideMainHeaderOnMobileDetails)

  return (
    <main className="min-h-screen py-10" dir={dir} style={{ backgroundColor: tokens.background }}>
      <div className="mx-auto w-full max-w-6xl px-4">
        {showMainHeader ? (
          <header className="mb-6 space-y-2 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: tokens.primary }}>
              {labels.kicker}
            </p>
            <h1 className="text-3xl font-bold" style={{ color: tokens.text }}>
              {labels.title}
            </h1>
            <p className="text-sm" style={{ color: tokens.muted }}>
              {labels.subtitle.replace("{restaurant}", restaurantName)}
            </p>
          </header>
        ) : null}

        {!hasOrders ? (
          <section
            className="rounded-3xl border border-dashed p-10 text-center shadow-sm"
            style={{ borderColor: "#D1D5DB", backgroundColor: tokens.card }}
          >
            <h2 className="text-xl font-semibold" style={{ color: tokens.text }}>
              {labels.emptyTitle}
            </h2>
            <p className="mt-2 text-sm" style={{ color: tokens.muted }}>
              {labels.emptySubtitle}
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <Link
                href={labels.emptyPrimaryCtaHref}
                className="rounded-full px-5 py-2 text-sm font-medium text-white shadow hover:opacity-95"
                style={{ backgroundColor: primary }}
              >
                {labels.emptyPrimaryCtaLabel}
              </Link>

              <Link
                href={labels.emptySecondaryCtaHref}
                className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-black/5"
                style={{ borderColor: primary, color: primary }}
              >
                {labels.emptySecondaryCtaLabel}
              </Link>
            </div>
          </section>
        ) : (
          <>
            {/* Desktop/Tablet: split */}
            <div className="hidden gap-6 lg:grid" style={{ gridTemplateColumns: desktopColumns }}>
              {/* Left list */}
              <aside className="rounded-3xl border shadow-sm" style={{ borderColor: "#E5E7EB", backgroundColor: tokens.card }}>
                <div className="border-b p-5" style={{ borderColor: "#F3F4F6" }}>
                  <h2 className="text-base font-bold" style={{ color: tokens.text }}>
                    {labels.listTitle}
                  </h2>
                  <p className="mt-1 text-xs" style={{ color: tokens.muted }}>
                    {labels.listHint}
                  </p>
                </div>

                <div className="overflow-y-auto p-3" style={{ maxHeight: listMaxHeight }}>
                  <div className="space-y-2">
                    {orders.map((o) => {
                      const active = o.id === selectedId
                      const itemsCount = o.items.reduce((sum, it) => sum + (it.quantity ?? 0), 0)

                      return (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => setSelectedId(o.id)}
                          className={[
                            "w-full rounded-2xl border p-4 text-right transition",
                            active ? "shadow-sm" : "hover:bg-black/5",
                          ].join(" ")}
                          style={{
                            borderColor: active ? primary : "#E5E7EB",
                            backgroundColor: active ? `${primary}10` : tokens.card,
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-bold" style={{ color: tokens.text }}>
                                طلب #{o.id.slice(-6).toUpperCase()}
                              </div>
                              <div className="mt-1 text-xs" style={{ color: tokens.muted }}>
                                {formatDate(o.createdAtISO)}
                              </div>
                            </div>

                            <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusPillStyles[o.status]}`}>
                              {statusLabels[o.status]}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-xs">
                            <span style={{ color: tokens.muted }}>{itemsCount} عنصر</span>
                            <span className="font-bold" style={{ color: tokens.text }}>
                              {currencyFormatter.format(o.totalPrice)}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </aside>

              {/* Right details */}
              <section className="rounded-3xl border p-6 shadow-sm" style={{ borderColor: "#E5E7EB", backgroundColor: tokens.card }}>
                {selectedOrder ? (
                  <>
                    <OrderDetailsHeader
                      title={locale === "ar" ? "الطلب" : "Order"}
                      subtitle={selectedOrder.createdAtISO ? `${locale === "ar" ? "تم الإنشاء في" : "Created"} ${formatDate(selectedOrder.createdAtISO)}` : ""}
                      onBack={() => {
                        // على الديسكتوب غالبًا مش محتاج back
                        // ممكن تخليه يرجع لأول عنصر:
                        // setSelectedId(orders[0]?.id ?? "")
                      }}
                      backLabel={labels.backLabel}
                      primary={primary}
                    />

                    {wantStepper ? <OrderStepper status={selectedOrder.status} cfg={stepper} primary={primary} /> : null}
                    {wantBigCode ? (
                      <OrderBigIdCard
                        orderCode={selectedOrder.id.slice(-6).toUpperCase()}
                        surface={surface}
                        primary={primary}
                        secondary={secondary}
                      />
                    ) : null}

                    <DetailBlocks
                      blocks={detailBlocks}
                      order={selectedOrder}
                      labels={labels}
                      actions={actions}
                      tokens={tokens as Required<OrdersShellTokens>}
                      renderOffers={renderOffers}
                    />
                  </>
                ) : (
                  <div className="p-8 text-center text-sm" style={{ color: tokens.muted }}>
                    {locale === "ar" ? "اختر طلبًا من القائمة لعرض التفاصيل." : "Select an order to see details."}
                  </div>
                )}
              </section>
            </div>

            {/* Mobile: list -> details fullscreen */}
            <div className="lg:hidden">
              {mobileMode === "list" ? (
                <section className="rounded-3xl border shadow-sm" style={{ borderColor: "#E5E7EB", backgroundColor: tokens.card }}>
                  <div className="border-b p-5" style={{ borderColor: "#F3F4F6" }}>
                    <h2 className="text-base font-bold" style={{ color: tokens.text }}>
                      {labels.listTitle}
                    </h2>
                    <p className="mt-1 text-xs" style={{ color: tokens.muted }}>
                      {labels.listHint}
                    </p>
                  </div>

                  <div className="p-3">
                    <div className="space-y-2">
                      {orders.map((o) => {
                        const itemsCount = o.items.reduce((sum, it) => sum + (it.quantity ?? 0), 0)
                        const code = (o.orderNumber || o.id || "").slice(-6).toUpperCase()

                        return (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => {
                              setSelectedId(o.id)
                              setMobileMode("details")
                            }}
                            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-right transition hover:bg-gray-50"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-bold" style={{ color: tokens.text }}>
                                  طلب #{code}
                                </div>
                                <div className="mt-1 text-xs" style={{ color: tokens.muted }}>
                                  {formatDate(o.createdAtISO)}
                                </div>
                              </div>

                              <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusPillStyles[o.status]}`}>
                                {statusLabels[o.status]}
                              </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-xs">
                              <span style={{ color: tokens.muted }}>{itemsCount} عنصر</span>
                              <span className="font-bold" style={{ color: tokens.text }}>
                                {currencyFormatter.format(o.totalPrice)}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </section>
              ) : (
                <>
                  {mobileFullscreen ? (
                    <section className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: tokens.background }}>
                      <div className="px-4 pt-4">
                        <OrderDetailsHeader
                          title={locale === "ar" ? "الطلب" : "Order"}
                          subtitle={selectedOrder?.createdAtISO ? `${locale === "ar" ? "تم الإنشاء في" : "Created"} ${formatDate(selectedOrder.createdAtISO)}` : ""}
                          onBack={() => setMobileMode("list")}
                          backLabel={labels.backLabel}
                          primary={primary}
                        />
                      </div>

                      <div className="px-4 pb-8">
                        {selectedOrder ? (
                          <>
                            {wantStepper ? <OrderStepper status={selectedOrder.status} cfg={stepper} primary={primary} /> : null}
                            {wantBigCode ? (
                              <OrderBigIdCard
                                orderCode={selectedOrder.id.slice(-6).toUpperCase()}
                                surface={surface}
                                primary={primary}
                                secondary={secondary}
                              />
                            ) : null}

                            <DetailBlocks
                              blocks={detailBlocks}
                              order={selectedOrder}
                              labels={labels}
                              actions={actions}
                              tokens={tokens as Required<OrdersShellTokens>}
                              renderOffers={renderOffers}
                            />
                          </>
                        ) : (
                          <div className="p-8 text-center text-sm" style={{ color: tokens.muted }}>
                            {locale === "ar" ? "لا يوجد طلب محدد." : "No order selected."}
                          </div>
                        )}
                      </div>
                    </section>
                  ) : (
                    // لو مش fullscreen (اختياري)
                    <section className="rounded-3xl border shadow-sm" style={{ borderColor: "#E5E7EB", backgroundColor: tokens.card }}>
                      <OrderDetailsHeader
                        title={locale === "ar" ? "الطلب" : "Order"}
                        subtitle={selectedOrder?.createdAtISO ? `${locale === "ar" ? "تم الإنشاء في" : "Created"} ${formatDate(selectedOrder.createdAtISO)}` : ""}
                        onBack={() => setMobileMode("list")}
                        backLabel={labels.backLabel}
                        primary={primary}
                      />

                      <div className="p-4">
                        {selectedOrder ? (
                          <>
                            {wantStepper ? <OrderStepper status={selectedOrder.status} cfg={stepper} primary={primary} /> : null}
                            {wantBigCode ? (
                              <OrderBigIdCard
                                orderCode={selectedOrder.id.slice(-6).toUpperCase()}
                                surface={surface}
                                primary={primary}
                                secondary={secondary}
                              />
                            ) : null}

                            <DetailBlocks
                              blocks={detailBlocks}
                              order={selectedOrder}
                              labels={labels}
                              actions={actions}
                              tokens={tokens as Required<OrdersShellTokens>}
                              renderOffers={renderOffers}
                            />
                          </>
                        ) : (
                          <div className="p-8 text-center text-sm" style={{ color: tokens.muted }}>
                            {locale === "ar" ? "لا يوجد طلب محدد." : "No order selected."}
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

/** =============== Builder Wrapper (اختياري لكن مفيد جدًا) ===============
 *  استخدمه داخل renderSection لما section.type = "ordersShell"
 *  (وبكده تقدر تبعت theme من السيرفر)
 */

// أنواع بسيطة (لو عندك types جاهزة في مشروعك، استخدمها بدل دي)
export type BuilderThemeLike = {
  palette?: {
    primary?: string
    secondary?: string
    surface?: string
    background?: string
    card?: string
    text?: string
    muted?: string
  }
}

export type OrdersShellSection = {
  type: "ordersShell"
  props?: any
}

// options مشابهة للي عندك (عدّلها على types عندك)
export type OrdersShellRenderOptions = {
  theme?: BuilderThemeLike
  locale: "ar" | "en"
  dataSources: {
    orders: OrdersUIItem[]
    restaurant?: { name?: { ar?: string; en?: string } }
  }
}

// ملاحظة: الرندر يتم من السيرفر عبر orders-shell-server.tsx
