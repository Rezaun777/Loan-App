"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { X } from "lucide-react"

interface ImageUploadProps {
  label: string
  onUpload: (url: string) => void
  isLoading?: boolean
}

export function ImageUpload({ label, onUpload, isLoading }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    // Upload to Cloudinary
    setError("")
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      onUpload(data.secure_url)
    } catch (err) {
      setError("আপলোড ব্যর্থ হয়েছে")
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    // Reset error when removing image
    setError("")
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium block">{label}</label>

      <div className="border-2 border-dashed border-border rounded-lg p-4">
        {preview ? (
          <div className="space-y-2">
            <div className="relative w-full h-32">
              <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                disabled={uploading || isLoading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || isLoading}
            >
              {uploading ? "আপলোড করছেন..." : "পরিবর্তন করুন"}
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-center py-6 hover:bg-muted/50 rounded transition"
            disabled={uploading || isLoading}
          >
            <p className="text-muted-foreground text-sm">আপনার ডকুমেন্টগুলি আপলোড করুন</p>
            <p className="text-muted-foreground text-xs mt-1">ক্লিক করে ছবি নির্বাচন করুন বা টেনে আনুন</p>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading || isLoading}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}