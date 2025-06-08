import { NextResponse } from "next/server"
import { getPageById, updatePage, deletePage } from "@/lib/services/page-service"

export async function GET(request: Request, { params }: { params: { restaurantId: string; pageId: string } }) {
  try {
    const { restaurantId, pageId } = params
    const page = await getPageById(restaurantId, pageId)
    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 })
    return NextResponse.json(page)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch page" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { restaurantId: string; pageId: string } }) {
  try {
    const { restaurantId, pageId } = params
    const data = await request.json()
    const page = await updatePage(restaurantId, pageId, data)
    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 })
    return NextResponse.json(page)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update page" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { restaurantId: string; pageId: string } }) {
  try {
    const { restaurantId, pageId } = params
    const success = await deletePage(restaurantId, pageId)
    if (!success) return NextResponse.json({ error: "Page not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete page" }, { status: 500 })
  }
}