"use client"

import Link from "next/link"
import { useMemo,useEffect, useState } from "react"
import type { OrdersUIItem } from "./page"
import type { OrderStatus } from "@/types/order"

type StepKey = "pending" | "confirmed" | "preparing" | "delivered"

const steps: { key: StepKey; label: string; emoji: string }[] = [
  { key: "pending", label: "في المعالجة", emoji: "↻" },
  { key: "confirmed", label: "تم التأكيد", emoji: "🔥" },
  { key: "preparing", label: "قيد التحضير", emoji: "🍔" },
  { key: "delivered", label: "تم التسليم", emoji: "✓" },
]

function stepIndexFromStatus(status: OrderStatus) {
  if (status === "cancelled") return -1
  if (status === "pending") return 0
  if (status === "confirmed") return 1
  if (status === "preparing") return 2
  if (status === "delivered") return 3
  return 0
}

function OrderDetailsHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string
  subtitle?: string
  onBack?: () => void
}) {
  return (
    <div className="rounded-3xl bg-[#4B2518] px-4 py-4 text-white shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15"
        >
          <span className="text-base">←</span>
          <span>رجوع للطلبات</span>
        </button>

        <div className="text-right">
          <div className="text-lg font-extrabold">{title}</div>
          {subtitle ? <div className="text-xs text-white/70">{subtitle}</div> : null}
        </div>
      </div>
    </div>
  )
}

