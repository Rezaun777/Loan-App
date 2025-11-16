"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Eye, EyeOff, User, Phone } from 'lucide-react'

interface AuthFormProps {
  isLogin?: boolean
}

export function AuthForm({ isLogin = false }: AuthFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // For phone field, only allow numeric input
    if (name === "phone") {
      // Remove any non-numeric characters
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData((prev) => ({ ...prev, [name]: numericValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation for registration form
    if (!isLogin) {
      // Phone number validation: must be exactly 11 digits
      if (formData.phone.length !== 11 || !/^\d{11}$/.test(formData.phone)) {
        setError("মোবাইল নম্বর অবশ্যই ১১ টি সংখ্যা হতে হবে")
        return
      }

      // Password validation: minimum 6 characters
      if (formData.password.length < 6) {
        setError("পাসওয়ার্ড কমপক্ষে ৬ টি অক্ষরের হতে হবে")
        return
      }
    }

    setIsLoading(true)

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register"
      const payload = isLogin ? { phone: formData.phone, password: formData.password } : formData

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "An error occurred")
        return
      }

      // Store userId in localStorage
      if (data.userId) {
        localStorage.setItem("userId", data.userId)
        localStorage.setItem("userPhone", data.phone)
      }

      setTimeout(() => {
        router.push(isLogin ? "/dashboard" : "/personal-bankdata")
      }, 500)
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleForm = () => {
    router.push(isLogin ? "/register" : "/login")
  }

  return (
    <Card className="p-6 w-full shadow-xl border-0 bg-white/80 backdrop-blur-lg rounded-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-center mb-2">
          <div className="mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <User className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isLogin ? "অ্যাকাউন্টে লগইন করুন" : "নতুন একাউন্ট তৈরি করুন"}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {isLogin ? "আপনার মোবাইল নম্বর দিয়ে লগইন করুন" : "নতুন একাউন্ট তৈরির জন্য তথ্য দিন"}
          </p>
        </div>

        {!isLogin && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">আপনার নাম</label>
            <div className="relative">
              <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
                <Input
                  name="name"
                  placeholder="নাম লিখুন..."
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  disabled={isLoading}
                  className="pl-10 py-6 rounded-xl border-0 bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none hover:bg-gray-100"
                />
              </div>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 block">মোবাইল নম্বর</label>
          <div className="relative">
            <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
              <Input
                name="phone"
                placeholder="01xxxxxxxxx"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={isLoading}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={11}
                className="pl-10 py-6 rounded-xl border-0 bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none hover:bg-gray-100"
              />
            </div>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 block">পাসওয়ার্ড</label>
          <div className="relative">
            <div className="relative rounded-xl p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gray-200 transition-all duration-300">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="পাসওয়ার্ড লিখুন..."
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                minLength={6}
                className="pl-10 pr-10 py-6 rounded-xl border-0 bg-white focus:ring-0 focus:ring-offset-0 focus:outline-none hover:bg-gray-100"
              />
            </div>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full py-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              অপেক্ষা করুন...
            </span>
          ) : (
            isLogin ? "লগইন করুন" : "একাউন্ট তৈরি করুন"
          )}
        </Button>

        <div className="text-center pt-4">
          <button 
            type="button" 
            onClick={toggleForm}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline transition-colors"
          >
            {isLogin ? "নতুন একাউন্ট তৈরি করুন" : "আপনার একাউন্টে লগইন করুন"}
          </button>
        </div>
      </form>
    </Card>
  )
}