"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import toast from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Pencil, Trash2 } from "lucide-react"

interface Admin {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export default function CreateAdminPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loadingAdmins, setLoadingAdmins] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState("admin")
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editRole, setEditRole] = useState("")
  const [editPassword, setEditPassword] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Fetch all admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await fetch("/api/admin/users")
        if (response.ok) {
          const data = await response.json()
          setAdmins(data)
        } else {
          setError("Failed to fetch admins")
        }
      } catch (err) {
        setError("Network error occurred")
      } finally {
        setLoadingAdmins(false)
      }
    }

    fetchAdmins()
  }, [])

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const adminId = localStorage.getItem("adminId")
      const response = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, adminId, role }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Admin created successfully!")
        setEmail("")
        setPassword("")
        setName("")
        setRole("admin")
        
        // Refresh the admin list
        const refreshResponse = await fetch("/api/admin/users")
        if (refreshResponse.ok) {
          const refreshedData = await refreshResponse.json()
          setAdmins(refreshedData)
        }
      } else {
        setError(data.error || "Failed to create admin")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAdmin = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Admin deleted successfully!")
        // Refresh the admin list
        const refreshResponse = await fetch("/api/admin/users")
        if (refreshResponse.ok) {
          const refreshedData = await refreshResponse.json()
          setAdmins(refreshedData)
        }
      } else {
        toast.error(data.error || "Failed to delete admin")
      }
    } catch (err) {
      toast.error("Network error occurred")
    }
  }

  const handleEditClick = (admin: Admin) => {
    setEditingAdmin(admin)
    setEditName(admin.name)
    setEditEmail(admin.email)
    setEditRole(admin.role)
    setEditPassword("")
    setIsEditDialogOpen(true)
  }

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingAdmin) return

    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAdmin._id,
          name: editName,
          email: editEmail,
          role: editRole,
          password: editPassword || undefined
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Admin updated successfully!")
        setIsEditDialogOpen(false)
        
        // Refresh the admin list
        const refreshResponse = await fetch("/api/admin/users")
        if (refreshResponse.ok) {
          const refreshedData = await refreshResponse.json()
          setAdmins(refreshedData)
        }
      } else {
        toast.error(data.error || "Failed to update admin")
      }
    } catch (err) {
      toast.error("Network error occurred")
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Management</h1>
          <p className="text-gray-600 text-lg">Create and manage administrator accounts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Admin Form */}
          <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-slideInLeft">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <h2 className="text-2xl font-bold">Create New Admin</h2>
              <p className="text-indigo-100 mt-1">Add a new administrator to the system</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateAdmin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Name</label>
                  <div className="relative">
                    <Input
                      name="name"
                      type="text"
                      placeholder="Admin Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Email</label>
                  <div className="relative">
                    <Input
                      name="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <Input
                      name="password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Role</label>
                  <Select value={role} onValueChange={setRole} disabled={isLoading}>
                    <SelectTrigger className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 transition-all duration-300 shadow-sm hover:shadow-md">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="administrator">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Administrator has full access. Admin has standard access.
                  </p>
                </div>

                {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{error}</div>}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg px-6 py-3 font-semibold shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </div>
                  ) : "Create Admin"}
                </Button>
              </form>
            </div>
          </Card>

          {/* Admins Table */}
          <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-slideInRight">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <h2 className="text-2xl font-bold">Existing Admins</h2>
              <p className="text-indigo-100 mt-1">Manage current administrator accounts</p>
            </div>
            <div className="p-6">
              {loadingAdmins ? (
                <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-inner">
                  <div className="relative w-20 h-20 mb-4">
                    <div className="absolute inset-0 rounded-full bg-indigo-500 opacity-20 animate-ping"></div>
                    <div className="absolute inset-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-spin"></div>
                    <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                      <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-indigo-800 mb-1 animate-pulse">Loading Admins</h3>
                  <p className="text-indigo-600 animate-bounce">Fetching administrator data...</p>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{error}</div>
              ) : (
                <div className="border rounded-lg overflow-hidden border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="text-gray-700 font-semibold">Name</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Email</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Role</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Created</TableHead>
                        <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            <div className="flex flex-col items-center justify-center">
                              <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span className="font-medium">No admins found</span>
                              <p className="text-sm mt-1">Create your first admin account</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        admins.map((admin) => (
                          <TableRow 
                            key={admin._id} 
                            className="border-b border-gray-100 hover:bg-indigo-50/50 transition-colors duration-200"
                          >
                            <TableCell className="font-medium text-gray-800 py-4">{admin.name}</TableCell>
                            <TableCell className="text-gray-600 py-4">{admin.email}</TableCell>
                            <TableCell className="py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                admin.role === "administrator" 
                                  ? "bg-purple-100 text-purple-800" 
                                  : "bg-blue-100 text-blue-800"
                              }`}>
                                {admin.role}
                              </span>
                            </TableCell>
                            <TableCell className="text-gray-600 py-4">
                              {new Date(admin.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right py-4">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditClick(admin)}
                                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteAdmin(admin._id)}
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </Card>
        </div>
        
        {/* Custom Animation Styles */}
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-slideInLeft {
            animation: slideInLeft 0.5s ease-out forwards;
          }
          .animate-slideInRight {
            animation: slideInRight 0.5s ease-out forwards;
          }
        `}</style>
      </main>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl shadow-xl border border-gray-200">
          <DialogHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 -m-6 mb-6 rounded-t-2xl text-white">
            <DialogTitle className="text-2xl font-bold">Edit Admin</DialogTitle>
            <p className="text-indigo-100 mt-1">Update administrator account details</p>
          </DialogHeader>
          {editingAdmin && (
            <form onSubmit={handleUpdateAdmin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Name</label>
                <div className="relative">
                  <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Email</label>
                <div className="relative">
                  <Input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Role</label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 transition-all duration-300 shadow-sm hover:shadow-md">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter new password (leave blank to keep current)"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                <p className="text-xs text-gray-500">Leave blank to keep the current password</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg px-6 py-2 font-semibold shadow-lg transform transition-all duration-300 hover:scale-105"
                >
                  Update Admin
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}