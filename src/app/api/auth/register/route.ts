import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import dbConnect from "@/lib/db"
import { createLocalAccessToken, resolveSafeReturnUrl, setLocalSessionCookie } from "@/lib/auth/local-session"
import User from "@/models/User"

export const runtime = "nodejs"

const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  returnUrl: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "تأكد من الاسم والبريد وكلمة السر" }, { status: 400 })
    }

    const email = parsed.data.email.trim().toLowerCase()
    await dbConnect()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "هذا البريد مسجل بالفعل" }, { status: 409 })
    }

    const user = new User({
      _id: randomUUID(),
      email,
      name: parsed.data.name.trim(),
      authProvider: "local",
      savedAddresses: [],
    })
    await user.setPassword(parsed.data.password)
    await user.save()

    const token = await createLocalAccessToken({
      id: String(user._id),
      email: user.email,
      name: user.name,
      picture: user.picture,
    })

    const origin = req.nextUrl.origin
    const redirectTo = resolveSafeReturnUrl(parsed.data.returnUrl, origin)
    const response = NextResponse.json({ ok: true, redirectTo })
    setLocalSessionCookie(response, token)
    response.cookies.set("mz.logout", "", { maxAge: 0, path: "/" })
    response.cookies.set("mz.return", "", { maxAge: 0, path: "/" })
    return response
  } catch (error) {
    console.error("[auth] local registration failed", error)
    return NextResponse.json({ error: "تعذّر إنشاء الحساب" }, { status: 500 })
  }
}
