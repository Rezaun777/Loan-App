"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { calculateMonthlyInstallment, calculateLoanDetails } from "@/lib/loan-calculation"
import { convertToBanglaDigits } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function LoanSelectionForm() {
  const router = useRouter()
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Define loan durations with labels (without prefixes)
  const LOAN_DURATIONS = [
    { value: 12, label: "১২ মাস" },
    { value: 24, label: "২৪ মাস" },
    { value: 36, label: "৩৬ মাস" },
    { value: 48, label: "৪৮ মাস" },
    { value: 60, label: "৬০ মাস" },
  ]

  // Define loan amounts with labels (without prefixes, all with ৳ icon)
  const LOAN_AMOUNTS = [
    { value: 50000, label: "৳৫০,০০০.০০" },
    { value: 100000, label: "৳১,০০,০০০.০০" },
    { value: 150000, label: "৳১,৫০,০০০.০০" },
    { value: 200000, label: "৳২,০০,০০০.০০" },
    { value: 300000, label: "৳৩,০০,০০০.০০" },
    { value: 400000, label: "৳৪,০০,০০০.০০" },
    { value: 500000, label: "৳৫,০০,০০০.০০" },
    { value: 600000, label: "৳৬,০০,০০০.০০" },
    { value: 700000, label: "৳৭,০০,০০০.০০" },
    { value: 800000, label: "৳৮,০০,০০০.০০" },
    { value: 900000, label: "৳৯,০০,০০০.০০" },
    { value: 1000000, label: "৳১০,০০,০০০.০০" },
    { value: 1200000, label: "৳১২,০০,০০০.০০" },
    { value: 1500000, label: "৳১৫,০০,০০০.০০" },
    { value: 1800000, label: "৳১৮,০০,০০০.০০" },
    { value: 2000000, label: "৳২০,০০,০০০.০০" },
  ]

  const monthlyInstallment =
    selectedDuration && selectedAmount ? calculateMonthlyInstallment(selectedAmount, selectedDuration) : null

  // Calculate all loan details using the new calculation method
  const loanDetails = selectedDuration && selectedAmount 
    ? calculateLoanDetails(selectedAmount, selectedDuration)
    : null

  const handleSubmit = async () => {
    if (!selectedDuration || !selectedAmount) {
      setError("অনুগ্রহ করে মেয়াদ এবং পরিমাণ উভয়ই নির্বাচন করুন")
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

      const selectedLoanData = {
        duration: selectedDuration,
        amount: selectedAmount,
        monthlyInstallment: loanDetails?.monthlyInstallment,
      }

      // Save to localStorage for quick access
      localStorage.setItem("selectedLoan", JSON.stringify(selectedLoanData))
      
      // Mark loan selection as completed
      localStorage.setItem("loanSelectionCompleted", "true")

      // Also save to user profile
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ loanSelection: selectedLoanData }),
      })

      router.push("/loan-application")
    } catch (err) {
      setError("Error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6 w-full bg-white rounded-2xl shadow-xl border-0">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">বিশ্ব ব্যাংকের আর্থিক সেবায় আপনাকে স্বাগতম</h1>
          <p className="text-gray-500 text-sm mt-2">আপনার পছন্দ অনুযায়ী ঋণের মেয়াদ ও পরিমাণ নির্বাচন করুন</p>
        </div>

        {/* Loan Duration Selection as Dropdown */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">ঋণের মেয়াদ নির্বাচন করুন</h2>
          <Select onValueChange={(value) => setSelectedDuration(Number(value))} value={selectedDuration?.toString() || ""}>
            <SelectTrigger className="w-full border-2 border-gray-200 rounded-xl py-6 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder="ঋণের মেয়াদ নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              {LOAN_DURATIONS.map((duration) => (
                <SelectItem key={duration.value} value={duration.value.toString()} className="py-2">
                  {duration.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loan Amount Selection as Dropdown */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">ঋণের পরিমাণ নির্বাচন করুন</h2>
          <Select onValueChange={(value) => setSelectedAmount(Number(value))} value={selectedAmount?.toString() || ""}>
            <SelectTrigger className="w-full border-2 border-gray-200 rounded-xl py-6 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder="ঋণের পরিমাণ নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              {LOAN_AMOUNTS.map((amount) => (
                <SelectItem key={amount.value} value={amount.value.toString()} className="py-2">
                  {amount.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Real-time Calculation Display - Horizontal Format */}
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl space-y-4">
          <h3 className="text-xl font-bold text-gray-800 text-center pb-3 border-b border-blue-200">ঋণের বিবরণ</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 text-center">
              <p className="text-sm text-gray-500 mb-1">ঋণের পরিমাণ</p>
              <p className="text-lg font-bold text-blue-600">
                ৳{selectedAmount ? selectedAmount.toLocaleString("bn-BD") : "০"}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 text-center">
              <p className="text-sm text-gray-500 mb-1">ঋণের মেয়াদ</p>
              <p className="text-lg font-bold text-blue-600">
                {selectedDuration ? selectedDuration.toLocaleString("bn-BD") : "০"} মাস
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 text-center">
              <p className="text-sm text-gray-500 mb-1">সুদের হার</p>
              <p className="text-lg font-bold text-blue-600">{convertToBanglaDigits("0.20")}%</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 text-center">
              <p className="text-sm text-gray-500 mb-1">মোট প্রদেয়</p>
              <p className="text-lg font-bold text-blue-600">
                ৳{loanDetails ? convertToBanglaDigits(loanDetails.totalAmount.toFixed(2)) : "০"}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 text-center">
              <p className="text-sm text-gray-500 mb-1">প্রতি মাসে পরিশোধ</p>
              <p className="text-lg font-bold text-blue-600">
                ৳{loanDetails ? convertToBanglaDigits(loanDetails.monthlyInstallment.toFixed(2)) : "০"}
              </p>
            </div>
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">{error}</div>}

        <Button 
          onClick={handleSubmit} 
          className="w-full py-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          disabled={isLoading || !selectedDuration || !selectedAmount}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              প্রক্রিয়া করছেন...
            </span>
          ) : "উত্তোলন"}
        </Button>
      </div>
    </Card>
  )
}