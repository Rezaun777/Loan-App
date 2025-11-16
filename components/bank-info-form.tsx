"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export function BankInfoForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    accountType: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

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
        body: JSON.stringify({ bankInfo: formData }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to save bank info")
        return
      }

      router.push("/loan-selection")
    } catch (err) {
      setError("Network error. Please try again.")
    }
  }

  return (
    <Card className="p-6 w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-2xl font-bold text-primary mb-6">Bank Account</h1>

        <div>
          <label className="text-sm font-medium block mb-2">Account Type</label>
          <select
            name="accountType"
            value={formData.accountType}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="">Select Account Type</option>
            <option value="bank">Bank Account</option>
            <option value="nagad">Nagad</option>
            <option value="bkash">bKash</option>
            <option value="rocket">Rocket</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Bank Name</label>
          <Input
            name="bankName"
            placeholder="Bank Name"
            value={formData.bankName}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Account Name</label>
          <Input
            name="accountName"
            placeholder="Account Name"
            value={formData.accountName}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Account Number</label>
          <Input
            name="accountNumber"
            placeholder="Account Number"
            value={formData.accountNumber}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update"}
        </Button>
      </form>
    </Card>
  )
}
