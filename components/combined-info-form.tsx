"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ImageUpload } from "./image-upload"
import { SignaturePad } from "./signature-pad"
import { User, IdCard, Home, Phone, Briefcase, Target, Users, Building, CreditCard, FileText, ChevronDown, Upload } from 'lucide-react'

export function CombinedInfoForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    // Personal Info
    fullName: "",
    nidNumber: "",
    presentAddress: "",
    permanentAddress: "",
    mobileNumber: "",
    occupation: "",
    loanPurpose: "",
    birthDate: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    // Nominee Info
    nomineeRelation: "",
    nomineeName: "",
    nomineePhone: "",
    profilePhoto: "",
    nidCardFront: "",
    nidCardBack: "",
    selfieWithId: "",
    signature: "",
    // Bank Info
    accountType: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
  })

  // Load existing data if available
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const userId = localStorage.getItem("userId")
        if (!userId) {
          router.push("/login")
          return
        }

        const response = await fetch("/api/user/profile", {
          headers: { "x-user-id": userId },
        })

        if (response.ok) {
          const userData = await response.json()
          if (userData.personalInfo || userData.bankInfo) {
            // Parse birthDate if it exists
            let birthDay = ""
            let birthMonth = ""
            let birthYear = ""
            
            if (userData.personalInfo?.birthDate) {
              const parts = userData.personalInfo.birthDate.split("/")
              if (parts.length === 3) {
                birthDay = parts[0] || ""
                birthMonth = parts[1] || ""
                birthYear = parts[2] || ""
              }
            }
            
            setFormData(prev => ({
              ...prev,
              ...userData.personalInfo,
              ...userData.bankInfo,
              birthDay,
              birthMonth,
              birthYear
            }))
          }
        }
      } catch (err) {
      }
    }

    loadExistingData()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // For numeric fields, only allow numeric input
    const numericFields = ["nidNumber", "nomineePhone", "accountNumber", "birthDay", "birthMonth", "birthYear"];
    if (numericFields.includes(name)) {
      // Remove any non-numeric characters
      const numericValue = value.replace(/[^0-9]/g, '');
      
      // If this is a birth date field, update the combined birthDate field
      if (name === "birthDay" || name === "birthMonth" || name === "birthYear") {
        setFormData((prev) => {
          const updatedFormData = { ...prev, [name]: numericValue };
          const newBirthDate = `${updatedFormData.birthDay || ''}/${updatedFormData.birthMonth || ''}/${updatedFormData.birthYear || ''}`;
          return { ...prev, [name]: numericValue, birthDate: newBirthDate };
        });
      } else {
        setFormData((prev) => ({ ...prev, [name]: numericValue }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleImageUpload = (fieldName: string, url: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate personal info fields
    const personalInfoFields = [
      "fullName",
      "nidNumber",
      "presentAddress",
      "permanentAddress",
      "mobileNumber",
      "occupation",
      "loanPurpose",
      "birthDay",
      "birthMonth",
      "birthYear",
      "nomineeRelation",
      "nomineeName",
      "nomineePhone",
      "profilePhoto",
      "nidCardFront",
      "nidCardBack",
      "selfieWithId",
      "signature",
    ]

    // Validate bank info fields
    const bankInfoFields = [
      "accountType",
      "bankName",
      "accountName",
      "accountNumber",
    ]

    const missingPersonalFields = personalInfoFields.filter((field) => !formData[field as keyof typeof formData])
    const missingBankFields = bankInfoFields.filter((field) => !formData[field as keyof typeof formData])

    if (missingPersonalFields.length > 0 || missingBankFields.length > 0) {
      const missingFields = [...missingPersonalFields, ...missingBankFields]
      setError(`Please fill all required fields. Missing: ${missingFields.join(", ")}`)
      return
    }

    setIsLoading(true)

    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        router.push("/login")
        return
      }

      // Prepare data for submission
      const personalInfo: Record<string, any> = {}
      const bankInfo: Record<string, any> = {}
      
      // Extract personal info fields
      personalInfoFields.forEach(field => {
        personalInfo[field] = formData[field as keyof typeof formData]
      })
      
      // Extract bank info fields
      bankInfoFields.forEach(field => {
        bankInfo[field] = formData[field as keyof typeof formData]
      })

      // Save personal info
      const personalResponse = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ personalInfo }),
      })

      if (!personalResponse.ok) {
        const data = await personalResponse.json()
        throw new Error(data.error || "Failed to save personal info")
      }

      // Save bank info
      const bankResponse = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ bankInfo }),
      })

      if (!bankResponse.ok) {
        const data = await bankResponse.json()
        throw new Error(data.error || "Failed to save bank info")
      }

      router.push("/loan-selection")
    } catch (err) {
      setError(typeof err === "string" ? err : "Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard")
  }

  return (
    <Card className="p-0 w-full bg-white rounded-2xl shadow-xl border-0 bg-white/80 backdrop-blur-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header section matching AuthForm style */}
        <div className="text-center mb-2 pt-6">
          <div className="mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <User className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ব্যক্তিগত ও ব্যাংক তথ্য</h1>
          <p className="text-gray-500 text-sm mt-2">আপনার সম্পূর্ণ তথ্য দিন</p>
        </div>

        <div className="p-6">
          {/* Personal Info Section */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 pb-3 border-b border-gray-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                ব্যক্তিগত তথ্য
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">আপনার নাম দিন</label>
                  <div className="relative">
                    <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                      <Input
                        name="fullName"
                        placeholder="সম্পূর্ণ নাম"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        disabled={isLoading || !!formData.fullName}
                        className="pl-10 py-6 rounded-xl border-0 bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none hover:bg-gray-100"
                      />
                    </div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">আপনার আইডি নম্বর</label>
                  <div className="relative">
                    <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                      <Input
                        name="nidNumber"
                        placeholder="NID নম্বর"
                        value={formData.nidNumber}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="pl-10 py-6 rounded-xl border-0 bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none hover:bg-gray-100"
                      />
                    </div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IdCard className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">বর্তমান ঠিকানা</label>
                  <div className="relative">
                    <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                      <Input
                        name="presentAddress"
                        placeholder="বর্তমান ঠিকানা"
                        value={formData.presentAddress}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="pl-10 py-6 rounded-xl border-0 bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none hover:bg-gray-100"
                      />
                    </div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Home className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">স্থায়ী ঠিকানা</label>
                  <div className="relative">
                    <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                      <Input
                        name="permanentAddress"
                        placeholder="স্থায়ী ঠিকানা"
                        value={formData.permanentAddress}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="pl-10 py-6 rounded-xl border-0 bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none hover:bg-gray-100"
                      />
                    </div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Home className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">মোবাইল নম্বর দিন</label>
                  <div className="relative">
                    <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                      <Input
                        name="mobileNumber"
                        placeholder="01xxxxxxxxx"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        required
                        disabled={isLoading || !!formData.mobileNumber}
                        type="tel"
                        inputMode="tel"
                        className="pl-10 py-6 rounded-xl border-0 bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none hover:bg-gray-100"
                      />
                    </div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">জন্ম তারিখ</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="relative">
                      <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                        <Input
                          name="birthDay"
                          type="text"
                          placeholder="দিন"
                          value={formData.birthDay || ""}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          className="py-6 rounded-xl border-0 bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none hover:bg-gray-100 text-center"
                          maxLength={2}
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                        <Input
                          name="birthMonth"
                          type="text"
                          placeholder="মাস"
                          value={formData.birthMonth || ""}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          className="py-6 rounded-xl border-0 bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none hover:bg-gray-100 text-center"
                          maxLength={2}
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                        <Input
                          name="birthYear"
                          type="text"
                          placeholder="বছর"
                          value={formData.birthYear || ""}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          className="py-6 rounded-xl border-0 bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none hover:bg-gray-100 text-center"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">পেশা</label>
                  <div className="relative">
                    <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                      <Input
                        name="occupation"
                        placeholder="পেশা"
                        value={formData.occupation}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="pl-10 py-6 rounded-xl border-0 bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none hover:bg-gray-100"
                      />
                    </div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">ঋণের উদ্দেশ্য</label>
                  <div className="relative">
                    <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                      <Input
                        name="loanPurpose"
                        placeholder="ঋণের উদ্দেশ্য"
                        value={formData.loanPurpose}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="pl-10 py-6 rounded-xl border-0 bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none hover:bg-gray-100"
                      />
                    </div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Target className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nominee Info Section */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 pb-3 border-b border-gray-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                নমিনি তথ্য
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">সম্পর্ক</label>
                  <div className="relative">
                    <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 group hover:from-blue-600 hover:to-indigo-700 transition-all duration-300">
                      <select
                        name="nomineeRelation"
                        value={formData.nomineeRelation}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="w-full pl-10 pr-10 py-6 rounded-xl border-0 bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none appearance-none transition-all duration-300 group-hover:bg-blue-50 cursor-pointer text-gray-700"
                      >
                        <option value="" className="text-gray-500">সম্পর্ক নির্বাচন করুন</option>
                        <option value="parent">পিতা/মাতা</option>
                        <option value="spouse">স্বামী/স্ত্রী</option>
                        <option value="child">পুত্র/কন্যা</option>
                        <option value="sibling">ভাই/বোন</option>
                        <option value="other">অন্যান্য</option>
                      </select>
                    </div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
                    </div>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">নমিনির নাম</label>
                  <div className="relative">
                    <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                      <Input
                        name="nomineeName"
                        placeholder="নমিনির নাম"
                        value={formData.nomineeName}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="pl-10 py-6 rounded-xl border-0 bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none hover:bg-gray-100"
                      />
                    </div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">নমিনির মোবাইল নম্বর</label>
                  <div className="relative">
                    <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                      <Input
                        name="nomineePhone"
                        placeholder="01xxxxxxxxx"
                        value={formData.nomineePhone}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="pl-10 py-6 rounded-xl border-0 bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none hover:bg-gray-100"
                      />
                    </div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Info Section */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 pb-3 border-b border-gray-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                ব্যাংক অ্যাকাউন্ট
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">অ্যাকাউন্ট টাইপ</label>
                  <div className="relative">
                    <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 group hover:from-blue-600 hover:to-indigo-700 transition-all duration-300">
                      <select
                        name="accountType"
                        value={formData.accountType}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="w-full pl-10 pr-10 py-6 rounded-xl border-0 bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none appearance-none transition-all duration-300 group-hover:bg-blue-50 cursor-pointer text-gray-700"
                      >
                        <option value="" className="text-gray-500">অ্যাকাউন্ট টাইপ নির্বাচন করুন</option>
                        <option value="bank">Bank Account</option>
                        <option value="nagad">Nagad</option>
                        <option value="bkash">bKash</option>
                        <option value="rocket">Rocket</option>
                      </select>
                    </div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
                    </div>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">ব্যাংকের নাম</label>
                  <div className="relative">
                    <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                      <Input
                        name="bankName"
                        placeholder="ব্যাংকের নাম"
                        value={formData.bankName}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="pl-10 py-6 rounded-xl border-0 bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none hover:bg-gray-100"
                      />
                    </div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">অ্যাকাউন্ট হোল্ডারের নাম</label>
                  <div className="relative">
                    <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                      <Input
                        name="accountName"
                        placeholder="অ্যাকাউন্ট হোল্ডারের নাম"
                        value={formData.accountName}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="pl-10 py-6 rounded-xl border-0 bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none hover:bg-gray-100"
                      />
                    </div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">অ্যাকাউন্ট নম্বর</label>
                  <div className="relative">
                    <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                      <Input
                        name="accountNumber"
                        placeholder="অ্যাকাউন্ট নম্বর"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="pl-10 py-6 rounded-xl border-0 bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none hover:bg-gray-100"
                      />
                    </div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 pb-3 border-b border-gray-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                ডকুমেন্ট আপলোড
              </h2>
              <p className="text-sm text-gray-500 mt-2">আপনার ডকুমেন্টগুলি আপলোড করুন</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">প্রোফাইল ছবি</label>
                  <div className="relative">
                    <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                      <div className="bg-white rounded-xl p-4">
                        <ImageUpload 
                          label="" 
                          onUpload={(url) => handleImageUpload("profilePhoto", url)} 
                          isLoading={isLoading} 
                        />
                      </div>
                    </div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">আইডি কার্ড (সামনে)</label>
                  <div className="relative">
                    <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                      <div className="bg-white rounded-xl p-4">
                        <ImageUpload 
                          label="" 
                          onUpload={(url) => handleImageUpload("nidCardFront", url)} 
                          isLoading={isLoading} 
                        />
                      </div>
                    </div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IdCard className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">আইডি কার্ড (পিছনে)</label>
                  <div className="relative">
                    <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                      <div className="bg-white rounded-xl p-4">
                        <ImageUpload 
                          label="" 
                          onUpload={(url) => handleImageUpload("nidCardBack", url)} 
                          isLoading={isLoading} 
                        />
                      </div>
                    </div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IdCard className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">আইডি কার্ড হাতে নিয়ে সেলফি</label>
                  <div className="relative">
                    <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                      <div className="bg-white rounded-xl p-4">
                        <ImageUpload 
                          label="" 
                          onUpload={(url) => handleImageUpload("selfieWithId", url)} 
                          isLoading={isLoading} 
                        />
                      </div>
                    </div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">স্বাক্ষর</label>
                  <div className="relative">
                    <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                      <div className="bg-white rounded-xl p-4">
                        <SignaturePad 
                          onUpload={(url) => handleImageUpload("signature", url)} 
                          isLoading={isLoading} 
                        />
                      </div>
                    </div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Upload className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-center mt-6 border border-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button 
              type="submit" 
              className="flex-1 py-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  সংরক্ষণ করছেন...
                </span>
              ) : (
                "জমা দিন"
              )}
            </Button>
            
            <Button 
              type="button"
              onClick={handleCancel}
              className="flex-1 py-6 rounded-xl bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isLoading}
            >
              বাতিল করুন
            </Button>
          </div>
        </div>
      </form>
    </Card>
  )
}