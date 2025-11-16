"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { ImageUploadForm } from "@/components/image-upload-form"
import { useIsMobile } from "@/hooks/use-mobile"

export default function ImageUploadsPage() {
  const router = useRouter()
  const isMobile = useIsMobile()

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      router.push("/login")
    }
  }, [router])

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="desktop-form-container py-8">
          <div className="desktop-card">
            <ImageUploadForm />
          </div>
        </div>
      </div>
    )
  }

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
      
      {/* Image upload form section with improved styling and bottom padding for nav */}
      <div className="flex-1 flex items-center justify-center px-4 pb-20 bg-gradient-to-b from-blue-50/90 to-indigo-100/90 backdrop-blur-sm">
        {/* Curved top to match header */}
        <div className="h-8 bg-gradient-to-b from-white/30 to-transparent rounded-t-[50%] -mt-4 w-full"></div>
        <div className="w-full max-w-md">
          <div className="p-6 w-full shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl">
            <ImageUploadForm />
          </div>
        </div>
      </div>
      
      {/* Static bottom navigation - always visible and not overlapping content */}
      <div className="relative z-20">
        <BottomNavigation />
      </div>
    </main>
  )
}