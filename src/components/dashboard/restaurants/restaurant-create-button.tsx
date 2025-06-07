"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export function RestaurantCreateButton() {
  return (
    <Button asChild>
      <Link href="/dashboard/restaurants/new">
        <Plus className="mr-2 h-4 w-4" />
        New Restaurant
      </Link>
    </Button>
  )
}
