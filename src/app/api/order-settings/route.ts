// src/app/api/v1/public/order-settings/route.ts
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import dbConnect from "@/lib/db"
import OrderSettings from "@/models/OrderSettings"
import Restaurant from "@/models/restaurant"
import type { NextRequest } from "next/server"

/** قيم افتراضية سليمة للاستهلاك في الواجهة */
const DEFAULT_SETTINGS = {
  types: {
    dine_in: true,
    pickup: true,
    delivery: false,
  },
  minOrderAmount: 0,
  scheduledOrders: {
    enabled: false,
    minHoursBefore: 2,
  },
  workingHours: [
    { day: "sat", open: "09:00", close: "23:00", isClosed: false },
    { day: "sun", open: "09:00", close: "23:00", isClosed: false },
    { day: "mon", open: "09:00", close: "23:00", isClosed: false },
    { day: "tue", open: "09:00", close: "23:00", isClosed: false },
    { day: "wed", open: "09:00", close: "23:00", isClosed: false },
    { day: "thu", open: "09:00", close: "23:00", isClosed: false },
    { day: "fri", open: "09:00", close: "23:00", isClosed: false },
  ],
  paymentMethods: {
    cash: true,
    card: true,
    online: false,
  },
  delivery: {
    enabled: false,
    baseFee: 0,
    feePerKm: 0,
    freeDeliveryAbove: null as number | null,
    estimatedTime: "30-45 min",
  },
}

/** دمج آمن مع القيم الافتراضية */
function withDefaults(doc: any | null) {
  if (!doc) return DEFAULT_SETTINGS
  const obj = typeof doc.toObject === "function" ? doc.toObject() : doc
  return {
    ...DEFAULT_SETTINGS,
    ...obj,
    types: { ...DEFAULT_SETTINGS.types, ...(obj?.types ?? {}) },
    scheduledOrders: { ...DEFAULT_SETTINGS.scheduledOrders, ...(obj?.scheduledOrders ?? {}) },
    paymentMethods: { ...DEFAULT_SETTINGS.paymentMethods, ...(obj?.paymentMethods ?? {}) },
    delivery: { ...DEFAULT_SETTINGS.delivery, ...(obj?.delivery ?? {}) },
    workingHours: Array.isArray(obj?.workingHours) && obj.workingHours.length > 0
      ? obj.workingHours
      : DEFAULT_SETTINGS.workingHours,
  }
}

/** ردّ خطأ موحّد */
function err(status: number, code: string, message?: string) {
  return Response.json({ error: code, message }, { status, headers: nocacheHeaders() })
}

function nocacheHeaders() {
  return {
    "Cache-Control": "no-store, max-age=0",
  }
}

/**
 * GET /api/v1/public/order-settings
 * مصادر تحديد المطعم/الفرع (بالترتيب):
 * 1) ?restaurantId=... (ObjectId) اختياري
 *    و ?branchId=... اختياري
 * 2) resolveRestaurantFromHeaders(request) من الدومين/الساب دومين
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const restaurantIdParam = searchParams.get("restaurantId")
    const branchIdParam = searchParams.get("branchId")

    let restaurantId = restaurantIdParam || null
    let branchId = branchIdParam || null

  
    // تأكيد وجود مطعم فعليًا
    const restaurant = await Restaurant.findById(restaurantId).select("_id")
    if (!restaurant) return err(404, "RESTAURANT_NOT_FOUND")

    // لو عندك إعدادات لكل فرع، ممكن تكون بتخزّن branchId جوه OrderSettings
    // هنا بنجرب نجيب إعدادات الفرع أولاً، لو مش موجودة نرجع إعدادات المطعم
    let settings = null

    if (branchId) {
      settings = await OrderSettings.findOne({
        restaurantId: restaurant._id,
        branchId, // لو مش مستخدم في الموديل عندك شيل السطر ده
      })
    }

    if (!settings) {
      settings = await OrderSettings.findOne({ restaurantId: restaurant._id })
    }

    const payload = withDefaults(settings)

    // مسموح بالكاش القصير للـ public (لو حابب بدّلها)
    return Response.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    })
  } catch (e: any) {
    console.error("[public/order-settings] GET failed:", e)
    return err(500, "INTERNAL_SERVER_ERROR", e?.message || "unknown")
  }
}
