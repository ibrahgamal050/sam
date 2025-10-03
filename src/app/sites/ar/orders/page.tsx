export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import Link from "next/link"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { resolveRestaurantFromHeaders } from "@/lib/domain/restaurant-context"
import { getOrdersForCustomer } from "@/lib/services/order-service"
import type { IRestaurant } from "@/types/restaurant"
import type { OrderStatus } from "@/types/order"

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

const currencyFormatter = new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 })
const dateFormatter = new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" })

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  const { restaurant } = await resolveRestaurantFromHeaders()
  const typedRestaurant = restaurant as IRestaurant | null

  if (!typedRestaurant) {
    return <div className="p-6 text-center text-gray-600">المطعم غير موجود أو غير متاح حالياً.</div>
  }

  if (!session?.user?.id) {
    return (
      <section className="mx-auto mt-16 max-w-2xl rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm" dir="rtl">
        <h1 className="text-2xl font-semibold text-gray-900">تحتاج إلى تسجيل الدخول</h1>
        <p className="mt-3 text-sm text-gray-600">
          لتتمكن من استعراض طلباتك السابقة، يرجى تسجيل الدخول إلى حسابك أولاً.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href={`/auth/signin?callbackUrl=${encodeURIComponent("/ar/orders")}`}
            className="rounded-full bg-[#6c5ce7] px-5 py-2 text-sm font-medium text-white shadow hover:bg-[#5a4bd1]"
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/auth/register"
            className="rounded-full border border-[#6c5ce7] px-5 py-2 text-sm font-medium text-[#6c5ce7] hover:bg-[#6c5ce7]/10"
          >
            إنشاء حساب جديد
          </Link>
        </div>
      </section>
    )
  }

  const rawOrders = await getOrdersForCustomer(session.user.id, typedRestaurant._id?.toString())

  const orders = rawOrders.map((order) => ({
    id: order._id?.toString() ?? "",
    status: order.status,
    totalPrice: Number(order.totalPrice ?? 0),
    createdAt: order.createdAt ? dateFormatter.format(new Date(order.createdAt)) : "",
    guest: {
      name: order.guest?.name ?? session.user?.name ?? "",
      phone: order.guest?.phone ?? "",
      address: order.guest?.address ?? "",
    },
    items: order.items.map((item) => ({
      id: typeof item.productId === "string" ? item.productId : item.productId?.toString?.() ?? "",
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
  }))

  return (
    <main className="min-h-screen bg-gray-50 py-12" dir="rtl">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4">
        <header className="space-y-2 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#6c5ce7]">لوحة العميل</p>
          <h1 className="text-3xl font-bold text-gray-900">طلباتي</h1>
          <p className="text-sm text-gray-500">
            راجع آخر طلباتك لدى {typedRestaurant.name?.ar ?? "مطعمنا"} وتابع حالة كل طلب بسهولة.
          </p>
        </header>

        {orders.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">لا توجد طلبات بعد</h2>
            <p className="mt-2 text-sm text-gray-600">
              لم تقم بإرسال أي طلبات حتى الآن. تصفّح المنيو وابدأ بتجربة أطباقنا اليوم.
            </p>
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
                الذهاب لإتمام الطلب
              </Link>
            </div>
          </section>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <article key={order.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 text-right sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">طلب #{order.id.slice(-6).toUpperCase()}</h2>
                    <p className="text-xs text-gray-500">تم الإنشاء في {order.createdAt}</p>
                  </div>
                  <span className={`inline-flex items-center justify-center rounded-full px-4 py-1 text-xs font-semibold ${statusStyles[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>

                <div className="grid gap-4 py-4 text-sm text-gray-700 lg:grid-cols-[1.8fr_1fr]">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">المنتجات</h3>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id + item.name} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-gray-500">× {item.quantity}</span>
                          <span className="text-sm font-semibold text-gray-800">
                            {currencyFormatter.format(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 rounded-2xl bg-gray-50 p-4 text-xs text-gray-600">
                    <h3 className="text-sm font-semibold text-gray-900">بيانات التوصيل</h3>
                    {order.guest.name && <p><span className="font-medium">الاسم:</span> {order.guest.name}</p>}
                    {order.guest.phone && <p><span className="font-medium">الهاتف:</span> {order.guest.phone}</p>}
                    {order.guest.address && <p><span className="font-medium">العنوان:</span> {order.guest.address}</p>}
                    <p className="mt-4 flex items-center justify-between text-sm text-gray-800">
                      <span className="font-semibold">إجمالي الطلب</span>
                      <span className="text-base font-bold text-[#6c5ce7]">{currencyFormatter.format(order.totalPrice)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
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
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
