"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Home, Wallet, HelpCircle, User, LogOut } from 'lucide-react'

const navItems = [
  { label: "হোম", href: "/dashboard", icon: Home },
  { label: "কিস্তি", href: "/my-loans", icon: Wallet },
  { label: "সাহায্য", href: "/help", icon: HelpCircle },
  { label: "প্রোফাইল", href: "/profile", icon: User },
]

export function BottomNavigation() {
  const pathname = usePathname()
  const isMobile = useIsMobile()

  if (!isMobile) {
    return (
      <nav className="desktop-nav">
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center">
            <img 
              src="/The_World_Bank_logo.png" 
              alt="বিশ্ব ব্যাংক বাংলাদেশের ঋণ সেবা" 
              className="h-10 w-auto"
            />
          </Link>
        </div>
        <div className="desktop-nav-links mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "desktop-nav-link flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 relative group",
                  isActive 
                    ? "text-blue-600 bg-blue-50 shadow-sm" 
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50/50"
                )}
              >
                {/* Animated underline effect for active state */}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 w-4/5 h-0.5 bg-blue-600 rounded-full transform -translate-x-1/2 transition-all duration-300"></span>
                )}
                
                {/* Icon with hover effect */}
                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  isActive ? "text-blue-600" : "text-gray-500 group-hover:text-blue-500"
                )} />
                
                {/* Text with hover effect */}
                <span className={cn(
                  "transition-all duration-300",
                  isActive ? "font-semibold" : "group-hover:font-medium"
                )}>
                  {item.label}
                </span>
                
                {/* Glow effect on hover */}
                <span className="absolute inset-0 rounded-lg bg-blue-500/0 group-hover:bg-blue-500/5 transition-all duration-300 pointer-events-none"></span>
              </Link>
            )
          })}
        </div>
        <div className="flex items-center space-x-4">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            onClick={() => {
              localStorage.removeItem("userId");
              window.location.href = "/login";
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>লগ আউট</span>
          </button>
        </div>
      </nav>
    )
  }

  // Mobile view with enhanced styling
  return (
    <nav className="bottom-nav flex items-center justify-around bg-white border-t border-gray-200 shadow-lg rounded-t-2xl">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 py-3 flex flex-col items-center justify-center text-xs gap-1 transition-all duration-300 relative group",
              isActive
                ? "text-blue-600 font-semibold" 
                : "text-gray-500 hover:text-blue-500"
            )}
          >
            {/* Icon with enhanced styling */}
            <div className={cn(
              "p-2 rounded-full transition-all duration-300",
              isActive 
                ? "bg-blue-100 text-blue-600 scale-110" 
                : "group-hover:bg-blue-50 group-hover:text-blue-500"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            
            {/* Text with hover effect */}
            <span className={cn(
              "transition-all duration-300 mt-1",
              isActive ? "font-semibold" : "group-hover:font-medium"
            )}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}