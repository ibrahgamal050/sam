import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/db"
import { User } from "@/models/User"

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, { message: "أدخل الرقم السري الحالي" }),
    newPassword: z.string().min(6, { message: "الرقم السري الجديد يجب ألا يقل عن 6 خانات" }),
    confirmPassword: z.string().min(6, { message: "يرجى تأكيد الرقم السري" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "الرقم السري غير متطابق",
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

    const parsed = passwordSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json({ error: "بيانات غير صحيحة", details: parsed.error.format() }, { status: 400 })
    }

    const { currentPassword, newPassword } = parsed.data

    await dbConnect()

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    const isCurrentValid = await user.comparePassword(currentPassword)

    if (!isCurrentValid) {
      return NextResponse.json({ error: "الرقم السري الحالي غير صحيح" }, { status: 400 })
    }

    await user.setPassword(newPassword)
    await user.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update password", error)
    return NextResponse.json({ error: "تعذّر تحديث الرقم السري" }, { status: 500 })
  }
}
