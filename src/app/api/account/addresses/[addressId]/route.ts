import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/db"
import { User } from "@/models/User"

const updateAddressSchema = z
  .object({
    name: z.string().min(2, { message: "الاسم يجب أن يتكوّن من حرفين على الأقل" }).optional(),
    address: z.string().min(4, { message: "أدخل عنوانًا صالحًا" }).optional(),
    city: z.string().min(2, { message: "أدخل اسم المدينة" }).optional(),
    lat: z.coerce.number({ invalid_type_error: "خطوط العرض يجب أن تكون رقمًا" }).optional(),
    lng: z.coerce.number({ invalid_type_error: "خطوط الطول يجب أن تكون رقمًا" }).optional(),
    isDefault: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "يجب تحديد قيمة واحدة على الأقل للتعديل",
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

export async function PUT(request: Request, { params }: { params: { addressId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await request.json().catch(() => null)

    if (!payload) {
      return NextResponse.json({ error: "الرجاء إرسال بيانات صالحة" }, { status: 400 })
    }

    const parsed = updateAddressSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json({ error: "بيانات غير صحيحة", details: parsed.error.format() }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    const target = user.savedAddresses.find((address) => address._id === params.addressId)

    if (!target) {
      return NextResponse.json({ error: "العنوان غير موجود" }, { status: 404 })
    }

    const { name, address, city, lat, lng, isDefault } = parsed.data

    if (typeof name === "string") target.name = name
    if (typeof address === "string") target.address = address
    if (typeof city === "string") target.city = city
    if (typeof lat === "number") target.lat = lat
    if (typeof lng === "number") target.lng = lng

    if (typeof isDefault === "boolean" && isDefault) {
      user.savedAddresses.forEach((addr) => {
        addr.isDefault = addr._id === params.addressId
      })
    } else if (typeof isDefault === "boolean" && !isDefault && target.isDefault) {
      // Prevent removing all defaults; keep at least one default address
      const hasOtherDefault = user.savedAddresses.some((addr) => addr._id !== params.addressId && addr.isDefault)
      if (hasOtherDefault) {
        target.isDefault = false
      }
    }

    await user.save()

    const updated = user.savedAddresses.find((addr) => addr._id === params.addressId)

    return NextResponse.json(toResponseAddress(updated))
  } catch (error) {
    console.error("Failed to update address", error)
    return NextResponse.json({ error: "تعذّر تحديث العنوان" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { addressId: string } }) {
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

    const initialLength = user.savedAddresses.length
    user.savedAddresses = user.savedAddresses.filter((address) => address._id !== params.addressId)

    if (user.savedAddresses.length === initialLength) {
      return NextResponse.json({ error: "العنوان غير موجود" }, { status: 404 })
    }

    if (!user.savedAddresses.some((address) => address.isDefault) && user.savedAddresses.length > 0) {
      user.savedAddresses[0].isDefault = true
    }

    await user.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete address", error)
    return NextResponse.json({ error: "تعذّر حذف العنوان" }, { status: 500 })
  }
}
