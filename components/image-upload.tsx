"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Upload, FileText } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface ImageUploadProps {
  label: string
  onUpload: (url: string) => void
  isLoading?: boolean
}

export function ImageUpload({ label, onUpload, isLoading }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [fileName, setFileName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Set file name for mobile view
    setFileName(file.name)

    // Show preview (only for desktop)
    if (!isMobile) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }

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
    setFileName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    // Reset error when removing image
    setError("")
  }

  // Mobile-optimized version with traditional file input
  if (isMobile) {
    return (
      <div className="space-y-3">
        <label className="text-sm font-medium block">{label}</label>

        <div className="border-2 border-dashed border-border rounded-lg p-4">
          {fileName ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <p className="text-xs text-gray-600 truncate">{fileName}</p>
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="ml-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  disabled={uploading || isLoading}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={uploading || isLoading}
                />
              </div>
            </div>
          ) : (
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={uploading || isLoading}
              />
            </div>
          )}
        </div>

        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </div>
    )
  }

  // Desktop version (unchanged)
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium block">{label}</label>

      <div className="border-2 border-dashed border-border rounded-lg p-4 md:p-6">
        {preview ? (
          <div className="space-y-4">
            <div className="relative w-full h-40 md:h-48">
              <img src={preview || "/placeholder.svg"} alt="Preview" className="object-contain w-full h-full" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-md md:p-1.5"
                disabled={uploading || isLoading}
              >
                <X className="h-4 w-4 md:h-3 md:w-3" />
              </button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || isLoading}
              className="w-full py-5 text-base md:py-2 md:text-sm"
            >
              {uploading ? "আপলোড করছেন..." : "পরিবর্তন করুন"}
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-center py-8 hover:bg-muted/50 rounded transition md:py-6"
            disabled={uploading || isLoading}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 md:w-12 md:h-12 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <p className="text-muted-foreground text-base md:text-sm font-medium">আপনার ডকুমেন্টগুলি আপলোড করুন</p>
                <p className="text-muted-foreground text-xs mt-1 hidden md:block">ক্লিক করে ছবি নির্বাচন করুন বা টেনে আনুন</p>
                <p className="text-muted-foreground text-xs mt-1 md:hidden">ট্যাপ করে ছবি নির্বাচন করুন</p>
              </div>
            </div>
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