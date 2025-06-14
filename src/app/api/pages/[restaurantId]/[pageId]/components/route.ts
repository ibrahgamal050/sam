import { NextResponse } from "next/server"
import { updatePageComponents } from "@/lib/services/page-service"

export async function PUT(
  request: Request,
  { params }: { params: { restaurantId: string; pageId: string } },
) {
  try {
    const { restaurantId, pageId } = params
    const body = await request.json()
    const { operation, component } = body

    if (!operation || !["add", "update", "delete"].includes(operation)) {
      return NextResponse.json({ error: "Invalid operation" }, { status: 400 })
    }

    const components = await updatePageComponents(
      restaurantId,
      pageId,
      operation,
      component || {},
    )

    if (components === null) {
      return NextResponse.json({ error: "Page or component not found" }, { status: 404 })
    }

    return NextResponse.json({ components })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update components" }, { status: 500 })
  }
}