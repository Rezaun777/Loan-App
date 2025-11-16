"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useEffect } from "react"
import Image from "next/image"
import { calculateLoanDetails } from "@/lib/loan-calculation"
import { convertToBanglaDigits } from "@/lib/utils"

interface ApplicationData {
  personalInfo?: Record<string, any>
  bankInfo?: Record<string, any>
  selectedLoan?: {
    duration: number
    amount: number
    monthlyInstallment: number
  }
  loanSelection?: Record<string, any>
}

export function LoanApplicationSummary() {
  const router = useRouter()
  const [data, setData] = useState<ApplicationData>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Calculate loan details if we have the required data
  const loanDetails = data.selectedLoan?.amount && data.selectedLoan?.duration 
    ? calculateLoanDetails(data.selectedLoan.amount, data.selectedLoan.duration)
    : null

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    const selectedLoan = localStorage.getItem("selectedLoan")

    if (selectedLoan) {
      try {
        const parsedLoan = JSON.parse(selectedLoan)
        setData((prev) => ({
          ...prev,
          selectedLoan: parsedLoan,
        }))
      } catch (e) {
      }
    }

    if (userId) {
      fetchUserData(userId)
    }
  }, [])

  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch("/api/user/profile", {
        headers: { "x-user-id": userId },
      })
      if (response.ok) {
        const userData = await response.json()
        setData((prev) => ({
          ...prev,
          personalInfo: userData.personalInfo,
          bankInfo: userData.bankInfo,
          selectedLoan: prev.selectedLoan || userData.loanSelection,
        }))
      }
    } catch (err) {
    }
  }

  const handleSubmit = async () => {
    if (!data.personalInfo?.fullName) {
      setError("Please complete personal information")
      return
    }
    if (!data.bankInfo?.accountNumber) {
      setError("Please complete bank information")
      return
    }
    if (!data.selectedLoan?.amount) {
      setError("Please select a loan")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/user/loan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          personalInfo: data.personalInfo,
          bankInfo: data.bankInfo,
          ...data.selectedLoan,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        setError(err.error || "Failed to submit application")
        return
      }

      localStorage.removeItem("selectedLoan")
      router.push("/dashboard")
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6 w-full bg-white rounded-2xl shadow-xl border-0">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">আপনার ঋণের আবেদনের সারসংক্ষেপ</h1>
          <p className="text-gray-500 text-sm mt-2">আপনার তথ্য পর্যালোচনা করুন এবং আবেদন জমা দিন</p>
        </div>

        {/* Personal Information Summary */}
        {data.personalInfo ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-700">ব্যক্তিগত তথ্য</h2>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500">নাম:</span>
                  <p className="font-medium text-gray-800">{data.personalInfo.fullName || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-500">আইডি নম্বর:</span>
                  <p className="font-medium text-gray-800">{data.personalInfo.nidNumber || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-500">মোবাইল নম্বর:</span>
                  <p className="font-medium text-gray-800">{data.personalInfo.mobileNumber || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-500">পেশা:</span>
                  <p className="font-medium text-gray-800">{data.personalInfo.occupation || "N/A"}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <span className="text-gray-500">বর্তমান ঠিকানা:</span>
                <p className="font-medium text-gray-800">{data.personalInfo.presentAddress || "N/A"}</p>
              </div>
              <div>
                <span className="text-gray-500">স্থায়ী ঠিকানা:</span>
                <p className="font-medium text-gray-800">{data.personalInfo.permanentAddress || "N/A"}</p>
              </div>
              <div>
                <span className="text-gray-500">ঋণের উদ্দেশ্য:</span>
                <p className="font-medium text-gray-800">{data.personalInfo.loanPurpose || "N/A"}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-500">ব্যক্তিগত তথ্য লোড হচ্ছে...</div>
        )}

        {/* Nominee Information */}
        {data.personalInfo && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-700">নমিনি তথ্য</h2>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <span className="text-gray-500">নমিনির নাম:</span>
                  <p className="font-medium text-gray-800">{data.personalInfo.nomineeName || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-500">নমিনির মোবাইল:</span>
                  <p className="font-medium text-gray-800">{data.personalInfo.nomineePhone || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-500">সম্পর্ক:</span>
                  <p className="font-medium text-gray-800">{data.personalInfo.nomineeRelation || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Images Section */}
        {data.personalInfo && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-700">ডকুমেন্টস</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data.personalInfo.profilePhoto && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">প্রোফাইল ছবি</p>
                  <div className="relative w-full h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={data.personalInfo.profilePhoto || "/placeholder.svg"}
                      alt="Profile"
                      fill
                      className="object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
              )}
              {data.personalInfo.nidCardFront && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">আইডি কার্ড (সামনে)</p>
                  <div className="relative w-full h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={data.personalInfo.nidCardFront || "/placeholder.svg"}
                      alt="NID Front"
                      fill
                      className="object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
              )}
              {data.personalInfo.nidCardBack && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">আইডি কার্ড (পিছনে)</p>
                  <div className="relative w-full h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={data.personalInfo.nidCardBack || "/placeholder.svg"}
                      alt="NID Back"
                      fill
                      className="object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
              )}
              {data.personalInfo.selfieWithId && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">আইডি কার্ড হাতে নিয়ে সেলফি</p>
                  <div className="relative w-full h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={data.personalInfo.selfieWithId || "/placeholder.svg"}
                      alt="Selfie"
                      fill
                      className="object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
              )}
              {data.personalInfo.signature && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">স্বাক্ষর</p>
                  <div className="relative w-full h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={data.personalInfo.signature || "/placeholder.svg"}
                      alt="Signature"
                      fill
                      className="object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bank Information Summary */}
        {data.bankInfo && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-700">ব্যাংক তথ্য</h2>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <span className="text-gray-500">ব্যাংক:</span>
                  <p className="font-medium text-gray-800">{data.bankInfo.bankName || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-500">অ্যাকাউন্ট টাইপ:</span>
                  <p className="font-medium text-gray-800">{data.bankInfo.accountType || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-500">অ্যাকাউন্ট নম্বর:</span>
                  <p className="font-medium text-gray-800">{data.bankInfo.accountNumber || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loan Information */}
        {data.selectedLoan && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-700">ঋণের তথ্য</h2>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border border-blue-100">
                  <span className="text-gray-500">পরিমাণ:</span>
                  <p className="font-bold text-blue-600 text-lg">৳{data.selectedLoan.amount?.toLocaleString("bn-BD")}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-100">
                  <span className="text-gray-500">মেয়াদ:</span>
                  <p className="font-bold text-blue-600 text-lg">{convertToBanglaDigits(data.selectedLoan.duration)} মাস</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-100">
                  <span className="text-gray-500">মাসিক কিস্তি:</span>
                  <p className="font-bold text-blue-600 text-lg">৳{loanDetails ? convertToBanglaDigits(loanDetails.monthlyInstallment.toFixed(2)) : "0"}</p>
                </div>
              </div>
              
              {/* Additional loan details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-blue-100">
                <div className="bg-white p-3 rounded-lg border border-blue-100">
                  <span className="text-gray-500">সুদের হার:</span>
                  <p className="font-bold text-blue-600 text-lg">{convertToBanglaDigits("0.20")}%</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-100">
                  <span className="text-gray-500">মাসিক সুদ:</span>
                  <p className="font-bold text-blue-600 text-lg">৳{loanDetails ? convertToBanglaDigits(loanDetails.monthlyInterest.toFixed(2)) : "0"}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-100">
                  <span className="text-gray-500">মোট সুদ:</span>
                  <p className="font-bold text-blue-600 text-lg">৳{loanDetails ? convertToBanglaDigits(loanDetails.totalInterest.toFixed(2)) : "0"}</p>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-blue-100 mt-3">
                <span className="text-gray-500">মোট পরিমাণ:</span>
                <p className="font-bold text-blue-600 text-lg">৳{loanDetails ? convertToBanglaDigits(loanDetails.totalAmount.toFixed(2)) : "0"}</p>
              </div>
            </div>
          </div>
        )}

        {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">{error}</div>}

        <Button 
          onClick={handleSubmit} 
          className="w-full py-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              আবেদন জমা দেওয়া হচ্ছে...
            </span>
          ) : "আবেদন জমা দিন"}
        </Button>
      </div>
    </Card>
  )
}