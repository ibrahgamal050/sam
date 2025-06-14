import { NextResponse } from "next/server"
import { updatePageBySlug } from "@/lib/services/page-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { restaurantId, slug, language, components } = body

    if (!restaurantId || !slug || !language) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    const page = await updatePageBySlug(restaurantId, slug, language, components)
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update page" }, { status: 500 })
  }
}