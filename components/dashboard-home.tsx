"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext 
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { DollarSign, Calendar, CreditCard, FileText, User, Home, Phone, Briefcase, Target, Users, Building, Upload } from 'lucide-react'
import { convertToBanglaDigits } from "@/lib/utils"
import { calculateLoanDetails } from "@/lib/loan-calculation"
import { TypingAnimation } from "@/components/typing-animation"

interface LoanData {
  _id?: string
  amount?: number
  displayAmount?: number
  duration?: number
  monthlyInstallment?: number
  status?: string
  level?: string
  fees?: Record<string, number>
  customMessage?: string
  assignedTo?: string
  payoutNumber?: string
}

export function DashboardHome() {
  const [loanData, setLoanData] = useState<LoanData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useIsMobile()

  // Calculate loan details if we have the required data
  const loanDetails = loanData?.amount && loanData?.duration 
    ? calculateLoanDetails(loanData.amount, loanData.duration)
    : null

  // Romantic slider data with Bangla text
  const sliderData = [
    {
      id: 1,
      title: "আপনার স্বপ্নের পথচলা",
      description: "আমরা আপনার আর্থিক সহযোগী, বন্ধু এবং পরিবার",
      image: "/slider-1.png"
    },
    {
      id: 2,
      title: "নির্ভরযোগ্য সেবা",
      description: "আপনার ঋণের জন্য আমাদের দরজা সবসময় খোলা",
      image: "/slider-2.png"
    },
    {
      id: 3,
      title: "সম্পৃক্ত সমাধান",
      description: "আপনার ভবিষ্যতের জন্য আমরা এখানে আছি",
      image: "/slider-3.png"
    },
    {
      id: 4,
      title: "আর্থিক স্বাচ্ছন্দ্য",
      description: "আপনার জীবনে আর্থিক স্বাচ্ছন্দ্য এনে দিন",
      image: "/slider-4.png"
    },
    {
      id: 5,
      title: "বিশ্বস্ত অংশীদার",
      description: "আপনার স্বপ্ন পূরণে আমরা সঙ্গী",
      image: "/slider-5.png"
    }
  ]

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

  // Function to get level label in Bangla
  const getLevelLabel = (level: string) => {
    const levelLabels: Record<string, string> = {
      transfer: "ট্রান্সফার",
      insurance: "বীমা",
      vip: "ভিআইপি",
      maintenance: "রক্ষণাবেক্ষণ",
      fault: "ত্রুটি",
      custom: "কাস্টম"
    }
    
    return levelLabels[level] || level
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 mb-6">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-foreground text-xl font-medium">লোড হচ্ছে...</p>
          <p className="text-gray-500 mt-2">আপনার ড্যাশবোর্ড ডেটা আনা হচ্ছে</p>
        </div>
      </div>
    )
  }

  if (!isMobile) {
    // Desktop view - Professional modern design
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Professional Header with Text */}
        <div className="mb-10 text-center">
          <Link href="/dashboard" className="inline-block mb-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent mb-3">বিশ্ব ব্যাংক বাংলাদেশের ঋণ সেবা</h1>
          </Link>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">আপনার আর্থিক সহযোগী, বন্ধু এবং পরিবার - আমরা আপনার স্বপ্ন পূরণে সহায়তা করি</p>
        </div>

        {/* Status Card - Modern Design */}
        <Card className="p-10 bg-gradient-to-br from-white to-amber-50 border border-amber-100 shadow-2xl rounded-3xl transition-all duration-300 hover:shadow-3xl mb-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 mb-4">
              <Target className="h-7 w-7 text-amber-700" />
            </div>
            <h2 className="text-4xl font-bold text-gray-800">আবেদনের অবস্থা</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full mx-auto mt-4"></div>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="p-8 bg-gradient-to-r from-white to-amber-50 rounded-2xl border border-amber-200 shadow-md mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-6 mx-auto">
                <Users className="h-8 w-8 text-amber-700" />
              </div>
              {loanData?.status === 'pass' ? (
                <TypingAnimation 
                  text="আপনার লোনের আবেদনটি পাস হয়ে এসেছে।"
                  speed={50}
                  delay={15000}
                  restartDelay={2000}
                  className="text-green-800 text-2xl font-medium"
                />
              ) : (
                <TypingAnimation 
                  text="আপনে আবেদনটি যাচাই-বাছাই চলতেছে..."
                  speed={50}
                  delay={15000}
                  restartDelay={2000}
                  className="text-amber-800 text-2xl font-medium"
                />
              )}
              <p className="text-amber-600 mt-4">
                {loanData?.status === 'pass' 
                  ? "আপনার অর্থটি উত্তোলন করার জন্য উত্তোলন করুন বটনটিতে ক্লিক করুন।" 
                  : "আমাদের টিম শীঘ্রই আপনার আবেদনটি পর্যালোচনা করবে"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-amber-100 text-center shadow-md transition-all duration-300 hover:shadow-lg">
                <p className="text-amber-700 font-medium text-lg mb-2">অবস্থা</p>
                <p className="text-3xl font-bold text-amber-900 mt-2 bg-gradient-to-r from-amber-700 to-orange-800 bg-clip-text text-transparent">{getStatusLabel(loanData?.status || "pending")}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-amber-100 text-center shadow-md transition-all duration-300 hover:shadow-lg flex items-center justify-center">
                <Button 
                  className={`py-3 px-6 text-lg font-bold rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${loanData?.status === 'pass' || loanData?.status === 'pay_pending' || loanData?.status === 'pay_pass' ? 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white' : 'bg-gradient-to-r from-red-600 to-red-800 text-white cursor-not-allowed opacity-80'}`}
                  onClick={() => {
                    if (loanData?.status === 'pass' || loanData?.status === 'pay_pending' || loanData?.status === 'pay_pass') {
                      window.location.href = '/withdrawal'
                    }
                  }}
                  disabled={!(loanData?.status === 'pass' || loanData?.status === 'pay_pending' || loanData?.status === 'pay_pass')}
                >
                  উত্তোলন করুন
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Professional Carousel */}
        <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/10 transition-all duration-300 hover:shadow-3xl">
          <Carousel 
            className="w-full"
            opts={{
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 7000,
              }) as any,
            ]}
          >
            <CarouselContent className="h-[500px]">
              {sliderData.map((slide, index) => (
                <CarouselItem key={slide.id} className="relative h-full">
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${slide.image})` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-8 max-w-4xl animate-fadeIn">
                      <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-2xl">{slide.title}</h2>
                      <p className="text-xl md:text-2xl text-white/95 font-medium drop-shadow-lg max-w-3xl mx-auto leading-relaxed mb-8">{slide.description}</p>
                      <div className="mt-8 flex justify-center space-x-4">
                        {[...Array(3)].map((_, i) => (
                          <div 
                            key={i} 
                            className="w-5 h-5 bg-white/80 rounded-full transition-all duration-700 ease-in-out shadow-lg"
                            style={{ 
                              animation: `pulse 2s infinite ${i * 0.3}s`,
                              transform: `scale(${index % 3 === i ? 1.3 : 1})`
                            }} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-8 bg-white/30 hover:bg-white/50 text-white border-none size-16 backdrop-blur-md transition-all duration-300 shadow-lg" />
            <CarouselNext className="absolute right-8 bg-white/30 hover:bg-white/50 text-white border-none size-16 backdrop-blur-md transition-all duration-300 shadow-lg" />
          </Carousel>
        </div>

        {/* Main Loan Summary Card - Modern Design */}
        <Card className="p-10 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-2xl rounded-3xl transition-all duration-300 hover:shadow-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-4">
              <FileText className="h-7 w-7 text-blue-700" />
            </div>
            <h2 className="text-4xl font-bold text-gray-800">আপনার ঋণের বিবরণ</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 mb-6">
                <DollarSign className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">মোট ঋণের পরিমাণ</h3>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">৳{convertToBanglaDigits((loanData?.displayAmount || loanData?.amount)?.toLocaleString("en-US") || "0")}</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-indigo-100 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 mb-6">
                <Calendar className="h-8 w-8 text-indigo-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">ঋণের মেয়াদ</h3>
              <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">{convertToBanglaDigits(loanData?.duration || "0")} মাস</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-purple-100 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 mb-6">
                <CreditCard className="h-8 w-8 text-purple-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">প্রতি মাসে পরিশোধ</h3>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent">৳{loanDetails ? convertToBanglaDigits(loanDetails.monthlyInstallment.toFixed(2)) : "0"}</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Mobile view - Professional modern design
  return (
    <Card className="p-6 w-full space-y-8 bg-gradient-to-b from-white to-blue-50 border-0 shadow-none">
      {/* Professional Header with Text */}
      <div className="text-center mb-8">
        <Link href="/dashboard" className="inline-block mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent mb-2">বিশ্ব ব্যাংক বাংলাদেশের ঋণ সেবা</h1>
        </Link>
        <p className="text-gray-600 text-base">আপনার আর্থিক সহযোগী, বন্ধু এবং পরিবার</p>
      </div>

      {/* Status Card - Modern Design */}
      <Card className="p-8 bg-gradient-to-br from-white to-amber-50 border border-amber-100 rounded-2xl shadow-lg mb-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4 mx-auto">
            <Target className="h-6 w-6 text-amber-700" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">আবেদনের অবস্থা</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full mx-auto mt-3"></div>
        </div>
        <div className="p-5 bg-gradient-to-r from-white to-amber-50 rounded-xl border border-amber-200 mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4 mx-auto">
            <Users className="h-6 w-6 text-amber-700" />
          </div>
          {loanData?.status === 'pass' ? (
            <TypingAnimation 
              text="আপনার লোনের আবেদনটি পাস হয়ে এসেছে।"
              speed={50}
              delay={15000}
              restartDelay={2000}
              className="text-green-800 text-lg font-medium"
            />
          ) : (
            <TypingAnimation 
              text="আপনে আবেদনটি যাচাই-বাছাই চলতেছে..."
              speed={50}
              delay={15000}
              restartDelay={2000}
              className="text-amber-800 text-lg font-medium"
            />
          )}
          <p className="text-amber-600 text-sm mt-2">
            {loanData?.status === 'pass' 
              ? "আপনার অর্থটি উত্তোলন করার জন্য উত্তোলন করুন বটনটিতে ক্লিক করুন।" 
              : "আমাদের টিম শীঘ্রই আপনার আবেদনটি পর্যালোচনা করবে"}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-4 rounded-xl border border-amber-100 text-center shadow-sm transition-all duration-300 hover:shadow-md">
            <p className="text-amber-700 font-medium">অবস্থা</p>
            <p className="text-2xl font-bold text-amber-900 mt-1 bg-gradient-to-r from-amber-700 to-orange-800 bg-clip-text text-transparent">{getStatusLabel(loanData?.status || "pending")}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-amber-100 text-center shadow-sm transition-all duration-300 hover:shadow-md flex items-center justify-center">
            <Button 
              className={`py-2 px-4 text-base font-bold rounded-xl shadow-lg transition-all duration-300 hover:shadow-md ${loanData?.status === 'pass' || loanData?.status === 'pay_pending' || loanData?.status === 'pay_pass' ? 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white' : 'bg-gradient-to-r from-red-600 to-red-800 text-white cursor-not-allowed opacity-80'}`}
              onClick={() => {
                if (loanData?.status === 'pass' || loanData?.status === 'pay_pending' || loanData?.status === 'pay_pass') {
                  window.location.href = '/withdrawal'
                }
              }}
              disabled={!(loanData?.status === 'pass' || loanData?.status === 'pay_pending' || loanData?.status === 'pay_pass')}
            >
              উত্তোলন করুন
            </Button>
          </div>
        </div>
      </Card>

      {/* Enhanced Professional Slider for Mobile */}
      <div className="mb-8 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/10">
        <Carousel 
          className="w-full"
          opts={{
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 7000,
            }) as any,
          ]}
        >
          <CarouselContent className="h-80">
            {sliderData.map((slide, index) => (
              <CarouselItem key={slide.id} className="relative h-full">
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${slide.image})` }}
                />
                <div className="absolute inset-0 flex flex-col justify-end items-center p-6">
                  <div className="text-center animate-fadeIn mb-8">
                    <h2 className="text-xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">{slide.title}</h2>
                    <p className="text-sm text-white/90 font-medium drop-shadow-md leading-relaxed mb-4">{slide.description}</p>
                    <div className="flex justify-center space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-3 h-3 bg-white/80 rounded-full transition-all duration-700 ease-in-out shadow-md"
                          style={{ 
                            animation: `pulse 2s infinite ${i * 0.3}s`,
                            transform: `scale(${index % 3 === i ? 1.2 : 1})`
                          }} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Main Loan Summary Card - Modern Design */}
      <Card className="p-8 bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4 mx-auto">
            <FileText className="h-6 w-6 text-blue-700" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">আপনার ঋণের বিবরণ</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mt-3"></div>
        </div>
        <div className="grid grid-cols-1 gap-5">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100 flex items-center transition-all duration-300 hover:shadow-md">
            <div className="mr-4 p-3 rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
              <DollarSign className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-xs text-blue-600">মোট ঋণের পরিমাণ</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">৳{convertToBanglaDigits((loanData?.displayAmount || loanData?.amount)?.toLocaleString("en-US") || "0")}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100 flex items-center transition-all duration-300 hover:shadow-md">
            <div className="mr-4 p-3 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200">
              <Calendar className="h-6 w-6 text-indigo-700" />
            </div>
            <div>
              <p className="text-xs text-blue-600">ঋণের মেয়াদ</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">{convertToBanglaDigits(loanData?.duration || "0")} মাস</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100 flex items-center transition-all duration-300 hover:shadow-md">
            <div className="mr-4 p-3 rounded-full bg-gradient-to-br from-purple-100 to-purple-200">
              <CreditCard className="h-6 w-6 text-purple-700" />
            </div>
            <div>
              <p className="text-xs text-blue-600">প্রতি মাসে পরিশোধ</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent">৳{loanDetails ? convertToBanglaDigits(loanDetails.monthlyInstallment.toFixed(2)) : "0"}</p>
            </div>
          </div>
        </div>
      </Card>
    </Card>
  )
}