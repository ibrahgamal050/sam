"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { uploadImage } from "@/lib/image-utils"

interface ImageUploadProps {
  onImageUpload: (imageUrl: string, altText: string, subdomain: string) => Promise<void>
  className?: string
  subdomain?: string
}

export function ImageUpload({
  onImageUpload,
  className,
  subdomain ,
}: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [altText, setAltText] = useState("")
  const [selectedSubdomain, setSelectedSubdomain] = useState(subdomain)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)

    // Create a preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Generate default alt text from filename
    const fileName = file.name.split(".")[0]
    setAltText(fileName.replace(/-|_/g, " "))
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10
          if (newProgress >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return newProgress
        })
      }, 300)

      // Upload the image to the server
      const imageUrl = await uploadImage(selectedFile, altText, subdomain)

      // Complete the progress bar
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Notify parent component
      await onImageUpload(imageUrl, altText, subdomain)

      // Reset form after successful upload
      setTimeout(() => {
        setSelectedFile(null)
        setPreview(null)
        setAltText("")
        setUploadProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 500)
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setPreview(null)
    setAltText("")
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Ensure we have at least one subdomain option

  return (
    <div className={cn("space-y-4", className)}>
      {!preview ? (
        <div
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Click to upload an image</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
          <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
      ) : (
        <div className="relative">
          <div className="relative aspect-video rounded-lg overflow-hidden border">
            <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="alt-text">Alt Text</Label>
            <Input
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe this image"
            />
            <p className="text-xs text-gray-500">
              Alt text helps make your menu accessible to people using screen readers.
            </p>
          </div>

          

          {uploadProgress > 0 && (
            <div className="mt-4">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-in-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">{uploadProgress}%</p>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading || !altText.trim()}>
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
