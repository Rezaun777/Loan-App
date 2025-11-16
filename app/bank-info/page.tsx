"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"

export default function BankInfoPage() {
  const router = useRouter()
  const isMobile = useIsMobile()

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      router.push("/login")
    }
    
    // Redirect to combined info page
    router.push("/personal-bankdata")
  }, [router])

  return (
    <main className={`phone-frame min-h-screen flex items-center justify-center p-4 ${isMobile ? 'pb-20' : 'pb-4'}`}>
      <div className="text-center">
        <p>Redirecting...</p>
      </div>
    </main>
  )
}