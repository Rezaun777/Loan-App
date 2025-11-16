"use client"

import type React from "react"

import { useState, useRef } from "react"
import SignatureCanvas from "react-signature-canvas"
import { Button } from "@/components/ui/button"

interface SignaturePadProps {
  onUpload: (url: string) => void
  isLoading?: boolean
}

export function SignaturePad({ onUpload, isLoading }: SignaturePadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const signatureRef = useRef<SignatureCanvas>(null)

  const clearSignature = () => {
    signatureRef.current?.clear()
    setSubmitted(false)
  }

  const saveSignature = async () => {
    if (!signatureRef.current?.isEmpty()) {
      setError("")
      setUploading(true)
      
      try {
        // Get the signature as a data URL
        const dataURL = signatureRef.current?.getTrimmedCanvas().toDataURL("image/png")
        
        // Convert data URL to Blob
        const blob = await fetch(dataURL!).then(res => res.blob())
        
        // Upload to Cloudinary
        const formData = new FormData()
        formData.append("file", blob, "signature.png")
        
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error("Upload failed")
        }
        
        const data = await response.json()
        onUpload(data.secure_url)
        setSubmitted(true)
      } catch (err) {
        setError("আপলোড ব্যর্থ হয়েছে")
        console.error(err)
      } finally {
        setUploading(false)
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-border rounded-lg p-4">
        <div className="space-y-2">
          <SignatureCanvas
            ref={signatureRef}
            penColor="black"
            canvasProps={{
              className: "w-full h-32 border rounded bg-white cursor-crosshair",
              style: { touchAction: "none" }
            }}
            minWidth={1}
            maxWidth={3}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={saveSignature}
              disabled={uploading || isLoading || submitted}
              className={`${
                submitted 
                  ? "bg-green-700 hover:bg-green-800 text-white" 
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {uploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  সংরক্ষণ করছেন...
                </span>
              ) : submitted ? (
                "স্বাক্ষর জমা হয়েছে।"
              ) : (
                "স্বাক্ষর জমা দিন"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSignature}
              disabled={uploading || isLoading}
            >
              মুছুন
            </Button>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}