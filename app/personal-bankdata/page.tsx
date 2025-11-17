"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { CombinedInfoForm } from "@/components/combined-info-form"
import { useIsMobile } from "@/hooks/use-mobile"

export default function CombinedInfoPage() {
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
          
          // If user has already completed personal and bank info, redirect to next step
          if (hasPersonalInfo && hasBankInfo) {
            // Check if loan selection is completed
            const hasLoanSelection = userData.loanSelection && 
              userData.loanSelection.duration && 
              userData.loanSelection.amount
            
            if (hasLoanSelection) {
              // If all steps are completed, redirect to dashboard
              router.push("/dashboard")
            } else {
              // If personal/bank info is completed but loan selection is not, redirect to loan-selection
              router.push("/loan-selection")
            }
            return
          }
        }
      } catch (err) {
        // If there's an error checking user data, continue to show the form
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
              <CombinedInfoForm />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <main className={`phone-frame min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900`}>
      {/* Moon-shaped header with curved top and bottom (without any radial effects) */}
      <div className="w-full pt-12 pb-16 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Moon-shaped curved background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-indigo-700/30 to-purple-600/30 backdrop-blur-lg"></div>
        
        {/* Top curved moon shape */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/20 to-transparent rounded-b-[50%]"></div>
        
        {/* Bottom curved moon shape to match header */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/20 to-transparent rounded-t-[50%]"></div>
        
        {/* Floating particles effect */}
        <div className="absolute top-8 left-8 w-2 h-2 rounded-full bg-blue-300/50 animate-ping"></div>
        <div className="absolute top-12 right-10 w-1.5 h-1.5 rounded-full bg-indigo-200/60 animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-16 left-12 w-1 h-1 rounded-full bg-purple-300/50 animate-ping" style={{ animationDelay: '2s' }}></div>
        
        {/* Logo container with subtle glow */}
        <div className="relative z-10 bg-white/20 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl p-6 shadow-blue-500/40">
          <div className="text-center">
            <img 
              src="/The World Bank.png" 
              alt="The World Bank Logo" 
              className="max-w-full max-h-20 object-contain mx-auto filter brightness-0 invert drop-shadow-2xl"
            />
          </div>
        </div>
        
        {/* Decorative glow elements */}
        <div className="absolute -top-6 left-1/4 w-32 h-32 bg-blue-500/15 rounded-full blur-3xl"></div>
        <div className="absolute -top-2 right-1/3 w-24 h-24 bg-indigo-500/15 rounded-full blur-3xl"></div>
      </div>
      
      {/* Combined info form section with improved styling and bottom padding for nav */}
      <div className="flex-1 flex items-center justify-center px-4 pb-20 bg-gradient-to-b from-blue-50/90 to-indigo-100/90 backdrop-blur-sm">
        {/* Curved top to match header */}
        <div className="h-8 bg-gradient-to-b from-white/30 to-transparent rounded-t-[50%] -mt-4 w-full"></div>
        <div className="w-full max-w-2xl">
          {/* Updated to match modern form style */}
          <div className="p-6 w-full shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl">
            <CombinedInfoForm />
          </div>
        </div>
      </div>
      
      {/* Static bottom navigation - always visible and not overlapping content */}
      <div className="relative z-20">
        <BottomNavigation />
      </div>
    </main>
  )
}