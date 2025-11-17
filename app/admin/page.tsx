"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { AdminCharts } from "@/components/admin-charts"

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
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col">
        {/* Modern Gradient Header */}
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-indigo-100 text-sm mt-1">Welcome to THE WORLD BANK Financial Service Management</p>
              {adminRole && (
                <div className="mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    adminRole === "administrator" 
                      ? "bg-purple-800 text-purple-100" 
                      : "bg-indigo-800 text-indigo-100"
                  }`}>
                    Role: {adminRole}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
                <p className="text-white text-sm font-medium">Last Updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content with Modern Design */}
        <div className="flex-1 p-6 md:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              {/* Section 1: Top section with TOTAL MEMBERS and Loan Applied */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white transform transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Total Members</p>
                      <p className="text-4xl font-bold mt-2 animate-countUp">{stats.totalMembers.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <span className="text-3xl">👥</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-white h-3 rounded-full transition-all duration-1500 ease-out shadow-lg"
                        style={{ width: `${Math.min(100, (stats.totalMembers / 1000) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-blue-100 mt-2">
                      <span>0</span>
                      <span>{stats.totalMembers}</span>
                      <span>1000+</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white transform transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-semibold uppercase tracking-wider">Loan Applied</p>
                      <p className="text-4xl font-bold mt-2 animate-countUp">{stats.loanApplied.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <span className="text-3xl">📋</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-white h-3 rounded-full transition-all duration-1500 ease-out shadow-lg"
                        style={{ width: `${Math.min(100, (stats.loanApplied / 500) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-purple-100 mt-2">
                      <span>0</span>
                      <span>{stats.loanApplied}</span>
                      <span>500+</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: LEVELS with Awesome Progress Bars */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Loan Levels</h2>
                  <div className="bg-indigo-100 px-3 py-1 rounded-full">
                    <p className="text-indigo-700 text-xs font-semibold">Performance Metrics</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {[
                    { label: "Not Yet", value: stats.notYet, maxValue: stats.loanApplied, color: "gray", bgColor: "bg-gray-200", fillColor: "bg-gray-500", icon: "⏳" },
                    { label: "Transfer", value: stats.transfer, maxValue: stats.loanApplied, color: "blue", bgColor: "bg-blue-200", fillColor: "bg-blue-500", icon: "💳" },
                    { label: "Insurance", value: stats.insurance, maxValue: stats.loanApplied, color: "green", bgColor: "bg-green-200", fillColor: "bg-green-500", icon: "🛡️" },
                    { label: "VIP", value: stats.vip, maxValue: stats.loanApplied, color: "yellow", bgColor: "bg-yellow-200", fillColor: "bg-yellow-500", icon: "👑" },
                    { label: "Maintenance", value: stats.maintenance, maxValue: stats.loanApplied, color: "indigo", bgColor: "bg-indigo-200", fillColor: "bg-indigo-500", icon: "🔧" },
                    { label: "Fault", value: stats.fault, maxValue: stats.loanApplied, color: "red", bgColor: "bg-red-200", fillColor: "bg-red-500", icon: "⚠️" }
                  ].map((item, index) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg text-${item.color}-500`}>{item.icon}</span>
                          <span className="font-medium text-gray-700">{item.label}</span>
                        </div>
                        <span className="font-bold text-gray-800">{item.value.toLocaleString()}</span>
                      </div>
                      <div className={`${item.bgColor} rounded-full h-3 overflow-hidden`}>
                        <div 
                          className={`${item.fillColor} h-3 rounded-full transition-all duration-1000 ease-out shadow-sm`}
                          style={{ width: `${(item.value / (item.maxValue || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: STATUS with Advanced Progress Visualization */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-xl p-6 border border-indigo-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Application Status Flow</h2>
                  <div className="bg-purple-100 px-3 py-1 rounded-full">
                    <p className="text-purple-700 text-xs font-semibold">Application Pipeline</p>
                  </div>
                </div>
                
                {/* Status Pipeline Visualization */}
                <div className="relative pt-8 pb-4">
                  <div className="absolute top-12 left-0 right-0 h-2 bg-gray-200 rounded-full z-0"></div>
                  <div 
                    className="absolute top-12 left-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full z-10 transition-all duration-1500 ease-out"
                    style={{ width: `${(stats.loanApplied > 0 ? (stats.loanPass + stats.payPass + stats.rejected) / stats.loanApplied : 0) * 100}%` }}
                  ></div>
                  
                  <div className="relative z-20 flex justify-between">
                    {[
                      { label: "Applied", value: stats.loanApplied, icon: "📋", color: "bg-blue-500", position: "left-0" },
                      { label: "In Progress", value: stats.loanApplied - stats.loanPass - stats.payPass - stats.rejected, icon: "🔄", color: "bg-yellow-500", position: "left-1/4" },
                      { label: "Approved", value: stats.loanPass + stats.payPass, icon: "✅", color: "bg-green-500", position: "left-1/2" },
                      { label: "Rejected", value: stats.rejected, icon: "❌", color: "bg-red-500", position: "right-0" }
                    ].map((item, index) => (
                      <div key={item.label} className={`flex flex-col items-center ${item.position} transform -translate-x-1/2`}>
                        <div className={`${item.color} w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg mb-2`}>
                          <span className="text-lg">{item.icon}</span>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-gray-800">{item.value.toLocaleString()}</p>
                          <p className="text-xs text-gray-600 whitespace-nowrap">{item.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Detailed Status Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-12">
                  {[
                    { label: "Loan Pending", value: stats.loanPending, color: "cyan", bgColor: "bg-cyan-100", textColor: "text-cyan-700", icon: "⏬" },
                    { label: "Loan Pass", value: stats.loanPass, color: "teal", bgColor: "bg-teal-100", textColor: "text-teal-700", icon: "✅" },
                    { label: "Pay Pending", value: stats.payPending, color: "pink", bgColor: "bg-pink-100", textColor: "text-pink-700", icon: "💰" },
                    { label: "Pay Pass", value: stats.payPass, color: "lime", bgColor: "bg-lime-100", textColor: "text-lime-700", icon: "🎉" },
                    { label: "Rejected", value: stats.rejected, color: "rose", bgColor: "bg-rose-100", textColor: "text-rose-700", icon: "❌" },
                    { label: "Approval Rate", value: Math.round((stats.loanPass / (stats.loanApplied || 1)) * 100) || 0, color: "indigo", bgColor: "bg-indigo-100", textColor: "text-indigo-700", icon: "📊", isPercentage: true }
                  ].map((item, index) => (
                    <div 
                      key={item.label}
                      className={`${item.bgColor} rounded-xl p-4 transform transition-all duration-300 hover:scale-105 shadow-sm`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-lg ${item.textColor}`}>{item.icon}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.bgColor.replace('100', '200')} ${item.textColor}`}>
                          {item.isPercentage ? `${item.value}%` : item.value.toLocaleString()}
                        </span>
                      </div>
                      <p className={`text-xs font-semibold ${item.textColor} uppercase tracking-wide`}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Enhanced Stats Summary with Cool Progress Visualization */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="mb-4 md:mb-0 text-center md:text-left">
                    <h3 className="text-xl font-bold">System Performance Overview</h3>
                    <p className="text-indigo-100 text-sm mt-1">Complete financial service management</p>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center bg-white/10 backdrop-blur-sm p-4 rounded-xl transform transition-all duration-500 hover:scale-110">
                      <div className="relative w-20 h-20 mx-auto mb-2">
                        <svg className="w-20 h-20" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.2)"
                            strokeWidth="2"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeDasharray={`${Math.round((stats.loanPass / (stats.loanApplied || 1)) * 100) || 0}, 100`}
                          />
                          <text x="18" y="20.5" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
                            {Math.round((stats.loanPass / (stats.loanApplied || 1)) * 100) || 0}%
                          </text>
                        </svg>
                      </div>
                      <p className="font-bold">Approval Rate</p>
                      <p className="text-xs text-indigo-200">{stats.loanPass} of {stats.loanApplied}</p>
                    </div>
                    
                    <div className="text-center bg-white/10 backdrop-blur-sm p-4 rounded-xl transform transition-all duration-500 hover:scale-110">
                      <div className="relative w-20 h-20 mx-auto mb-2">
                        <svg className="w-20 h-20" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.2)"
                            strokeWidth="2"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeDasharray={`${Math.round((stats.rejected / (stats.loanApplied || 1)) * 100) || 0}, 100`}
                          />
                          <text x="18" y="20.5" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
                            {Math.round((stats.rejected / (stats.loanApplied || 1)) * 100) || 0}%
                          </text>
                        </svg>
                      </div>
                      <p className="font-bold">Rejection Rate</p>
                      <p className="text-xs text-indigo-200">{stats.rejected} of {stats.loanApplied}</p>
                    </div>
                    
                    <div className="text-center bg-white/10 backdrop-blur-sm p-4 rounded-xl transform transition-all duration-500 hover:scale-110">
                      <div className="w-full bg-white/20 rounded-full h-3 mb-3 overflow-hidden">
                        <div 
                          className="bg-white h-3 rounded-full transition-all duration-1500 ease-out shadow-lg"
                          style={{ width: `${Math.min(100, ((stats.loanApplied - stats.loanPending - stats.loanPass - stats.rejected || 0) / (stats.loanApplied || 1)) * 100)}%` }}
                        ></div>
                      </div>
                      <p className="font-bold text-2xl">{stats.loanApplied - stats.loanPending - stats.loanPass - stats.rejected || 0}</p>
                      <p className="text-xs text-indigo-200">In Progress</p>
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
              
              {/* Awesome Animated Charts */}
              <AdminCharts stats={stats} />
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