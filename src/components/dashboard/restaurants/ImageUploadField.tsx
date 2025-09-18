"use client"

import { useRef, useState } from "react"
import { Control, FieldPath, FieldValues } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

type ImageUploadFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label?: string
  uploadEndpoint?: string
  accept?: string[]
  maxSizeMB?: number
  ttlSec?: number
  className?: string
  onUploaded?: (objectName: string, url: string) => void
  subdomain?: string
}

export function ImageUploadField<TFieldValues extends FieldValues>({
  control,
  name,
  label = "Image",
  uploadEndpoint = "http://localhost:3001/api/upload",   // ← نسبي أفضل
  accept = ["image/jpeg", "image/png", "image/webp", "image/avif"],
  maxSizeMB = 5,
  ttlSec = 600,
  className,
  onUploaded,
  subdomain,                        // ← أضفها هنا
}: ImageUploadFieldProps<TFieldValues>) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePick = () => {
    setError(null)
    fileRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: any) => void) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!accept.includes(file.type)) {
      setError(`الأنواع المسموح بها: ${accept.map(a => a.split("/")[1].toUpperCase()).join(", ")}`)
      e.target.value = ""
      return
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`أقصى حجم ${maxSizeMB}MB`)
      e.target.value = ""
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      if (subdomain) fd.append("subdomain", subdomain) // ← هنا تستخدمها

      const res = await fetch(uploadEndpoint, { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok || !data?.ok || !data.objectName) {
        throw new Error(data?.error || "upload failed")
      }

      const url = makeImageUrl(data.objectName, ttlSec)
      onChange(url)
      onUploaded?.(data.objectName, url)
    } catch (err: any) {
      setError(err?.message || "فشل الرفع")
    } finally {
      setLoading(false)
      e.target.value = ""
    }
  }

  const handleRemove = (onChange: (val: any) => void) => {
    onChange("")
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-4">
              <div className="flex h-40 w-40 items-center justify-center rounded-md bg-muted overflow-hidden">
                {field.value ? (
                  <img
                    src={field.value as string}
                    alt={label}
                    className="h-full w-full rounded-md object-cover"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">No image uploaded</span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handlePick} disabled={loading}>
                  {loading ? "Uploading..." : "Upload"}
                </Button>
                {field.value ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemove(field.onChange)} disabled={loading}>
                    Remove
                  </Button>
                ) : null}
              </div>

              {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

              <input
                ref={fileRef}
                type="file"
                accept={accept.join(",")}
                className="hidden"
                onChange={(e) => handleFileChange(e, field.onChange)}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
