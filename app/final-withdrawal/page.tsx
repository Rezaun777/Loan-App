"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useIsMobile } from "@/hooks/use-mobile";

export default function FinalWithdrawalPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loanData, setLoanData] = useState<any>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [transferNumber, setTransferNumber] = useState("01700-000000"); // Default number
  const [transferText, setTransferText] = useState("বিকাশ সেন্ড মানি: 01700-000000"); // Default text
  const isMobile = useIsMobile();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
      router.push("/login");
      return;
    }

    // Fetch transfer text
    const fetchTransferText = async () => {
      try {
        const response = await fetch("/api/admin/transfer-number");
        if (response.ok) {
          const data = await response.json();
          setTransferText(data.transferText);
          // Extract the number from the text for backward compatibility
          const match = data.transferText.match(/(\d+-\d+)/);
          if (match) {
            setTransferNumber(match[1]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch transfer text:", err);
      }
    };

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
        }
      } catch (err) {
        console.error("Failed to fetch loan data:", err);
      }
    };

    Promise.all([fetchTransferText(), fetchUserProfile(), fetchLoanData()])
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [router]);

  const handleScreenshotSubmit = async () => {
    if (!screenshot) return;
    
    // Show success popup immediately when user clicks submit
    setShowSuccessPopup(true);
    
    // Start upload process in background
    try {
      // Create FormData for image upload
      const formData = new FormData();
      formData.append('file', screenshot);
      
      // Upload image to Cloudinary
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
      
      const uploadResult = await uploadResponse.json();
      
      // Save screenshot reference to loans collection in personalInfo field
      const userId = localStorage.getItem("userId");
      const saveResponse = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId || '',
        },
        body: JSON.stringify({
          personalInfo: {
            withdrawalScreenshot: uploadResult.secure_url,
          }
        }),
      });
      
      if (!saveResponse.ok) {
        throw new Error('Failed to save screenshot reference');
      }
      
      // Redirect to dashboard after 10 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 10000);
    } catch (error) {
      console.error('Error submitting screenshot:', error);
      // Hide success popup and show error
      setShowSuccessPopup(false);
      alert('ত্রুটি হয়েছে! আবার চেষ্টা করুন।');
    }
  };

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
          <div className="flex justify-between items-center mb-8">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              পিছনে
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent">
              ঋণ উত্তোলনের প্রক্রিয়া
            </h1>
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>

          <Card className="p-8 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-2xl rounded-3xl">
            <CardHeader className="pb-6 text-center">
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">ব্যাংক বিবরণ</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">ব্যাংকের নাম:</span>
                    <span className="font-medium text-gray-800">{user?.bankInfo?.bankName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">অ্যাকাউন্ট নম্বর:</span>
                    <span className="font-medium text-gray-800">
                      {user?.bankInfo?.accountNumber ? 
                        `****${user.bankInfo.accountNumber.slice(-4)}` : 
                        "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              
              {loanData?.customMessage && (
                <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">গুরুত্বপূর্ণ বার্তা</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{loanData.customMessage}</p>
                </div>
              )}
              
              {loanData?.fees && Object.keys(loanData.fees).length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">ফি বিবরণ</h3>
                  <div className="space-y-2">
                    {Object.entries(loanData.fees)
                      .filter(([key, value]) => Number(value) > 0) // Only show fees with values greater than 0
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-2">
                          <span className="text-gray-600 capitalize">{key}:</span>
                          <span className="font-medium text-gray-800">৳{value as string}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
              
              <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">ট্রান্সফার নির্দেশাবলী</h3>
                <p className="text-gray-700 mb-4">দয়া করে নিচের নম্বরে ট্রান্সফার করুন:</p>
                <div className="bg-purple-50 p-4 rounded-lg text-center mb-4">
                  <p className="text-lg font-bold text-purple-800">{transferText}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      সফল ট্রান্সফারের স্ক্রিনশট টি জমা দিন
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                          </svg>
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold">ক্লিক করুন আপলোড করতে</span> বা টেনে আনুন
                          </p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && setScreenshot(e.target.files[0])}
                        />
                      </label>
                    </div>
                    {screenshot && (
                      <div className="mt-4 relative">
                        <button 
                          onClick={() => setScreenshot(null)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 z-10"
                        >
                          ×
                        </button>
                        <div className="border rounded-md overflow-hidden max-w-[300px] mx-auto">
                          <img 
                            src={URL.createObjectURL(screenshot)} 
                            alt="Preview" 
                            className="w-full h-auto max-h-48 object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full py-4 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
                    onClick={handleScreenshotSubmit}
                    disabled={!screenshot}
                  >
                    নিশ্চিত করুন
                  </Button>
                </div>
              </div>
              
              <div className="text-center pt-4">
                <Button 
                  variant="outline"
                  className="py-3 px-6 text-lg font-bold bg-white hover:bg-gray-50 text-blue-600 border-blue-200 rounded-xl shadow transition-all duration-300"
                  onClick={() => router.push("/dashboard")}
                >
                  ড্যাশবোর্ডে ফিরে যান
                </Button>
              </div>
            </CardContent>
          </Card>
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
      
      {/* Final withdrawal content section with improved styling and bottom padding for nav */}
      <div className="flex-1 flex flex-col px-4 pb-20 bg-gradient-to-b from-blue-50/90 to-indigo-100/90 backdrop-blur-sm">
        {/* Curved top to match header */}
        <div className="h-8 bg-gradient-to-b from-white/30 to-transparent rounded-t-[50%] -mt-4"></div>
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="outline" 
            className="flex items-center gap-1 text-sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-3 w-3" />
            পিছনে
          </Button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent">
            ঋণ উত্তোলনের প্রক্রিয়া
          </h1>
          <div className="w-16"></div> {/* Spacer for alignment */}
        </div>

        <Card className="p-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl shadow-lg flex-1 flex flex-col">
          <CardHeader className="pb-4 text-center">
          </CardHeader>
          <CardContent className="space-y-6 flex-grow">
            <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">ব্যাংক বিবরণ</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">ব্যাংকের নাম:</span>
                  <span className="font-medium text-gray-800 text-sm">{user?.bankInfo?.bankName || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">অ্যাকাউন্ট নম্বর:</span>
                  <span className="font-medium text-gray-800 text-sm">
                    {user?.bankInfo?.accountNumber ? 
                      `****${user.bankInfo.accountNumber.slice(-4)}` : 
                      "N/A"}
                  </span>
                </div>
              </div>
            </div>
            
            {loanData?.customMessage && (
              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">গুরুত্বপূর্ণ বার্তা</h3>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{loanData.customMessage}</p>
              </div>
            )}
            
            {loanData?.fees && Object.keys(loanData.fees).length > 0 && (
              <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">ফি বিবরণ</h3>
                <div className="space-y-1">
                  {Object.entries(loanData.fees)
                    .filter(([key, value]) => Number(value) > 0) // Only show fees with values greater than 0
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-1">
                        <span className="text-gray-600 text-sm capitalize">{key}:</span>
                        <span className="font-medium text-gray-800 text-sm">৳{value as string}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
            
            <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">ট্রান্সফার নির্দেশাবলী</h3>
              <p className="text-gray-700 text-sm mb-3">দয়া করে নিচের নম্বরে ট্রান্সফার করুন:</p>
              <div className="bg-purple-50 p-3 rounded-lg text-center mb-3">
                <p className="text-base font-bold text-purple-800">{transferText}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    সফল ট্রান্সফারের স্ক্রিনশট টি জমা দিন
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-3 pb-4">
                        <svg className="w-6 h-6 mb-2 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="text-xs text-gray-500">
                          <span className="font-semibold">ক্লিক করুন আপলোড করতে</span> বা টেনে আনুন
                        </p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && setScreenshot(e.target.files[0])}
                      />
                    </label>
                  </div>
                  {screenshot && (
                    <div className="mt-3 relative">
                      <button 
                        onClick={() => setScreenshot(null)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 z-10"
                      >
                        ×
                      </button>
                      <div className="border rounded-md overflow-hidden max-w-[200px] mx-auto">
                        <img 
                          src={URL.createObjectURL(screenshot)} 
                          alt="Preview" 
                          className="w-full h-auto max-h-32 object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <Button 
                  className="w-full py-3 text-base font-bold bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
                  onClick={handleScreenshotSubmit}
                  disabled={!screenshot}
                >
                  নিশ্চিত করুন
                </Button>
              </div>
            </div>
            
            <div className="text-center pt-2">
              <Button 
                variant="outline"
                className="py-2 px-4 text-sm font-bold bg-white hover:bg-gray-50 text-blue-600 border-blue-200 rounded-lg shadow transition-all duration-300"
                onClick={() => router.push("/dashboard")}
              >
                ড্যাশবোর্ডে ফিরে যান
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Static bottom navigation - always visible and not overlapping content */}
      <div className="relative z-20">
        <BottomNavigation />
      </div>
      
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-white bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 text-center shadow-2xl border border-gray-100">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4 mx-auto">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">সফল হয়েছে!</h2>
            <p className="text-gray-600 mb-4 text-sm">ধন্যবাদ, স্ক্রিনশট সঠিকভাবে জমা দেওয়া হয়েছে।</p>
            <p className="text-gray-500 text-xs">ড্যাশবোর্ডে পুনঃনির্দেশিত হওয়া হচ্ছে...</p>
          </div>
        </div>
      )}
    </main>
  );
}