"use client"

import { AuthForm } from "@/components/auth-form"
import { useIsMobile } from "@/hooks/use-mobile"

export default function LoginPage() {
  const isMobile = useIsMobile()

  if (!isMobile) {
    return (
      <div className="min-h-screen flex">
        {/* Logo Side - 50% width with multi-layer animated gradient background */}
        <div className="w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-12 animate-gradient relative overflow-hidden">
          {/* Animated background layers */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-indigo-600/20 animate-pulse-slow"></div>
          <div className="absolute inset-0 bg-gradient-to-bl from-indigo-600/30 to-blue-400/30 animate-float"></div>
          
          {/* Floating elements */}
          <div className="absolute top-1/4 left-1/4 w-24 h-24 rounded-full bg-blue-400/20 blur-xl animate-float"></div>
          <div className="absolute bottom-1/3 right-1/3 w-32 h-32 rounded-full bg-indigo-500/20 blur-xl animate-pulse-slow"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-blue-300/30 blur-lg animate-morph"></div>
          
          <div className="text-center relative z-10">
            <img 
              src="/The World Bank.png" 
              alt="The World Bank Logo" 
              className="max-w-full max-h-64 object-contain mx-auto animate-float filter brightness-0 invert"
            />
          </div>
        </div>
        
        {/* Login Form Side - 50% width with white background */}
        <div className="w-1/2 bg-white flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <AuthForm isLogin={true} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className={`phone-frame min-h-screen flex flex-col bg-gradient-to-br from-blue-600 to-indigo-700`}>
      {/* Logo section at the top */}
      <div className="w-full p-8 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-indigo-600/20 animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-indigo-600/30 to-blue-400/30 animate-float"></div>
        
        <div className="text-center p-4 relative z-10">
          <img 
            src="/The World Bank.png" 
            alt="The World Bank Logo" 
            className="max-w-full max-h-32 object-contain mx-auto filter brightness-0 invert"
          />
        </div>
      </div>
      
      {/* Login form section below */}
      <div className="flex-1 flex items-center justify-center p-4 bg-white rounded-t-3xl -mt-6 z-10">
        <div className="w-full max-w-sm">
          <AuthForm isLogin={true} />
        </div>
      </div>
    </main>
  )
}