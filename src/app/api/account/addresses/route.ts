import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { randomUUID } from "crypto"

import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/db"
import { User } from "@/models/User"

const baseAddressSchema = z.object({
  name: z.string().min(2, { message: "الاسم يجب أن يتكوّن من حرفين على الأقل" }),
  address: z.string().min(4, { message: "أدخل عنوانًا صالحًا" }),
  city: z.string().min(2, { message: "أدخل اسم المدينة" }),
  lat: z.coerce.number({ invalid_type_error: "خطوط العرض يجب أن تكون رقمًا" }),
  lng: z.coerce.number({ invalid_type_error: "خطوط الطول يجب أن تكون رقمًا" }),
  isDefault: z.boolean().optional(),
})

const createAddressSchema = baseAddressSchema.extend({
  id: z.string().trim().optional(),
})

const toResponseAddress = (address: any) => ({
  id: address._id.toString(),
  name: address.name,
  address: address.address,
  city: address.city,
  lat: address.lat,
  lng: address.lng,
  isDefault: Boolean(address.isDefault),
  createdAt: address.createdAt ?? null,
  updatedAt: address.updatedAt ?? null,
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    const addresses = user.savedAddresses.map((address) => toResponseAddress(address))

    addresses.sort((a, b) => Number(b.isDefault) - Number(a.isDefault))

    return NextResponse.json({ addresses })
  } catch (error) {
    console.error("Failed to load addresses", error)
    return NextResponse.json({ error: "تعذّر تحميل العناوين" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await request.json().catch(() => null)

    if (!payload) {
      return NextResponse.json({ error: "الرجاء إرسال بيانات صالحة" }, { status: 400 })
    }

    const parsed = createAddressSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json({ error: "بيانات غير صحيحة", details: parsed.error.format() }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    const { id, name, address, city, lat, lng, isDefault } = parsed.data
    const generatedId = id ?? randomUUID()

    const alreadyExists = user.savedAddresses.some((item) => item._id === generatedId)
    if (alreadyExists) {
      return NextResponse.json({ error: "يوجد عنوان محفوظ بنفس المعرف" }, { status: 409 })
    }

    if (isDefault) {
      user.savedAddresses.forEach((item) => {
        item.isDefault = false
      })
    }

    const newAddress = {
      _id: generatedId,
      name,
      address,
      city,
      lat,
      lng,
      isDefault: isDefault ?? user.savedAddresses.length === 0,
    }

    user.savedAddresses.push(newAddress as any)
    await user.save()

    const savedAddress = user.savedAddresses.find((item) => item._id === generatedId)

    return NextResponse.json(toResponseAddress(savedAddress))
  } catch (error) {
    console.error("Failed to create address", error)
    return NextResponse.json({ error: "تعذّر حفظ العنوان" }, { status: 500 })
  }
}
