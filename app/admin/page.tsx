"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"

interface DashboardStats {
  totalMembers: number
  loanApplied: number
  notYet: number
  transfer: number
  insurance: number
  vip: number
  maintenance: number
  fault: number
  loanPending: number
  loanPass: number
  payPending: number
  payPass: number
  rejected: number
}

interface StatCardProps {
  label: string
  value: number
  bgColor: string
  textColor: string
  icon: string
}

function StatCard({ label, value, bgColor, textColor, icon }: StatCardProps) {
  return (
    <Card className={`p-6 ${bgColor} border-0 shadow-md hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">{label}</p>
          <p className={`text-3xl font-bold ${textColor}`}>{value.toLocaleString()}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </Card>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    loanApplied: 0,
    notYet: 0,
    transfer: 0,
    insurance: 0,
    vip: 0,
    maintenance: 0,
    fault: 0,
    loanPending: 0,
    loanPass: 0,
    payPending: 0,
    payPass: 0,
    rejected: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [adminRole, setAdminRole] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem("language", "en")

    // Get admin role from localStorage
    const role = localStorage.getItem("adminRole")
    setAdminRole(role)

    const fetchStats = async () => {
      try {
        const adminId = localStorage.getItem("adminId")
        if (!adminId) {
          router.push("/admin-login")
          return
        }

        const [usersRes, loansRes] = await Promise.all([fetch("/api/admin/users"), fetch("/api/admin/loans")])

        if (usersRes.ok && loansRes.ok) {
          const users = await usersRes.json()
          const loans = await loansRes.json()

          const levelStats = {
            transfer: loans.filter((l: any) => l.level === "transfer").length,
            insurance: loans.filter((l: any) => l.level === "insurance").length,
            vip: loans.filter((l: any) => l.level === "vip").length,
            maintenance: loans.filter((l: any) => l.level === "maintenance").length,
            fault: loans.filter((l: any) => l.level === "fault").length,
          }

          setStats({
            totalMembers: users.length,
            loanApplied: loans.length,
            notYet: loans.filter((l: any) => !l.level).length,
            transfer: levelStats.transfer,
            insurance: levelStats.insurance,
            vip: levelStats.vip,
            maintenance: levelStats.maintenance,
            fault: levelStats.fault,
            loanPending: loans.filter((l: any) => l.status === "pending").length,
            loanPass: loans.filter((l: any) => l.status === "pass").length,
            payPending: loans.filter((l: any) => l.status === "pay_pending").length,
            payPass: loans.filter((l: any) => l.status === "pay_pass").length,
            rejected: loans.filter((l: any) => l.status === "rejected").length,
          })
        }
      } catch (err) {
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [router])

  const statCards = [
    {
      label: "Total Members",
      value: stats.totalMembers,
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      textColor: "text-blue-700 dark:text-blue-400",
      icon: "👥",
    },
    {
      label: "Loan Applied",
      value: stats.loanApplied,
      bgColor: "bg-purple-50 dark:bg-purple-900/30",
      textColor: "text-purple-700 dark:text-purple-400",
      icon: "📋",
    },
    {
      label: "Not Yet",
      value: stats.notYet,
      bgColor: "bg-gray-50 dark:bg-gray-800/30",
      textColor: "text-gray-700 dark:text-gray-400",
      icon: "⏳",
    },
    {
      label: "Transfer",
      value: stats.transfer,
      bgColor: "bg-green-50 dark:bg-green-900/30",
      textColor: "text-green-700 dark:text-green-400",
      icon: "💳",
    },
    {
      label: "Insurance",
      value: stats.insurance,
      bgColor: "bg-orange-50 dark:bg-orange-900/30",
      textColor: "text-orange-700 dark:text-orange-400",
      icon: "🛡️",
    },
    {
      label: "VIP",
      value: stats.vip,
      bgColor: "bg-yellow-50 dark:bg-yellow-900/30",
      textColor: "text-yellow-700 dark:text-yellow-400",
      icon: "👑",
    },
    {
      label: "Maintenance",
      value: stats.maintenance,
      bgColor: "bg-indigo-50 dark:bg-indigo-900/30",
      textColor: "text-indigo-700 dark:text-indigo-400",
      icon: "🔧",
    },
    {
      label: "Fault",
      value: stats.fault,
      bgColor: "bg-red-50 dark:bg-red-900/30",
      textColor: "text-red-700 dark:text-red-400",
      icon: "⚠️",
    },
    {
      label: "Loan Pending",
      value: stats.loanPending,
      bgColor: "bg-cyan-50 dark:bg-cyan-900/30",
      textColor: "text-cyan-700 dark:text-cyan-400",
      icon: "⏬",
    },
    {
      label: "Loan Pass",
      value: stats.loanPass,
      bgColor: "bg-teal-50 dark:bg-teal-900/30",
      textColor: "text-teal-700 dark:text-teal-400",
      icon: "✅",
    },
    {
      label: "Pay Pending",
      value: stats.payPending,
      bgColor: "bg-pink-50 dark:bg-pink-900/30",
      textColor: "text-pink-700 dark:text-pink-400",
      icon: "💰",
    },
    {
      label: "Pay Pass",
      value: stats.payPass,
      bgColor: "bg-lime-50 dark:bg-lime-900/30",
      textColor: "text-lime-700 dark:text-lime-400",
      icon: "🎉",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      bgColor: "bg-rose-50 dark:bg-rose-900/30",
      textColor: "text-rose-700 dark:text-rose-400",
      icon: "❌",
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col">
        {/* Professional Header with Light Colors */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">Welcome to THE WORLD BANK Financial Service Management</p>
              {adminRole && (
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    adminRole === "administrator" 
                      ? "bg-purple-100 text-purple-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    Role: {adminRole}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <p className="text-blue-700 text-sm font-medium">Last Updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content with Professional Light Color Palette */}
        <div className="flex-1 p-6 md:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-pulse rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              {/* Section 1: Top section with TOTAL MEMBERS and Loan Applied */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm p-6 border border-blue-100 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Total Members</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2 animate-countUp">{stats.totalMembers.toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <span className="text-2xl text-blue-600">👥</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(100, (stats.totalMembers / 1000) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-sm p-6 border border-purple-100 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-semibold uppercase tracking-wider">Loan Applied</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2 animate-countUp">{stats.loanApplied.toLocaleString()}</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <span className="text-2xl text-purple-600">📋</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(100, (stats.loanApplied / 500) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: LEVELS with Professional Design */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">LEVELS</h2>
                  <div className="bg-gray-100 px-3 py-1 rounded-full">
                    <p className="text-gray-600 text-xs font-semibold">Performance Metrics</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { label: "Not Yet", value: stats.notYet, color: "gray", icon: "⏳" },
                    { label: "Transfer", value: stats.transfer, color: "blue", icon: "💳" },
                    { label: "Insurance", value: stats.insurance, color: "green", icon: "🛡️" },
                    { label: "VIP", value: stats.vip, color: "yellow", icon: "👑" },
                    { label: "Maintenance", value: stats.maintenance, color: "indigo", icon: "🔧" },
                    { label: "Fault", value: stats.fault, color: "red", icon: "⚠️" }
                  ].map((item, index) => (
                    <div 
                      key={item.label}
                      className={`bg-${item.color}-50 rounded-xl p-4 border border-${item.color}-100 transform transition-all duration-300 hover:shadow-sm hover:-translate-y-1 hover:scale-105`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-xs font-semibold text-${item.color}-600 uppercase tracking-wide`}>{item.label}</p>
                          <p className="text-xl font-bold text-gray-800 mt-1 animate-countUp">{item.value.toLocaleString()}</p>
                        </div>
                        <span className={`text-xl text-${item.color}-500`}>{item.icon}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: STATUS with Professional Design */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">STATUS</h2>
                  <div className="bg-gray-100 px-3 py-1 rounded-full">
                    <p className="text-gray-600 text-xs font-semibold">Application Flow</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { label: "Not Yet", value: stats.notYet, color: "gray", icon: "⏳" },
                    { label: "Loan Pending", value: stats.loanPending, color: "cyan", icon: "⏬" },
                    { label: "Loan Pass", value: stats.loanPass, color: "teal", icon: "✅" },
                    { label: "Pay Pending", value: stats.payPending, color: "pink", icon: "💰" },
                    { label: "Pay Pass", value: stats.payPass, color: "lime", icon: "🎉" },
                    { label: "Rejected", value: stats.rejected, color: "rose", icon: "❌" }
                  ].map((item, index) => (
                    <div 
                      key={item.label}
                      className={`bg-${item.color}-50 rounded-xl p-4 border border-${item.color}-100 transform transition-all duration-300 hover:shadow-sm hover:-translate-y-1 hover:scale-105`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-xs font-semibold text-${item.color}-600 uppercase tracking-wide`}>{item.label}</p>
                          <p className="text-xl font-bold text-gray-800 mt-1 animate-countUp">{item.value.toLocaleString()}</p>
                        </div>
                        <span className={`text-xl text-${item.color}-500`}>{item.icon}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Enhanced Stats Summary with Animations */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-sm p-6 border border-indigo-100">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-lg font-bold text-gray-800">System Overview</h3>
                    <p className="text-gray-600 text-sm mt-1">Complete financial service management</p>
                  </div>
                  <div className="flex space-x-8">
                    <div className="text-center transform transition-all duration-500 hover:scale-110">
                      <p className="text-2xl font-bold text-indigo-600 animate-countUp">
                        {Math.round((stats.loanPass / (stats.loanApplied || 1)) * 100) || 0}%
                      </p>
                      <p className="text-gray-600 text-xs">Approval Rate</p>
                    </div>
                    <div className="text-center transform transition-all duration-500 hover:scale-110">
                      <p className="text-2xl font-bold text-rose-600 animate-countUp">
                        {Math.round((stats.rejected / (stats.loanApplied || 1)) * 100) || 0}%
                      </p>
                      <p className="text-gray-600 text-xs">Rejection Rate</p>
                    </div>
                    <div className="text-center transform transition-all duration-500 hover:scale-110">
                      <p className="text-2xl font-bold text-cyan-600 animate-countUp">
                        {stats.loanApplied - stats.loanPending - stats.loanPass - stats.rejected || 0}
                      </p>
                      <p className="text-gray-600 text-xs">In Progress</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Role-specific information */}
              {adminRole === "administrator" && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl shadow-sm p-6 border border-purple-100">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">👑</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-purple-800">Administrator Access</h3>
                      <p className="text-purple-700 mt-1">
                        You have full administrator privileges. You can access all system features including sensitive operations.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Custom Animation Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-countUp {
          animation: countUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}