"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (userId) {
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
              // If all steps are completed, redirect to dashboard
              router.push("/dashboard")
            }
          } else {
            // If we can't fetch user data, default to personal-bankdata
            router.push("/personal-bankdata")
          }
        } catch (err) {
          // If there's an error checking user data, default to personal-bankdata
          router.push("/personal-bankdata")
        } finally {
          setIsLoading(false)
        }
      }
      
      checkUserProgress()
    } else {
      router.push("/register")
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
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

  return null
}