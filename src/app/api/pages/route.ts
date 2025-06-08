import { NextResponse } from "next/server"
import { createPage } from "@/lib/services/page-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { restaurantId, subdomain, ...pageData } = body

    if (!restaurantId || !subdomain) {
      return NextResponse.json({ error: "restaurantId and subdomain are required" }, { status: 400 })
    }

    const page = await createPage(restaurantId, subdomain, pageData)
    return NextResponse.json(page, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create page" }, { status: 500 })
  }
}