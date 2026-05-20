import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import dbConnect from "@/lib/db"
import { createLocalAccessToken, resolveSafeReturnUrl, setLocalSessionCookie } from "@/lib/auth/local-session"
import User from "@/models/User"

export const runtime = "nodejs"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  returnUrl: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "بيانات تسجيل الدخول غير صحيحة" }, { status: 400 })
    }

    const email = parsed.data.email.trim().toLowerCase()
    await dbConnect()

    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(parsed.data.password))) {
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة السر غير صحيحة" }, { status: 401 })
    }

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
    console.error("[auth] local login failed", error)
    return NextResponse.json({ error: "تعذّر تسجيل الدخول" }, { status: 500 })
  }
}
