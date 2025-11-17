"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function AdminLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("adminId", data.adminId)
        localStorage.setItem("adminRole", data.role)
        router.push("/admin")
      } else {
        setError(data.error || "Login failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-800/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-800/20 rounded-full blur-3xl animate-pulse-medium"></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-pink-800/20 rounded-full blur-3xl animate-pulse-fast"></div>
      </div>
      
      {/* Glass Card with Deep Background */}
      <Card className="p-8 w-full max-w-md rounded-2xl backdrop-blur-xl bg-gray-900/70 border border-indigo-500/30 shadow-2xl animate-fadeIn transform transition-all duration-500 hover:scale-[1.02]">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl flex items-center justify-center mb-4 shadow-xl backdrop-blur-sm border border-indigo-500/30">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center animate-gradient-shift">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center text-white drop-shadow-lg">Admin Login</h1>
          <p className="text-indigo-200 mt-2 drop-shadow">Welcome to THE WORLD BANK Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium block mb-2 text-indigo-100 drop-shadow">Email</label>
            <Input
              name="email"
              type="email"
              placeholder="admin@example.com"
              value={credentials.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="rounded-xl border border-indigo-500/30 bg-gray-800/50 backdrop-blur-sm shadow-inner focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-white placeholder-indigo-300"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2 text-indigo-100 drop-shadow">Password</label>
            <Input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="rounded-xl border border-indigo-500/30 bg-gray-800/50 backdrop-blur-sm shadow-inner focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-white placeholder-indigo-300"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700/50 text-red-200 rounded-xl text-sm animate-shake backdrop-blur-sm">
              {error}
            </div>
          )}
          
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-4 backdrop-blur-sm border border-indigo-500/30">
            <p className="text-sm font-medium text-indigo-100 mb-2 drop-shadow">Available roles:</p>
            <ul className="space-y-1">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm text-indigo-100 drop-shadow"><span className="font-semibold">administrator</span> - Full access</span>
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm text-indigo-100 drop-shadow"><span className="font-semibold">admin</span> - Standard access</span>
              </li>
            </ul>
          </div>

          <Button 
            type="submit" 
            className="w-full py-3 bg-gradient-to-r from-indigo-700/50 to-purple-700/50 hover:from-indigo-600/60 hover:to-purple-600/60 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium backdrop-blur-sm border border-indigo-500/30 group"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                <span className="animate-pulse">Logging in...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span>Login</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            )}
          </Button>
        </form>
      </Card>
      
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.1); opacity: 0.4; }
        }
        @keyframes pulse-medium {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.05); opacity: 0.3; }
        }
        @keyframes pulse-fast {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.15); opacity: 0.25; }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
        .animate-pulse-medium {
          animation: pulse-medium 6s infinite ease-in-out;
        }
        .animate-pulse-fast {
          animation: pulse-fast 4s infinite ease-in-out;
        }
        .animate-gradient-shift {
          background: linear-gradient(45deg, #4f46e5, #7c3aed, #ec4899);
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        `}
      </style>
    </main>
  )
}