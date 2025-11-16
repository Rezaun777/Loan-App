"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const fileCategories = [
  { label: "Money Receipt", icon: "💰", color: "bg-green-50 dark:bg-green-950" },
  { label: "Cheque", icon: "📋", color: "bg-blue-50 dark:bg-blue-950" },
  { label: "Stamp", icon: "🏷️", color: "bg-purple-50 dark:bg-purple-950" },
  { label: "Insurance", icon: "🛡️", color: "bg-orange-50 dark:bg-orange-950" },
  { label: "Approval", icon: "✅", color: "bg-teal-50 dark:bg-teal-950" },
]

export default function FilesPage() {
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
        <h1 className="text-3xl font-bold text-foreground mb-6">File Management</h1>
        <p className="text-muted-foreground mb-6">Select a subcategory from the sidebar to view files</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fileCategories.map((category, index) => (
            <Card key={index} className={`p-6 ${category.color} cursor-pointer hover:shadow-lg transition`}>
              <div className="text-4xl mb-3">{category.icon}</div>
              <h3 className="text-lg font-semibold mb-4">{category.label}</h3>
              <Button variant="outline" className="w-full bg-transparent">
                View
              </Button>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}