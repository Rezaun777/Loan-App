"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (userId) {
      router.push("/dashboard")
    } else {
      router.push("/register")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 mb-6 mx-auto">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-foreground text-xl font-medium">Redirecting...</p>
        <p className="text-gray-500 mt-2">Please wait while we redirect you</p>
      </div>
    </div>
  )
}