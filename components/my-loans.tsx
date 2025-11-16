"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { convertToBanglaDigits } from "@/lib/utils"
import { calculateLoanDetails } from "@/lib/loan-calculation"

interface LoanData {
  _id?: string
  amount?: number
  duration?: number
  monthlyInstallment?: number
  status?: string
  level?: string
  fees?: Record<string, number>
  customMessage?: string
  assignedTo?: string
  payoutNumber?: string
  applicationDate?: string
  activeDate?: string
  paymentDate?: string
  endDate?: string
}

export function MyLoans() {
  const [loanData, setLoanData] = useState<LoanData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Function to get status label in Bangla
  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      pending: "অপেক্ষারত",
      pass: "অনুমদিত",
      pay_pending: "পেমেন্ট অপেক্ষারত",
      pay_pass: "পেমেন্ট সম্পন্ন",
      rejected: "প্রত্যাখ্যাত"
    }
    
    return statusLabels[status] || status
  }

  // Function to format date in Bangla
  const formatDate = (dateString?: string) => {
    if (!dateString) return "অনুমোদিত হয়নি"
    
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.getMonth()
    const year = date.getFullYear()
    
    const banglaMonths = [
      "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
      "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
    ]
    
    return `${day} ${banglaMonths[month]} ${year}`
  }

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const userId = localStorage.getItem("userId")
        if (!userId) return

        const response = await fetch("/api/user/loan", {
          headers: { "x-user-id": userId },
        })

        if (response.ok) {
          const data = await response.json()
          setLoanData(data)
        }
      } catch (err) {
        console.error("Failed to fetch loan data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLoan()
  }, [])

  // Calculate loan details if we have the required data
  const loanDetails = loanData?.amount && loanData?.duration 
    ? calculateLoanDetails(loanData.amount, loanData.duration)
    : null

  return (
    <div className="w-full space-y-6">
      <h1 className="text-3xl font-bold text-primary text-center mb-6">কিস্তি বিবরণ</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground text-lg">লোড করছেন...</p>
        </div>
      ) : loanData ? (
        <div className="space-y-6">
          {/* Section 1: Loan Amount Details - Two Cards */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
            <h2 className="text-xl font-semibold mb-4 text-blue-800 border-b border-blue-200 pb-2">ঋণের বিবরণ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-white border border-blue-200">
                <h3 className="font-bold text-blue-700 mb-3 pb-2 border-b border-blue-100">আর্থিক বিবরণ</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-blue-50">
                    <span className="text-blue-600">ঋণ:</span>
                    <span className="font-bold text-blue-900">৳{convertToBanglaDigits(loanData.amount?.toLocaleString("en-US") || "0")}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-50">
                    <span className="text-blue-600">মেয়াদী:</span>
                    <span className="font-bold text-blue-900">{convertToBanglaDigits(loanData.duration?.toString() || "0")} মাস</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-50">
                    <span className="text-blue-600">সুদ:</span>
                    <span className="font-bold text-blue-900">{convertToBanglaDigits("0.20")}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-50">
                    <span className="text-blue-600">মাসিক সুদ:</span>
                    <span className="font-bold text-blue-900">৳{loanDetails ? convertToBanglaDigits(loanDetails.monthlyInterest.toFixed(0)) : "0"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-50">
                    <span className="text-blue-600">মোট সুদ:</span>
                    <span className="font-bold text-blue-900">৳{loanDetails ? convertToBanglaDigits(loanDetails.totalInterest.toFixed(0)) : "0"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-50">
                    <span className="text-blue-600">মোট পরিমাণ:</span>
                    <span className="font-bold text-blue-900">৳{loanDetails ? convertToBanglaDigits(loanDetails.totalAmount.toFixed(0)) : "0"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-blue-600">কিস্তি:</span>
                    <span className="font-bold text-blue-900">৳{loanDetails ? convertToBanglaDigits(loanDetails.monthlyInstallment.toFixed(2)) : "0"}</span>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-white border border-blue-200">
                <h3 className="font-bold text-blue-700 mb-3 pb-2 border-b border-blue-100">অনুমোদনের অবস্থা</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-blue-50">
                    <span className="text-blue-600">অনুমোদন:</span>
                    <span className="font-bold text-blue-900">{getStatusLabel(loanData.status || "pending")}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-50">
                    <span className="text-blue-600">মোট প্রদেয়:</span>
                    <span className="font-bold text-blue-900">অনুমোদিত হয়নি</span>
                  </div>
                </div>
              </Card>
            </div>
          </Card>

          {/* Section 2: Loan Timeline - Two Cards */}
          <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
            <h2 className="text-xl font-semibold mb-4 text-amber-800 border-b border-amber-200 pb-2">তারিখ বিবরণ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-white border border-amber-200">
                <h3 className="font-bold text-amber-700 mb-3 pb-2 border-b border-amber-100">আবেদন ও সক্রিয়করণ</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-amber-50">
                    <span className="text-amber-600">আবেদনের তারিখ:</span>
                    <span className="font-bold text-amber-900">{formatDate(loanData.applicationDate)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-amber-600">সক্রিয় তারিখ:</span>
                    <span className="font-bold text-amber-900">{formatDate(loanData.activeDate)}</span>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-white border border-amber-200">
                <h3 className="font-bold text-amber-700 mb-3 pb-2 border-b border-amber-100">পেমেন্ট ও মেয়াদ</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-amber-50">
                    <span className="text-amber-600">পরবর্তী কিস্তির তারিখ:</span>
                    <span className="font-bold text-amber-900">{formatDate(loanData.paymentDate)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-amber-600">মেয়াদ শেষ:</span>
                    <span className="font-bold text-amber-900">{formatDate(loanData.endDate)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </Card>

          {/* Section 3: Payment Agents */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
            <h2 className="text-xl font-semibold mb-4 text-green-800 border-b border-green-200 pb-2">পেমেন্ট এজেন্ট</h2>
            <p className="text-green-700 mb-4">কিস্তি প্রদানের জন্য নিচে দেওয়া এজেন্ট নম্বরে ক্যাশ আউট করুন</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200 text-center">
                <h3 className="font-bold text-green-800 mb-2">বিকাশ এজেন্ট</h3>
                <p className="text-2xl font-mono font-bold text-green-900">********২৪৫</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200 text-center">
                <h3 className="font-bold text-green-800 mb-2">নগদ এজেন্ট</h3>
                <p className="text-2xl font-mono font-bold text-green-900">********২৪৫</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200 text-center">
                <h3 className="font-bold text-green-800 mb-2">রকেট এজেন্ট</h3>
                <p className="text-2xl font-mono font-bold text-green-900">********২৪৫</p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-12 text-center bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
          <h2 className="text-2xl font-bold text-rose-800 mb-4">কোন ঋণ পাওয়া যায় নি</h2>
          <p className="text-rose-700 mb-6">আপনার এখনও কোন ঋণ আবেদন করা হয়নি।</p>
          <Button 
            onClick={() => window.location.href = '/loan-application'}
            className="px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium text-lg"
          >
            ঋণ আবেদন করুন
          </Button>
        </Card>
      )}

    </div>
  )
}