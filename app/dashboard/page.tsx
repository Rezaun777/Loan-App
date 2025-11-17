"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { DashboardHome } from "@/components/dashboard-home"
import { useIsMobile } from "@/hooks/use-mobile"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useIsMobile()

  useEffect(() => {
    const userId = localStorage.getItem("userId")

    if (!userId) {
      router.push("/login")
      return
    }

    // Check user's actual progress in the database
    const checkUserProgress = async () => {
      try {
        const userResponse = await fetch("/api/user/profile", {
          headers: { "x-user-id": userId },
        })
        
        if (userResponse.ok) {
          const userData = await userResponse.json()
          
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
          
          // Check if loan selection is completed
          const hasLoanSelection = userData.loanSelection && 
            userData.loanSelection.duration && 
            userData.loanSelection.amount
          
          // Redirect based on actual completion status
          if (!hasPersonalInfo || !hasBankInfo) {
            // If personal or bank info is not completed, redirect to personal-bankdata
            router.push("/personal-bankdata")
          } else if (!hasLoanSelection) {
            // If personal/bank info is completed but loan selection is not, redirect to loan-selection
            router.push("/loan-selection")
          } else {
            // If all steps are completed, stay on dashboard
            setIsLoading(false)
          }
        } else {
          // If we can't fetch user data, default to personal-bankdata
          router.push("/personal-bankdata")
        }
      } catch (err) {
        // If there's an error checking user data, default to personal-bankdata
        router.push("/personal-bankdata")
      }
    }
    
    checkUserProgress()
  }, [router])

  if (isLoading) {
    return (
      <div className={isMobile ? "phone-frame" : ""}>
        {isMobile ? (
          <main className={`min-h-screen flex items-center justify-center p-4 ${isMobile ? '' : 'pb-4'} bg-gradient-to-br from-blue-50 to-indigo-100`}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 mb-6 mx-auto">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-foreground text-xl font-medium">লোড হচ্ছে...</p>
              <p className="text-gray-500 mt-2">আপনার ড্যাশবোর্ড ডেটা আনা হচ্ছে</p>
            </div>
          </main>
        ) : (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
            <BottomNavigation />
            <main className="max-w-7xl mx-auto px-4 py-10">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 mb-6 mx-auto">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-foreground text-xl font-medium">Loading...</p>
                  <p className="text-gray-500 mt-2">Fetching your dashboard data</p>
                </div>
              </div>
            </main>
          </div>
        )}
      </div>
    )
  }

  if (!isMobile) {
    // Desktop view - Professional modern design
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <BottomNavigation />
        <main className="max-w-7xl mx-auto px-4 py-10">
          <DashboardHome />
        </main>
      </div>
    )
  }

  // Mobile view - Moon-shaped header design with static navbar (without any radial effects)
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
      
      {/* Dashboard content section with matching curved top and bottom padding for nav */}
      <div className="flex-1 flex flex-col px-4 pb-20 bg-gradient-to-b from-blue-50/90 to-indigo-100/90 backdrop-blur-sm w-full">
        {/* Curved top to match header */}
        <div className="h-8 bg-gradient-to-b from-white/30 to-transparent rounded-t-[50%] -mt-4 w-full"></div>
        <div className="flex-grow w-full">
          <DashboardHome />
        </div>
      </div>
      
      {/* Static bottom navigation - always visible and not overlapping content */}
      <div className="relative z-20">
        <BottomNavigation />
      </div>
    </main>
  )
}