function OrderStepper({ status }: { status: OrderStatus }) {
  const idx = stepIndexFromStatus(status)

  if (status === "cancelled") {
    return (
      <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-right text-sm font-semibold text-red-700">
        تم إلغاء الطلب
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-3xl bg-[#4B2518] px-4 py-4 text-white">
      <div className="relative flex items-center justify-between">
        {/* line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2">
          <div className="h-1 rounded-full bg-white/20" />
          <div
            className="h-1 rounded-full bg-white/70"
            style={{ width: `${(idx / 3) * 100}%` }}
          />
        </div>

        {steps.map((s, i) => {
          const done = i <= idx
          return (
            <div key={s.key} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={[
                  "flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold",
                  done ? "bg-white text-[#4B2518]" : "bg-white/15 text-white/80",
                ].join(" ")}
              >
                {s.emoji}
              </div>
              <div className="text-[11px] font-semibold">{s.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OrderBigIdCard({ orderCode }: { orderCode: string }) {
  return (
    <div className="mt-4 rounded-3xl bg-[#F5EBDD] px-5 py-6 text-right shadow-sm">
      <div className="text-3xl font-extrabold text-[#4B2518]">
        طلب <span className="text-[#D43B2A]">{orderCode}</span>
      </div>
    </div>
  )
}


const statusLabels: Record<OrderStatus, string> = {
  pending: "في انتظار التأكيد",
  confirmed: "تم التأكيد",
  preparing: "قيد التحضير",
  delivered: "تم التوصيل",
  cancelled: "تم الإلغاء",
}

const statusStyles: Record<OrderStatus, string> = {
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

export default function OrdersClient({
  restaurantName,
  orders,
}: {
  restaurantName: string
  orders: OrdersUIItem[]
}) {
  const [selectedId, setSelectedId] = useState<string>(orders?.[0]?.id ?? "")
  const [mobileMode, setMobileMode] = useState<"list" | "details">(orders?.length ? "list" : "list")
const [isMobile, setIsMobile] = useState(false)

useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 1024)
  check()
  window.addEventListener("resize", check)
  return () => window.removeEventListener("resize", check)
}, [])

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId]
  )

  const hasOrders = orders.length > 0

  return (
    <main className="min-h-screen bg-gray-50 py-10" dir="rtl">
      <div className="mx-auto w-full max-w-6xl px-4">
       {!(isMobile && mobileMode === "details") && (
  <header className="mb-6 space-y-2 text-right">
    <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#6c5ce7]">
      لوحة العميل
    </p>
    <h1 className="text-3xl font-bold text-gray-900">طلباتي</h1>
    <p className="text-sm text-gray-500">
      راجع آخر طلباتك لدى {restaurantName} وتابع حالة كل طلب بسهولة.
    </p>
  </header>
)}

        {!hasOrders ? (
          <section className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">لا توجد طلبات بعد</h2>
            <p className="mt-2 text-sm text-gray-600">لم تقم بإرسال أي طلبات حتى الآن. تصفّح المنيو وابدأ اليوم.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/ar/menu"
                className="rounded-full bg-[#6c5ce7] px-5 py-2 text-sm font-medium text-white shadow hover:bg-[#5a4bd1]"
              >
                تصفح المنيو
              </Link>
              <Link
                href="/ar/checkout"
                className="rounded-full border border-[#6c5ce7] px-5 py-2 text-sm font-medium text-[#6c5ce7] hover:bg-[#6c5ce7]/10"
              >
                إتمام الطلب
              </Link>
            </div>
          </section>
        ) : (
          <>
            {/* DESKTOP/TABLET: Split layout */}
            <div className="hidden gap-6 lg:grid lg:grid-cols-[380px_1fr]">
              {/* Left list */}
              <aside className="rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 p-5">
                  <h2 className="text-base font-bold text-gray-900">قائمة الطلبات</h2>
                  <p className="mt-1 text-xs text-gray-500">اضغط على أي طلب لعرض التفاصيل.</p>
                </div>

                <div className="max-h-[70vh] overflow-y-auto p-3">
                  <div className="space-y-2">
                    {orders.map((o) => {
                      const active = o.id === selectedId
                      return (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => setSelectedId(o.id)}
                          className={[
                            "w-full rounded-2xl border p-4 text-right transition",
                            active
                              ? "border-[#6c5ce7] bg-[#6c5ce7]/5 shadow-sm"
                              : "border-gray-200 bg-white hover:bg-gray-50",
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-bold text-gray-900">
                                طلب #{o.id.slice(-6).toUpperCase()}
                              </div>
                              <div className="mt-1 text-xs text-gray-500">{formatDate(o.createdAtISO)}</div>
                            </div>

                            <span
                              className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyles[o.status]}`}
                            >
                              {statusLabels[o.status]}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              {o.items.reduce((sum, it) => sum + (it.quantity ?? 0), 0)} عنصر
                            </span>
                            <span className="font-bold text-gray-900">{currencyFormatter.format(o.totalPrice)}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </aside>

              {/* Right details */}
              <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
               {selectedOrder ? (
  <>
    <OrderDetailsHeader
      title="الطلب"
      subtitle={`تم الإنشاء في ${formatDate(selectedOrder.createdAtISO)}`}
      onBack={() => {
        // في الديسكتوب: الرجوع يعني "فك التحديد" أو يرجع لأول طلب
        // اختار اللي تحبه
        // setSelectedId(orders[0]?.id ?? "")
      }}
    />

    <OrderStepper status={selectedOrder.status} />

    <OrderBigIdCard orderCode={selectedOrder.id.slice(-6).toUpperCase()} />

    {/* هنا بقى تحط بقية الكروت: المنتجات + بيانات التوصيل + الإجمالي */}
    {/* (سيب نفس بلوكاتك القديمة للمنتجات والتوصيل زي ما هي) */}
  </>
) : (
  <div className="p-8 text-center text-sm text-gray-600">اختر طلبًا من القائمة لعرض التفاصيل.</div>
)}

              </section>
            </div>

            {/* MOBILE: List -> Details fullscreen */}
            <div className="lg:hidden">
              {mobileMode === "list" ? (
                <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-100 p-5">
                    <h2 className="text-base font-bold text-gray-900">قائمة الطلبات</h2>
                    <p className="mt-1 text-xs text-gray-500">اضغط على أي طلب لعرض التفاصيل.</p>
                  </div>

                  <div className="p-3">
                    <div className="space-y-2">
                      {orders.map((o) => (
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
                              <div className="text-sm font-bold text-gray-900">
                                طلب #{o.id.slice(-6).toUpperCase()}
                              </div>
                              <div className="mt-1 text-xs text-gray-500">{formatDate(o.createdAtISO)}</div>
                            </div>
                            <span
                              className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyles[o.status]}`}
                            >
                              {statusLabels[o.status]}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              {o.items.reduce((sum, it) => sum + (it.quantity ?? 0), 0)} عنصر
                            </span>
                            <span className="font-bold text-gray-900">{currencyFormatter.format(o.totalPrice)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              ) : (
                <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
                 <OrderDetailsHeader
  title="الطلب"
  subtitle={selectedOrder ? `تم الإنشاء في ${formatDate(selectedOrder.createdAtISO)}` : ""}
  onBack={() => setMobileMode("list")}
/>

{selectedOrder ? (
  <>
    <OrderStepper status={selectedOrder.status} />
    <OrderBigIdCard orderCode={selectedOrder.id.slice(-6).toUpperCase()} />

    {/* وبعدين نفس تفاصيل المنتجات + التوصيل + الإجمالي */}
  </>
) : (
  <div className="p-8 text-center text-sm text-gray-600">لا يوجد طلب محدد.</div>
)}


                  {/* Details */}
                  {selectedOrder ? (
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">تم الإنشاء في {formatDate(selectedOrder.createdAtISO)}</p>
                        </div>
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyles[selectedOrder.status]}`}
                        >
                          {statusLabels[selectedOrder.status]}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        <h3 className="text-sm font-bold text-gray-900">المنتجات</h3>
                        <div className="space-y-2">
                          {selectedOrder.items.map((item) => (
                            <div
                              key={item.id + item.name}
                              className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3"
                            >
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-gray-900">{item.name}</div>
                                <div className="mt-1 text-xs text-gray-500">× {item.quantity}</div>
                              </div>
                              <div className="text-sm font-bold text-gray-900">
                                {currencyFormatter.format(item.price * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-2xl bg-gray-50 p-4 text-xs text-gray-600">
                          <h3 className="text-sm font-bold text-gray-900">بيانات التوصيل</h3>
                          <div className="mt-3 space-y-2">
                            {selectedOrder.guest.name && (
                              <p>
                                <span className="font-semibold">الاسم:</span> {selectedOrder.guest.name}
                              </p>
                            )}
                            {selectedOrder.guest.phone && (
                              <p>
                                <span className="font-semibold">الهاتف:</span> {selectedOrder.guest.phone}
                              </p>
                            )}
                            {selectedOrder.guest.address && (
                              <p>
                                <span className="font-semibold">العنوان:</span> {selectedOrder.guest.address}
                              </p>
                            )}
                          </div>

                          <div className="mt-4 flex items-center justify-between text-sm text-gray-900">
                            <span className="font-bold">إجمالي الطلب</span>
                            <span className="text-base font-extrabold text-[#6c5ce7]">
                              {currencyFormatter.format(selectedOrder.totalPrice)}
                            </span>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                              href="/ar/menu"
                              className="rounded-full border border-[#6c5ce7] px-4 py-2 text-xs font-medium text-[#6c5ce7] hover:bg-[#6c5ce7]/10"
                            >
                              إعادة الطلب
                            </Link>
                            <Link
                              href="/ar/contact"
                              className="rounded-full bg-[#6c5ce7] px-4 py-2 text-xs font-medium text-white shadow hover:bg-[#5a4bd1]"
                            >
                              الدعم والمساعدة
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-sm text-gray-600">لا يوجد طلب محدد.</div>
                  )}
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
