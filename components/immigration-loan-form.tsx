"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ImageUpload } from "@/components/image-upload"

interface ImmigrationLoanData {
  name?: string
  idNumber?: string
  mobile?: string
  occupation?: string
  loanPurpose?: string
  passportNumber?: string
  country?: string
  passportImage?: string
  passportPhotoImage?: string
}

export function ImmigrationLoanForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<ImmigrationLoanData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId")
        if (!userId) {
          router.push("/login")
          return
        }

        const response = await fetch("/api/user/profile", {
          headers: { "x-user-id": userId },
        })

        if (response.ok) {
          const data = await response.json()
          const immigrationLoan = data.immigrationLoan || {}
          const personalInfo = data.personalInfo || {}

          setFormData({
            name: personalInfo.name || "",
            idNumber: personalInfo.idNumber || "",
            mobile: personalInfo.mobile || "",
            occupation: personalInfo.occupation || "",
            loanPurpose: personalInfo.loanPurpose || "",
            ...immigrationLoan,
          })
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err)
        setError("ডেটা লোড করতে ব্যর্থ হয়েছে")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageUpload = (fieldName: string, url: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: url,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.passportNumber?.trim()) {
      setError("পাসপোর্ট নম্বর প্রয়োজন")
      return
    }
    if (!formData.country?.trim()) {
      setError("দেশ নির্বাচন করুন")
      return
    }
    if (!formData.passportImage) {
      setError("পাসপোর্ট ছবি আপলোড করুন")
      return
    }
    if (!formData.passportPhotoImage) {
      setError("পাসপোর্টের সাথে নিজের ছবি আপলোড করুন")
      return
    }

    try {
      setIsSaving(true)
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
        body: JSON.stringify({
          immigrationLoan: {
            passportNumber: formData.passportNumber,
            country: formData.country,
            passportImage: formData.passportImage,
            passportPhotoImage: formData.passportPhotoImage,
          },
        }),
      })

      if (response.ok) {
        alert("তথ্য সংরক্ষিত হয়েছে")
        router.push("/profile")
      } else {
        setError("সংরক্ষণ ব্যর্থ হয়েছে")
      }
    } catch (err) {
      console.error("Save error:", err)
      setError("সংরক্ষণে ত্রুটি ঘটেছে")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6 w-full text-center">
        <p>লোড করছেন...</p>
      </Card>
    )
  }

  return (
    <Card className="p-6 w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary mb-2">আপনার পাসপোর্টের তথ্য প্রদান করুন</h1>
        <p className="text-sm text-muted-foreground">অভিবাসন ঋণের জন্য প্রয়োজনীয় তথ্য পূরণ করুন</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Existing Fields - Read Only */}
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <label className="text-sm font-medium">আপনার নাম</label>
            <input
              type="text"
              value={formData.name || ""}
              readOnly
              className="w-full mt-1 p-2 border rounded bg-background text-muted-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium">আইডি নাম্বার</label>
            <input
              type="text"
              value={formData.idNumber || ""}
              readOnly
              className="w-full mt-1 p-2 border rounded bg-background text-muted-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium">মোবাইল নাম্বার</label>
            <input
              type="text"
              value={formData.mobile || ""}
              readOnly
              className="w-full mt-1 p-2 border rounded bg-background text-muted-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium">পেশা</label>
            <input
              type="text"
              value={formData.occupation || ""}
              readOnly
              className="w-full mt-1 p-2 border rounded bg-background text-muted-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium">ঋণের উদ্দেশ্য</label>
            <textarea
              value={formData.loanPurpose || ""}
              readOnly
              className="w-full mt-1 p-2 border rounded bg-background text-muted-foreground resize-none"
              rows={2}
            />
          </div>
        </div>

        {/* New Fields for Immigration Loan */}
        <div className="space-y-4 border-t pt-4">
          <div>
            <label htmlFor="passportNumber" className="text-sm font-medium block mb-2">
              পাসপোর্ট নাম্বার *
            </label>
            <input
              id="passportNumber"
              type="text"
              name="passportNumber"
              value={formData.passportNumber || ""}
              onChange={handleInputChange}
              placeholder="পাসপোর্ট নম্বর প্রবেশ করুন"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="country" className="text-sm font-medium block mb-2">
              যে দেশে প্রবাসে আছেন *
            </label>
            <input
              id="country"
              type="text"
              name="country"
              value={formData.country || ""}
              onChange={handleInputChange}
              placeholder="দেশের নাম প্রবেশ করুন"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        {/* Image Uploads */}
        <div className="space-y-6 border-t pt-4">
          <div>
            <h3 className="font-semibold text-base mb-4">ছবি সমূহ</h3>

            <div className="space-y-4">
              <ImageUpload
                label="পাসপোর্ট আপলোড করুন *"
                onUpload={(url) => handleImageUpload("passportImage", url)}
                isLoading={isSaving}
              />

              <ImageUpload
                label="পাসপোর্টের সাথে নিজের ছবি আপলোড করুন *"
                onUpload={(url) => handleImageUpload("passportPhotoImage", url)}
                isLoading={isSaving}
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Submit Button */}
        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => router.push("/profile")}
            disabled={isSaving}
          >
            বাতিল করুন
          </Button>
          <Button type="submit" className="flex-1" disabled={isSaving}>
            {isSaving ? "সংরক্ষণ করছেন..." : "সংরক্ষণ করুন"}
          </Button>
        </div>
      </form>
    </Card>
  )
}
