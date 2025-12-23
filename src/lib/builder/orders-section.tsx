import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { mergeThemes } from "./theme"
import type { BuilderRenderOptions, Section } from "./types"

const statusLabels: Record<string, string> = {
  pending: "في انتظار التأكيد",
  confirmed: "تم التأكيد",
  preparing: "قيد التحضير",
  ready: "جاهز",
  delivered: "تم التوصيل",
  canceled: "تم الإلغاء",
  cancelled: "تم الإلغاء",
}

const statusTone = (status: string) => {
  const key = status.toLowerCase()
  if (key === "pending" || key === "confirmed" || key === "preparing") return "warning"
  if (key === "ready") return "accent"
  if (key === "delivered") return "success"
  if (key === "canceled" || key === "cancelled") return "danger"
  return "muted"
}

const withAlpha = (color: string, alpha: string) => {
  if (color.startsWith("#")) return `${color}${alpha}`
  return color
}

const formatDate = (value?: string | null, locale: string = "ar") => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

type OrdersListSection = Section & {
  type: "orders-list"
  data?: {
    title?: string
    subtitle?: string
    emptyTitle?: string
    emptySubtitle?: string
  }
}

export const renderOrdersListSection = (
  section: OrdersListSection,
  options: BuilderRenderOptions = {}
): ReactNode => {
  const orders = Array.isArray(options.dataSources?.orders) ? (options.dataSources as any).orders : []
  const locale = options.locale ?? "ar"
  const direction: "rtl" | "ltr" = locale === "ar" ? "rtl" : "ltr"

  const theme = mergeThemes(options.theme, section.theme)
  const palette = theme?.palette ?? {}
  const colors = {
    primary: palette.primary ?? "#6c5ce7",
    accent: palette.accent ?? "#ff5c2b",
    text: palette.text ?? "#111827",
    muted: palette.muted ?? "#6b7280",
    success: palette.success ?? "#16a34a",
    warning: palette.warning ?? "#f59e0b",
    danger: palette.danger ?? "#27225bff",
  }

  const headerTitle = section.data?.title ?? "طلباتي"
  const headerSubtitle = section.data?.subtitle ?? "تابع حالة طلباتك وتفاصيلها."
  const emptyTitle = section.data?.emptyTitle ?? "لا توجد طلبات حالياً"
  const emptySubtitle = section.data?.emptySubtitle ?? "ابدأ الطلب من المنيو وستظهر هنا."

  const cards = orders.map((order: any) => {
    const status = String(order.status ?? "pending").toLowerCase()
    const tone = statusTone(status)
    const badgeColors: Record<string, { bg: string; text: string }> = {
      success: { bg: withAlpha(colors.success, "1A"), text: colors.success },
      warning: { bg: withAlpha(colors.warning, "1A"), text: colors.warning },
      danger: { bg: withAlpha(colors.danger, "1A"), text: colors.danger },
      accent: { bg: withAlpha(colors.accent, "1A"), text: colors.accent },
      muted: { bg: "#f3f4f6", text: "#374151" },
    }
    const badgeColor = badgeColors[tone] ?? badgeColors.muted
    const total = Number(order.totalPrice ?? 0)
    const currency = order.currency ?? "EGP"
    const itemsCount = Array.isArray(order.items)
      ? order.items.reduce((sum: number, item: any) => sum + Number(item.quantity ?? 0), 0)
      : 0
    const createdIso = order.createdAtISO ?? order.createdAt ?? null
    const orderLabel = order.orderNumber ?? order.orderId ?? order.id ?? "—"

    return (
      <article
        key={order.id ?? order.orderId ?? order.orderNumber ?? Math.random().toString(16)}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900" dir={direction}>
              طلب #{orderLabel}
            </div>
            <div className="mt-1 text-xs text-gray-500">{formatDate(createdIso, locale)}</div>
          </div>
          <span
            className={cn("inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold")}
            style={{ backgroundColor: badgeColor.bg, color: badgeColor.text }}
          >
            {statusLabels[status] ?? status}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-gray-600" dir={direction}>
          <span>{itemsCount} عنصر</span>
          <span className="text-sm font-bold text-gray-900">
            {Number.isFinite(total) ? `${total.toFixed(2)} ${currency}` : currency}
          </span>
        </div>
      </article>
    )
  })

  return (
    <section
      key={section.id}
      data-section={section.id}
      dir={direction}
      className="w-full"
      style={{
        ["--mz-primary" as string]: colors.primary,
        ["--mz-accent" as string]: colors.accent,
        ["--mz-text" as string]: colors.text,
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 space-y-1 text-right">
          <h2 className="text-2xl font-bold text-gray-900">{headerTitle}</h2>
          <p className="text-sm text-gray-500">{headerSubtitle}</p>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">{emptyTitle}</h3>
            <p className="mt-2 text-sm text-gray-600">{emptySubtitle}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{cards}</div>
        )}
      </div>
    </section>
  )
}
