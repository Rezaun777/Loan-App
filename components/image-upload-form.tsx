"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ImageUpload } from "@/components/image-upload"

export function ImageUploadForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [images, setImages] = useState({
    profilePhoto: "",
    nidFront: "",
    nidBack: "",
    nidSelfie: "",
    signature: "",
  })

  const handleImageUpload = (field: keyof typeof images, url: string) => {
    setImages((prev) => ({ ...prev, [field]: url }))
  }

  const handleSubmit = async () => {
    // Validate all images are uploaded
    if (!Object.values(images).every((v) => v)) {
      setError("সমস্ত ছবি আপলোড করুন")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ images }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "ছবি সংরক্ষণ ব্যর্থ")
        return
      }

      router.push("/dashboard")
    } catch (err) {
      setError("নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6 w-full space-y-6">
      <h1 className="text-2xl font-bold text-primary">ছবি সমূহ আপলোড করুন</h1>

      <ImageUpload
        label="আপনার ছবি আপলোড করুন"
        onUpload={(url) => handleImageUpload("profilePhoto", url)}
        isLoading={isLoading}
      />

      <ImageUpload
        label="আপনার আইডি কার্ড সামনের দিক"
        onUpload={(url) => handleImageUpload("nidFront", url)}
        isLoading={isLoading}
      />

      <ImageUpload
        label="আপনার আইডি কার্ডের বিপরীত দিক"
        onUpload={(url) => handleImageUpload("nidBack", url)}
        isLoading={isLoading}
      />

      <ImageUpload
        label="আপনার আইডি কার্ড হাতে নিয়ে মুখের ছবি"
        onUpload={(url) => handleImageUpload("nidSelfie", url)}
        isLoading={isLoading}
      />

      <ImageUpload
        label="আপনার স্বাক্ষর আপলোড করুন"
        onUpload={(url) => handleImageUpload("signature", url)}
        isLoading={isLoading}
      />

      {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

      <Button onClick={handleSubmit} className="w-full" disabled={isLoading || !Object.values(images).every((v) => v)}>
        {isLoading ? "সংরক্ষণ করছেন..." : "সংরক্ষণ করুন"}
      </Button>
    </Card>
  )
}
