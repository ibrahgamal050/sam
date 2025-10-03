import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/db"
import { User } from "@/models/User"

const profileSchema = z.object({
  name: z.string().min(2, { message: "الاسم يجب أن يتكوّن من حرفين على الأقل" }),
  email: z.string().email({ message: "أدخل بريدًا إلكترونيًا صالحًا" }),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  marketingOptIn: z.boolean().optional(),
})

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await request.json().catch(() => null)

    if (!payload) {
      return NextResponse.json({ error: "الرجاء إرسال بيانات صالحة" }, { status: 400 })
    }

    const parsed = profileSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json({ error: "بيانات غير صحيحة", details: parsed.error.format() }, { status: 400 })
    }

    const { name, email, phone } = parsed.data

    await dbConnect()

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: user._id } })
      if (existingEmail) {
        return NextResponse.json({ error: "هذا البريد مسجّل بالفعل" }, { status: 409 })
      }
    }

    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ phone, _id: { $ne: user._id } })
      if (existingPhone) {
        return NextResponse.json({ error: "رقم الجوال مستخدم مسبقًا" }, { status: 409 })
      }
    }

    user.name = name
    user.email = email
    user.phone = phone

    await user.save()

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    })
  } catch (error) {
    console.error("Failed to update profile", error)
    return NextResponse.json({ error: "تعذّر تحديث الملف الشخصي" }, { status: 500 })
  }
}

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

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    })
  } catch (error) {
    console.error("Failed to fetch profile", error)
    return NextResponse.json({ error: "تعذّر جلب بيانات الحساب" }, { status: 500 })
  }
}
