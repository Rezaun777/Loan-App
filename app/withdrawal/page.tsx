"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useIsMobile } from "@/hooks/use-mobile";

export default function WithdrawalPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loanData, setLoanData] = useState<any>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
      router.push("/login");
      return;
    }

    // Fetch user profile data
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/user/profile", {
          headers: { "x-user-id": userId },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    // Fetch loan data
    const fetchLoanData = async () => {
      try {
        const response = await fetch("/api/user/loan", {
          headers: { "x-user-id": userId },
        });

        if (response.ok) {
          const loanData = await response.json();
          setLoanData(loanData);
          // Set default selected amount to loan amount
          // setSelectedAmount(loanData?.amount?.toString() || "0"); // Removed dropdown
        }
      } catch (err) {
        console.error("Failed to fetch loan data:", err);
      }
    };

    Promise.all([fetchUserProfile(), fetchLoanData()])
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 mb-6 mx-auto">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-foreground text-xl font-medium">লোড হচ্ছে...</p>
          <p className="text-gray-500 mt-2">আপনার তথ্য আনা হচ্ছে</p>
        </div>
      </div>
    );
  }
  
  if (!isMobile) {
    // Desktop view
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <BottomNavigation />
        <main className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">
              বিশ্ব ব্যাংকের আর্থিক সেবায় আপনাকে স্বাগতম
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Main Card */}
            <div>
              <Card className="p-8 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-2xl rounded-3xl h-full">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800">
                    ঋণ উত্তোলনের বিবরণ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-md">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">মোট টাকার পরিমান</h3>
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                        ৳{loanData?.amount?.toLocaleString() || "0"}
                      </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-md">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">ব্যবহারকারীর নাম</h3>
                      <p className="text-xl font-medium text-gray-800">
                        {user?.personalInfo?.fullName || user?.name || "N/A"}
                      </p>
                    </div>
                    
                    <Button 
                      className="w-full py-6 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl"
                      onClick={() => router.push("/final-withdrawal")}
                    >
                      উত্তোলন করুন
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Success Section */}
            <div>
              <Card className="p-8 bg-gradient-to-br from-white to-green-50 border border-green-100 shadow-2xl rounded-3xl h-full flex flex-col items-center justify-center text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6 mx-auto">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <p className="text-xl md:text-2xl font-medium text-gray-800 mb-6">
                  অভিনন্দন! আপনার ঋণটি পাশ করা হয়েছে, আপনি এখন টাকা উত্তোলন করতে পারবেন।
                </p>
                <Button 
                  className="py-4 px-8 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl"
                  onClick={() => router.push("/final-withdrawal")}
                >
                  উত্তোলন করুন
                </Button>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Mobile view with moon-shaped header and static navbar
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
      
      {/* Withdrawal content section with improved styling and bottom padding for nav */}
      <div className="flex-1 flex flex-col px-4 pb-20 bg-gradient-to-b from-blue-50/90 to-indigo-100/90 backdrop-blur-sm w-full">
        {/* Curved top to match header */}
        <div className="h-8 bg-gradient-to-b from-white/30 to-transparent rounded-t-[50%] -mt-4 w-full"></div>
        <div className="space-y-8 flex-1 w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent mb-2">
              বিশ্ব ব্যাংকের আর্থিক সেবায় আপনাকে স্বাগতম
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto"></div>
          </div>

          {/* Main Card */}
          <Card className="p-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold text-gray-800">
                ঋণ উত্তোলনের বিবরণ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                  <h3 className="text-base font-semibold text-gray-700 mb-1">মোট টাকার পরিমান</h3>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                    ৳{loanData?.amount?.toLocaleString() || "0"}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                  <h3 className="text-base font-semibold text-gray-700 mb-1">ব্যবহারকারীর নাম</h3>
                  <p className="text-lg font-medium text-gray-800">
                    {user?.personalInfo?.fullName || user?.name || "N/A"}
                  </p>
                </div>
                
                <Button 
                  className="w-full py-5 text-base font-bold bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
                  onClick={() => router.push("/final-withdrawal")}
                >
                  উত্তোলন করুন
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Success Section */}
          <Card className="p-6 bg-gradient-to-br from-white to-green-50 border border-green-100 rounded-2xl shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-base font-medium text-gray-800 mb-4">
              অভিনন্দন! আপনার ঋণটি পাশ করা হয়েছে, আপনি এখন টাকা উত্তোলন করতে পারবেন।
            </p>
            <Button 
              className="py-3 px-6 text-base font-bold bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
              onClick={() => router.push("/final-withdrawal")}
            >
              উত্তোলন করুন
            </Button>
          </Card>
        </div>
      </div>
      
      {/* Static bottom navigation - always visible and not overlapping content */}
      <div className="relative z-20">
        <BottomNavigation />
      </div>
    </main>
  );
}