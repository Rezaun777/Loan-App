"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function AdminLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("adminId", data.adminId)
        localStorage.setItem("adminRole", data.role)
        router.push("/admin")
      } else {
        setError(data.error || "Login failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-primary mb-6">Admin Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Email</label>
            <Input
              name="email"
              type="email"
              placeholder="admin@example.com"
              value={credentials.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Password</label>
            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}
          <div className="text-sm text-muted-foreground">
            <p>Available roles:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>administrator - Full access</li>
              <li>admin - Standard access</li>
            </ul>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Card>
    </main>
  )
}