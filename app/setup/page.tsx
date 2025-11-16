"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    message: string
    email: string
    password: string
  } | null>(null)
  const [error, setError] = useState("")

  const createDemoAdmin = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/setup/create-admin")
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create admin")
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(`Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Loan App Setup</CardTitle>
          <CardDescription>Create demo admin account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

          {result ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-semibold mb-3">{result.message}</p>
                <div className="space-y-2 bg-white p-3 rounded border border-green-200">
                  <p className="text-sm">
                    <strong>Email:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{result.email}</code>
                  </p>
                  <p className="text-sm">
                    <strong>Password:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{result.password}</code>
                  </p>
                </div>
              </div>

              <a href="/admin-login" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Go to Admin Login</Button>
              </a>
            </div>
          ) : (
            <Button onClick={createDemoAdmin} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? "Creating..." : "Create Demo Admin Account"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
