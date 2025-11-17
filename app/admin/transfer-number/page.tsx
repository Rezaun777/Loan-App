"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import toast, { Toaster } from "react-hot-toast"

export default function TransferNumberPage() {
  const router = useRouter()
  const [transferText, setTransferText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const adminId = localStorage.getItem("adminId")
    if (!adminId) {
      router.push("/admin-login")
      return
    }

    fetchTransferText()
  }, [router])

  const fetchTransferText = async () => {
    try {
      const response = await fetch("/api/admin/transfer-number", {
        headers: {
          "x-admin-id": localStorage.getItem("adminId") || "", // Add admin ID header
        },
      })
      if (response.ok) {
        const data = await response.json()
        setTransferText(data.transferText || "")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to fetch transfer text")
      }
    } catch (error) {
      toast.error("Failed to fetch transfer text")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!transferText.trim()) {
      toast.error("Please enter a valid transfer text")
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch("/api/admin/transfer-number", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": localStorage.getItem("adminId") || "", // Add admin ID header
        },
        body: JSON.stringify({ transferText }),
      })

      if (response.ok) {
        toast.success("Transfer text updated successfully!")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to update transfer text")
      }
    } catch (error) {
      toast.error("Error updating transfer text")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-inner">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full bg-indigo-500 opacity-20 animate-ping"></div>
              <div className="absolute inset-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-spin"></div>
              <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-indigo-800 mb-2 animate-pulse">Loading Transfer Settings</h3>
            <p className="text-indigo-600 animate-bounce">Preparing your transfer configuration...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <AdminSidebar />
      <Toaster position="top-center" />
      <main className="flex-1 p-6 md:p-8">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Transfer Text Management</h1>
          <p className="text-gray-600 text-lg">Manage the transfer text for final withdrawal page</p>
        </div>

        <Card className="max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-slideInUp">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <CardHeader className="p-0">
              <CardTitle className="text-2xl font-bold">Transfer Text Settings</CardTitle>
              <CardDescription className="text-indigo-100 mt-2">Update the transfer text that appears on the final withdrawal page</CardDescription>
            </CardHeader>
          </div>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Transfer Text</label>
              <div className="relative">
                <Input
                  value={transferText}
                  onChange={(e) => setTransferText(e.target.value)}
                  placeholder="Enter transfer text (e.g., বিকাশ সেন্ড মানি: 01700-000000)"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 transition-all duration-300 shadow-sm hover:shadow-md"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <p className="text-xs text-gray-500 flex items-center">
                <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                This text will appear on the final withdrawal page for users to transfer money
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg px-8 py-3 font-semibold shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <style>
          {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-slideInUp {
            animation: slideInUp 0.5s ease-out forwards;
          }
          `}
        </style>
      </main>
    </div>
  )
}