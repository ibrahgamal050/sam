"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function GenerateAllPagesButton({ restaurantId }: { restaurantId: string }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleClick = async () => {
    setLoading(true)
    setStatus("idle")
    setMessage("")

    try {
      const res = await fetch(`/api/admin/generate-pages?id=${restaurantId}`, {
        method: "POST",
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "فشل التوليد")

      setStatus("success")
      setMessage(data.message)
    } catch (err: any) {
      setStatus("error")
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} disabled={loading}>
        {loading ? "جاري التوليد..." : "توليد جميع صفحات المطعم"}
      </Button>
      {status === "success" && <p className="text-green-600">{message}</p>}
      {status === "error" && <p className="text-red-600">❌ {message}</p>}
    </div>
  )
}
