"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ImageUpload } from "./image-upload"

export function PersonalInfoForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    // Your Info
    fullName: "",
    nidNumber: "",
    presentAddress: "",
    permanentAddress: "",
    mobileNumber: "",
    occupation: "",
    loanPurpose: "",
    // Nominee Info
    nomineeRelation: "",
    nomineeName: "",
    nomineePhone: "",
    profilePhoto: "",
    nidCardFront: "",
    nidCardBack: "",
    selfieWithId: "",
    signature: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (fieldName: string, url: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Redirect to combined info page
    router.push("/personal-bankdata")
    return

    /*
    const requiredFields = [
      "fullName",
      "nidNumber",
      "presentAddress",
      "permanentAddress",
      "mobileNumber",
      "occupation",
      "loanPurpose",
      "nomineeRelation",
      "nomineeName",
      "nomineePhone",
      "profilePhoto",
      "nidCardFront",
      "nidCardBack",
      "selfieWithId",
      "signature",
    ]

    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData])
    if (missingFields.length > 0) {
      setError(`Please fill all required fields. Missing: ${missingFields.join(", ")}`)
      return
    }

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
        body: JSON.stringify({ personalInfo: formData }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        setError(responseData.error || "Failed to save personal info")
        return
      }

      router.push("/bank-info")
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
    */
  }

  return (
    <Card className="p-6 w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h1 className="text-2xl font-bold text-primary">Personal Information</h1>

        {/* Your Info Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Your Information</h2>

          <div>
            <label className="text-sm font-medium block mb-2">Full Name</label>
            <Input
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">NID Number</label>
            <Input
              name="nidNumber"
              placeholder="NID Number"
              value={formData.nidNumber}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Present Address</label>
            <Input
              name="presentAddress"
              placeholder="Present Address"
              value={formData.presentAddress}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Permanent Address</label>
            <Input
              name="permanentAddress"
              placeholder="Permanent Address"
              value={formData.permanentAddress}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Mobile Number</label>
            <Input
              name="mobileNumber"
              placeholder="Mobile Number"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Occupation</label>
            <Input
              name="occupation"
              placeholder="Occupation"
              value={formData.occupation}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Loan Purpose</label>
            <Input
              name="loanPurpose"
              placeholder="Loan Purpose"
              value={formData.loanPurpose}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Nominee Info Section */}
        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-lg font-semibold text-foreground">Nominee Information</h2>

          <div>
            <label className="text-sm font-medium block mb-2">Relationship</label>
            <select
              name="nomineeRelation"
              value={formData.nomineeRelation}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="">Select Relationship</option>
              <option value="parent">Parent</option>
              <option value="spouse">Spouse</option>
              <option value="child">Child</option>
              <option value="sibling">Sibling</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Nominee Name</label>
            <Input
              name="nomineeName"
              placeholder="Nominee Name"
              value={formData.nomineeName}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Nominee Mobile Number</label>
            <Input
              name="nomineePhone"
              placeholder="Nominee Mobile Number"
              value={formData.nomineePhone}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-lg font-semibold text-foreground">Upload Documents</h2>
          <p className="text-sm text-muted-foreground">Please upload your documents</p>

          <ImageUpload
            label="Profile Photo"
            onUpload={(url) => handleImageUpload("profilePhoto", url)}
            isLoading={isLoading}
          />

          <ImageUpload
            label="NID Card Front"
            onUpload={(url) => handleImageUpload("nidCardFront", url)}
            isLoading={isLoading}
          />

          <ImageUpload
            label="NID Card Back"
            onUpload={(url) => handleImageUpload("nidCardBack", url)}
            isLoading={isLoading}
          />

          <ImageUpload
            label="Selfie with NID"
            onUpload={(url) => handleImageUpload("selfieWithId", url)}
            isLoading={isLoading}
          />

          <ImageUpload
            label="Signature"
            onUpload={(url) => handleImageUpload("signature", url)}
            isLoading={isLoading}
          />
        </div>

        {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </form>
    </Card>
  )
}
