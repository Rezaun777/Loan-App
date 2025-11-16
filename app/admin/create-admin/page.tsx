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
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Create Admin</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Admin Form */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Admin</h2>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">Name</label>
                <Input
                  name="name"
                  type="text"
                  placeholder="Admin Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">Email</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Password</label>
                <Input
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">Role</label>
                <Select value={role} onValueChange={setRole} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Administrator has full access. Admin has standard access.
                </p>
              </div>

              {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Admin"}
              </Button>
            </form>
          </Card>

          {/* Admins Table */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Existing Admins</h2>
            {loadingAdmins ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No admins found
                        </TableCell>
                      </TableRow>
                    ) : (
                      admins.map((admin) => (
                        <TableRow key={admin._id}>
                          <TableCell className="font-medium">{admin.name}</TableCell>
                          <TableCell>{admin.email}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              admin.role === "administrator" 
                                ? "bg-purple-100 text-purple-800" 
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {admin.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(admin)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteAdmin(admin._id)}
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
          </Card>
        </div>
      </main>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
          </DialogHeader>
          {editingAdmin && (
            <form onSubmit={handleUpdateAdmin} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">Name</label>
                <Input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">Email</label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Role</label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Password (leave blank to keep current)</label>
                <Input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Admin</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}