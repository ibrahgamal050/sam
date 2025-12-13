// apps/meelza-api/src/app/api/v1/public/account/addresses/route.ts
import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { z } from "zod"

import dbConnect from "@/lib/db"
import User from "@/models/User"
import { getAuth } from "@/lib/auth/auth-server"

export const runtime = "nodejs"

// Upsert: لو المستخدم مش موجود ننشئه من بيانات الـ ID
async function ensureUser(userId: string, payload: any) {
  await dbConnect()
  let user = await User.findById(userId)

  if (!user) {
    user = new User({
      _id: userId, // يفترض أن sub هو ObjectId أو string متوافق مع الـ schema
      email: payload?.email ?? undefined,
      name: payload?.name ?? undefined,
      picture: payload?.picture ?? undefined,
      savedAddresses: [],
    })
    await user.save()
  }

  return user
}

// --- Zod schemas ---
const baseAddressSchema = z.object({
  name: z.string().min(2, { message: "الاسم يجب أن يتكوّن من حرفين على الأقل" }),
  address: z.string().min(4, { message: "أدخل عنوانًا صالحًا" }),
  city: z.string().min(2, { message: "أدخل اسم المدينة" }),
  lat: z.coerce.number({ invalid_type_error: "خطوط العرض يجب أن تكون رقمًا" }),
  lng: z.coerce.number({ invalid_type_error: "خطوط الطول يجب أن تكون رقمًا" }),
  isDefault: z.boolean().optional(),
  tenantKey: z.string().trim().optional(),
})
const createAddressSchema = baseAddressSchema.extend({ id: z.string().trim().optional() })

const toResponseAddress = (a: any) => ({
  id: String(a._id),
  name: a.name,
  address: a.address,
  city: a.city,
  lat: a.lat,
  lng: a.lng,
  isDefault: !!a.isDefault,
  tenantKey: a.tenantKey ?? null,
  createdAt: a.createdAt ?? null,
  updatedAt: a.updatedAt ?? null,
})

// --- GET: ارجع العناوين، ولو مفيش مستخدم اعمله upsert من JWT ---
export async function GET(req: NextRequest) {
  try {
    const { userId, payload } = await getAuth(req)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await ensureUser(userId, payload)
    const tenantKeyParam = req.nextUrl.searchParams.get("tenantKey")
    const tenantKey = tenantKeyParam ? tenantKeyParam.toLowerCase() : null

    const addresses = user.savedAddresses.map(toResponseAddress)
    const filtered = tenantKey
      ? addresses.filter((addr: any) => addr.tenantKey == null || addr.tenantKey.toLowerCase() === tenantKey)
      : addresses

    filtered.sort((a: any, b: any) => {
      const aTenantMatch = tenantKey && a.tenantKey && a.tenantKey.toLowerCase() === tenantKey ? 1 : 0
      const bTenantMatch = tenantKey && b.tenantKey && b.tenantKey.toLowerCase() === tenantKey ? 1 : 0
      if (aTenantMatch !== bTenantMatch) {
        return bTenantMatch - aTenantMatch
      }
      if (a.isDefault !== b.isDefault) {
        return Number(b.isDefault) - Number(a.isDefault)
      }
      return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0)
    })

    return NextResponse.json({ addresses: filtered }, { headers: { "Cache-Control": "no-store" } })
  } catch (e) {
    console.error("Failed to load addresses", e)
    return NextResponse.json({ error: "تعذّر تحميل العناوين" }, { status: 500 })
  }
}

// --- POST: أضف عنوانًا جديدًا، ولو مفيش مستخدم اعمله upsert أولاً ---
export async function POST(req: NextRequest) {
  try {
    const { userId, payload } = await getAuth(req)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: "الرجاء إرسال بيانات صالحة" }, { status: 400 })

    const parsed = createAddressSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "بيانات غير صحيحة", details: parsed.error.format() }, { status: 400 })
    }

    const user = await ensureUser(userId, payload)

    const { id, name, address, city, lat, lng, isDefault, tenantKey } = parsed.data
    const normalizedTenantKey = tenantKey ? tenantKey.toLowerCase() : null
    const generatedId = id ?? randomUUID()

    if (isDefault) {
      user.savedAddresses.forEach((i: any) => {
        const existingKey = typeof i.tenantKey === "string" ? i.tenantKey.toLowerCase() : null
        if (existingKey === normalizedTenantKey) {
          i.isDefault = false
        }
      })
    }

    user.savedAddresses.push({
      _id: generatedId,
      name,
      address,
      city,
      lat,
      lng,
      isDefault:
        isDefault ??
        user.savedAddresses.filter(
          (i: any) => (i.tenantKey ? i.tenantKey.toLowerCase() === normalizedTenantKey : normalizedTenantKey == null),
        ).length === 0,
      tenantKey: normalizedTenantKey,
    } as any)

    await user.save()

    const saved = user.savedAddresses.find((i: any) => String(i._id) === String(generatedId))
    return NextResponse.json(toResponseAddress(saved), { headers: { "Cache-Control": "no-store" } })
  } catch (e) {
    console.error("Failed to create address", e)
    return NextResponse.json({ error: "تعذّر حفظ العنوان" }, { status: 500 })
  }
}
