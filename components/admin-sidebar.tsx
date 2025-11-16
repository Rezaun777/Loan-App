"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
  const [adminRole, setAdminRole] = useState<string | null>(null)

  // Get admin role on component mount
  useEffect(() => {
    const role = localStorage.getItem("adminRole")
    setAdminRole(role)
  }, [])

  // Initialize the File Management menu state based on current path
  useEffect(() => {
    if (pathname.startsWith("/admin/files")) {
      setOpenMenus({ "File Management": true })
    }
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem("adminId")
    localStorage.removeItem("adminRole")
    router.push("/admin-login")
  }

  const toggleMenu = (label: string) => {
    // Only toggle File Management menu
    if (label === "File Management") {
      setOpenMenus(prev => ({
        ...prev,
        [label]: !prev[label]
      }))
    }
  }

  // Define menu items based on role
  const getMenuItems = () => {
    const baseItems = [
      { label: "Dashboard", href: "/admin" },
      { label: "Customer List", href: "/admin/customers" },
      { label: "Loan Management", href: "/admin/loans" },
      { 
        label: "File Management", 
        href: "/admin/files",
        subItems: [
          { label: "Money Receipt", href: "/admin/files/money-receipt" },
          { label: "Cheque", href: "/admin/files/cheque" },
          { label: "Stamp", href: "/admin/files/stamp" },
          { label: "Insurance", href: "/admin/files/insurance" },
          { label: "Approval", href: "/admin/files/approval" },
        ]
      },
    ]

    // Add role-specific items
    if (adminRole === "administrator") {
      return [
        ...baseItems,
        { label: "Transfer Number", href: "/admin/transfer-number" },
        { label: "Create Admin", href: "/admin/create-admin" },
      ]
    }

    // For regular admins, exclude sensitive operations
    return baseItems
  }

  const menuItems = getMenuItems()

  return (
    <aside className="w-64 bg-white min-h-screen p-6 flex flex-col shadow-lg border-r border-gray-200">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-sm">
          THE WORLD BANK
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-xs text-gray-500">Financial Services</p>
          {adminRole && (
            <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
              adminRole === "administrator" 
                ? "bg-purple-100 text-purple-800" 
                : "bg-blue-100 text-blue-800"
            }`}>
              {adminRole}
            </span>
          )}
        </div>
      </div>

      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => (
          <div key={item.href}>
            {item.subItems ? (
              <>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium flex justify-between items-center",
                    pathname === item.href || pathname.startsWith(item.href)
                      ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <span>{item.label}</span>
                  <span className="text-xs">{openMenus[item.label] ? '▲' : '▼'}</span>
                </button>
                {openMenus[item.label] && (
                  <div className="ml-4 mt-1 space-y-1 animate-fadeIn">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "block px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
                          pathname === subItem.href
                            ? "bg-blue-100 text-blue-800 border-l-4 border-blue-500 ml-[-4px] shadow-sm"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                        )}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "block px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium",
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <Button 
        variant="destructive" 
        className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 shadow-sm"
        onClick={handleLogout}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </Button>
      
      {/* Custom Animation Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </aside>
  )
}