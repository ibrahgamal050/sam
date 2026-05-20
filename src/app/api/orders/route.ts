import { NextRequest, NextResponse } from "next/server"
import { createPublicOrderService } from "@/lib/orders/service"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const result = await createPublicOrderService(body)
    console.log(result)

    return NextResponse.json({ data: result }, { status: 201 })
  } catch (e: any) {
    const status = typeof e?.status === "number" ? e.status : 500
    const code = typeof e?.code === "string" ? e.code : "INTERNAL_ERROR"
    const message = e?.message || "Unexpected server error"

    if (status >= 500) {
      console.error("[public/orders] unexpected", e)
    } else {
      console.warn("[public/orders] rejected", { code, message, details: e?.details })
    }

    return NextResponse.json({ error: { code, message, details: e?.details } }, { status })
  }
}
