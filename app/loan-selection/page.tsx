"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { LoanSelectionForm } from "@/components/loan-selection-form"
import { useIsMobile } from "@/hooks/use-mobile"

export default function LoanSelectionPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      router.push("/login")
      return
    }

    // Check user's actual progress in the database
    const checkUserProgress = async () => {
      try {
        const response = await fetch("/api/user/profile", {
          headers: { "x-user-id": userId },
        })

        if (response.ok) {
          const userData = await response.json()
          
          // Check if user has completed personal and bank info
          const hasPersonalInfo = userData.personalInfo && 
            userData.personalInfo.fullName && 
            userData.personalInfo.nidNumber &&
            userData.personalInfo.presentAddress &&
            userData.personalInfo.permanentAddress &&
            userData.personalInfo.mobileNumber &&
            userData.personalInfo.occupation &&
            userData.personalInfo.loanPurpose &&
            userData.personalInfo.birthDate &&
            userData.personalInfo.nomineeRelation &&
            userData.personalInfo.nomineeName &&
            userData.personalInfo.nomineePhone &&
            userData.personalInfo.profilePhoto &&
            userData.personalInfo.nidCardFront &&
            userData.personalInfo.nidCardBack &&
            userData.personalInfo.selfieWithId &&
            userData.personalInfo.signature
          
          const hasBankInfo = userData.bankInfo && 
            userData.bankInfo.accountType &&
            userData.bankInfo.bankName &&
            userData.bankInfo.accountName &&
            userData.bankInfo.accountNumber
          
          // If user hasn't completed personal-bankdata, redirect there
          if (!hasPersonalInfo || !hasBankInfo) {
            router.push("/personal-bankdata")
            return
          }
          
          // Check if loan selection is already completed
          const hasLoanSelection = userData.loanSelection && 
            userData.loanSelection.duration && 
            userData.loanSelection.amount
          
          // If loan selection is already completed, redirect to loan-application
          if (hasLoanSelection) {
            router.push("/loan-application")
            return
          }
        }
      } catch (err) {
        // If there's an error checking user data, redirect to personal-bankdata
        router.push("/personal-bankdata")
      } finally {
        setIsLoading(false)
      }
    }

    checkUserProgress()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 mb-6 mx-auto">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-foreground text-xl font-medium">লোড হচ্ছে...</p>
          <p className="text-gray-500 mt-2">আপনার তথ্য আনা হচ্ছে</p>
        </div>
      </div>
    )
  }

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700">
        {/* Header with more compact size but maintaining large logo - only for web view */}
        <header className="bg-gradient-to-br from-blue-600 to-indigo-700 py-2 px-8 shadow-md">
          <div className="container mx-auto flex items-center justify-center">
            <div className="flex items-center">
              <img 
                src="/The World Bank.png" 
                alt="The World Bank Logo" 
                className="h-24 filter brightness-0 invert drop-shadow-lg"
              />
            </div>
          </div>
        </header>
        
        {/* Main content area with form */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Updated to match login form style */}
            <div className="p-6 w-full shadow-xl border-0 bg-white rounded-2xl">
              <LoanSelectionForm />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Adapted dashboard header - simplified version that maintains layout */}
      <div className="w-full pt-12 pb-8 flex flex-col items-center justify-center relative bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900">
        {/* Simplified curved elements that don't disrupt layout */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/20 to-transparent rounded-b-[30%]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/20 to-transparent rounded-t-[30%]"></div>
        
        {/* Logo container - simplified without complex effects */}
        <div className="relative z-10 bg-white/20 rounded-2xl border border-white/30 p-4">
          <div className="text-center">
            <img 
              src="/The World Bank.png" 
              alt="The World Bank Logo" 
              className="max-w-full max-h-16 object-contain mx-auto filter brightness-0 invert"
            />
          </div>
        </div>
      </div>
      
      {/* Loan selection form section - adjusted to work with header */}
      <div className="flex-1 flex flex-col px-4 pb-20 bg-gradient-to-b from-blue-50 to-indigo-100 w-full">
        <div className="w-full mt-4">
          <div className="p-4 w-full shadow-lg border-0 bg-white rounded-2xl">
            <LoanSelectionForm />
          </div>
        </div>
      </div>
      
      {/* Bottom navigation */}
      <div className="relative z-20">
        <BottomNavigation />
      </div>
    </main>
  )
}