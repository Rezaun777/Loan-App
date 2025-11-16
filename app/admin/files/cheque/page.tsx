"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"

export default function ChequePage() {
  const router = useRouter()
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    const adminId = localStorage.getItem("adminId")
    if (!adminId) {
      router.push("/admin-login")
    } else {
      setIsAuthLoading(false)
    }
  }, [router])

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Cheque</h1>
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
          <p className="text-muted-foreground">This feature is under development.</p>
        </Card>
      </main>
    </div>
  )
}