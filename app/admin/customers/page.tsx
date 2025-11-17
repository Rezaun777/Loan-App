"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { User } from "@/components/ui/user"
import toast, { Toaster } from "react-hot-toast"

interface Customer {
  _id: string
  name: string
  phone: string
  personalInfo?: Record<string, any>
  bankInfo?: Record<string, any>
  applicationDate?: string
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Password reset states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetPassword, setResetPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isResetSaving, setIsResetSaving] = useState(false)
  // Add new state for password visibility
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  // Add state for password match validation
  const [passwordMatchError, setPasswordMatchError] = useState(false)
  // Add state for password length validation
  const [passwordLengthError, setPasswordLengthError] = useState(false)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalCustomers, setTotalCustomers] = useState(0)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const adminId = localStorage.getItem("adminId")
        if (!adminId) {
          router.push("/admin-login")
          return
        }

        const response = await fetch("/api/admin/customers")
        const data = await response.json()
        
        if (response.ok) {
          // Sort customers by application date (newest first)
          const sortedCustomers = [...data].sort((a: Customer, b: Customer) => {
            const dateA = a.applicationDate ? new Date(a.applicationDate).getTime() : 0
            const dateB = b.applicationDate ? new Date(b.applicationDate).getTime() : 0
            return dateB - dateA
          })
          
          setCustomers(sortedCustomers)
          setFilteredCustomers(sortedCustomers)
          setTotalCustomers(sortedCustomers.length)
          setError(null)
        } else {
          const errorData = await response.json()
          setError("Failed to fetch customers")
        }
      } catch (err) {
        setError("Error loading customers")
      } finally {
        setIsLoading(false)
      }
    };

    fetchCustomers()
  }, [router])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
    
    if (value.trim() === "") {
      setFilteredCustomers(customers)
      setTotalCustomers(customers.length)
    } else {
      const filtered = customers.filter(
        (customer) =>
          (customer.name && customer.name.toLowerCase().includes(value.toLowerCase())) ||
          (customer.phone && customer.phone.includes(value)) ||
          (customer.personalInfo?.nidNumber && customer.personalInfo.nidNumber.includes(value)) ||
          (customer.personalInfo?.fullName && customer.personalInfo.fullName.toLowerCase().includes(value.toLowerCase())) ||
          (customer.personalInfo?.mobileNumber && customer.personalInfo.mobileNumber.includes(value))
      )
      setFilteredCustomers(filtered)
      setTotalCustomers(filtered.length)
    }
  }

  const handleDelete = async (customerId: string) => {
    // Show confirmation toast instead of window.confirm
    toast((t) => (
      <div className="flex flex-col gap-4">
        <p>Delete this customer and all their data?</p>
        <div className="flex gap-2 justify-end">
          <button 
            className="px-3 py-1 bg-gray-200 rounded-md text-gray-800"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button 
            className="px-3 py-1 bg-red-600 rounded-md text-white"
            onClick={() => {
              toast.dismiss(t.id);
              performDelete(customerId);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 10000 }); // Auto-dismiss after 10 seconds
  }

  const performDelete = async (customerId: string) => {
    // Show loading toast
    const toastId = toast.loading("Deleting customer...")
    
    try {
      // Immediately update UI to remove the customer from display
      const updatedCustomers = customers.filter((c) => c._id !== customerId)
      setCustomers(updatedCustomers)
      
      // Update filtered customers based on current search
      if (searchTerm.trim() === "") {
        setFilteredCustomers(updatedCustomers)
        setTotalCustomers(updatedCustomers.length)
      } else {
        const filtered = updatedCustomers.filter(
          (customer) =>
            (customer.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (customer.phone && customer.phone.includes(searchTerm)) ||
            (customer.personalInfo?.nidNumber && customer.personalInfo.nidNumber.includes(searchTerm)) ||
            (customer.personalInfo?.fullName && customer.personalInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (customer.personalInfo?.mobileNumber && customer.personalInfo.mobileNumber.includes(searchTerm))
        )
        setFilteredCustomers(filtered)
        setTotalCustomers(filtered.length)
      }
      
      // Perform the actual deletion in the background
      const response = await fetch("/api/admin/customers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      })
      
      if (response.ok) {
        toast.success("Customer deleted successfully!", { id: toastId })
      } else {
        toast.error("Failed to delete customer", { id: toastId })
      }
    } catch (err) {
      toast.error("Error deleting customer", { id: toastId })
    }
  }

  const handleProfileClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsModalOpen(true)
  }

  const handleSaveProfile = async () => {
    if (!selectedCustomer) return;

    try {
      setIsSaving(true);
      
      // Find the customer to update
      const customerToUpdate = customers.find(c => c._id === selectedCustomer._id);
      if (!customerToUpdate) {
        return;
      }

      // Prepare the data to send
      const profileData = {
        personalInfo: selectedCustomer.personalInfo,
        bankInfo: selectedCustomer.bankInfo
      };

      const response = await fetch(`/api/admin/customers/${customerToUpdate._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        // Refresh the customer list
        const refreshResponse = await fetch("/api/admin/customers");
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setCustomers(data);
          setFilteredCustomers(data);
          
          // Update the selected customer with the new data
          const updatedSelectedCustomer = data.find((c: any) => c._id === selectedCustomer._id);
          if (updatedSelectedCustomer) {
            setSelectedCustomer(updatedSelectedCustomer);
          }
        }
      } else {
        const errorData = await response.json();
      }
    } catch (err) {
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCustomer(null)
  }
  
  // Password reset functions
  const handleResetPasswordClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setResetEmail(customer.personalInfo?.email || customer.phone || "");
    setResetPassword("");
    setConfirmPassword("");
    setIsResetModalOpen(true);
  };

  const handleResetPassword = async () => {
    if (!selectedCustomer) return;
    
    // Check if passwords match
    if (resetPassword !== confirmPassword) {
      setPasswordMatchError(true);
      toast.error("Passwords do not match");
      return;
    }
    
    // Clear password match error if passwords match
    setPasswordMatchError(false);
    
    // Check if password meets minimum length requirement
    if (resetPassword.length < 6) {
      setPasswordLengthError(true);
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    // Clear password length error if password is long enough
    setPasswordLengthError(false);

    try {
      setIsResetSaving(true);
      
      const response = await fetch(`/api/admin/customers/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: selectedCustomer._id,
          email: resetEmail,
          password: resetPassword
        }),
      });

      if (response.ok) {
        toast.success("Password and email updated successfully!");
        setIsResetModalOpen(false);
        
        // Refresh the customer list
        const refreshResponse = await fetch("/api/admin/customers");
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setCustomers(data);
          setFilteredCustomers(data);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to reset password");
      }
    } catch (err) {
      toast.error("Error resetting password");
    } finally {
      setIsResetSaving(false);
    }
  };

  const handleCloseResetModal = () => {
    setIsResetModalOpen(false);
    setSelectedCustomer(null);
    // Reset password visibility when closing modal
    setShowResetPassword(false);
    setShowConfirmPassword(false);
    // Reset password match error when closing modal
    setPasswordMatchError(false);
    // Reset password length error when closing modal
    setPasswordLengthError(false);
  };
  
  // Pagination functions
  const totalPages = Math.ceil(totalCustomers / itemsPerPage)
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const renderPagination = () => {
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
    
    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 mr-1 transition-all duration-200"
        >
          Previous
        </button>
      )
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md border text-sm font-medium mr-1 transition-all duration-200 ${
            currentPage === i
              ? "border-indigo-500 bg-indigo-50 text-indigo-600"
              : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      )
    }
    
    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ml-1 transition-all duration-200"
        >
          Next
        </button>
      )
    }
    
    return (
      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, totalCustomers)}
              </span>{" "}
              of <span className="font-medium">{totalCustomers}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              {pages}
            </nav>
          </div>
        </div>
      </div>
    )
  }

  // Get current page customers
  const indexOfLastCustomer = currentPage * itemsPerPage
  const indexOfFirstCustomer = indexOfLastCustomer - itemsPerPage
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer)

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <AdminSidebar />
      <Toaster position="top-center" />
      
      <main className="flex-1 p-6 md:p-8">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Customer Management</h1>
          <p className="text-gray-600 text-lg">Manage and view all registered customers</p>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-inner">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full bg-indigo-500 opacity-20 animate-ping"></div>
              <div className="absolute inset-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-spin"></div>
              <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-indigo-800 mb-2 animate-pulse">Loading Customers</h3>
            <p className="text-indigo-600 animate-bounce">Preparing your customer management dashboard...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Customer List</h2>
                  <p className="text-gray-600 text-sm mt-1">{totalCustomers} customers found</p>
                </div>
                <div className="w-full md:w-80">
                  <div className="relative">
                    <Input
                      placeholder="Search by name, phone or NID"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              </div>
            </div>

            {currentCustomers.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-200">
                <div className="mx-auto h-16 w-16 text-gray-400 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-xl font-bold text-gray-900">No customers found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your search criteria to find what you're looking for.</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                        <tr>
                          <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">ID</th>
                          <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Member Name</th>
                          <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Mobile</th>
                          <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">NID</th>
                          <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Occupation</th>
                          <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Application Date</th>
                          <th scope="col" className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentCustomers.map((customer, index) => (
                          <tr 
                            key={customer._id} 
                            className="hover:bg-indigo-50/50 transition-all duration-200"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{indexOfFirstCustomer + index + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.personalInfo?.fullName || customer.name || "N/A"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{customer.personalInfo?.mobileNumber || customer.phone || "N/A"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{customer.personalInfo?.nidNumber || "N/A"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{customer.personalInfo?.occupation || "N/A"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {customer.applicationDate 
                                ? new Date(customer.applicationDate).toLocaleDateString('en-GB') 
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-indigo-200 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 transition-all duration-200 shadow-sm"
                                  onClick={() => handleProfileClick(customer)}
                                >
                                  View Profile
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-green-200 text-green-600 hover:text-green-900 hover:bg-green-50 transition-all duration-200 shadow-sm"
                                  onClick={() => handleResetPasswordClick(customer)}
                                >
                                  Reset Password
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-red-200 text-red-600 hover:text-red-900 hover:bg-red-50 transition-all duration-200 shadow-sm"
                                  onClick={() => handleDelete(customer._id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {renderPagination()}
              </>
            )}
          </div>
        )}

        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl border border-gray-200">
            <DialogHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 -m-6 mb-6 rounded-t-2xl text-white">
              <DialogTitle className="text-2xl font-bold">Customer Profile</DialogTitle>
              <p className="text-indigo-100 mt-1">View and edit customer information</p>
            </DialogHeader>
            {selectedCustomer && <User customer={selectedCustomer} onSave={handleSaveProfile} />}
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseModal}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Password Reset Modal */}
        <Dialog open={isResetModalOpen} onOpenChange={handleCloseResetModal}>
          <DialogContent className="max-w-md rounded-2xl shadow-xl border border-gray-200">
            <DialogHeader className="bg-gradient-to-r from-green-500 to-teal-600 p-6 -m-6 mb-6 rounded-t-2xl text-white">
              <DialogTitle className="text-2xl font-bold">Reset Password</DialogTitle>
              <p className="text-green-100 mt-1">Update customer password and email</p>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-4 py-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <p className="text-sm text-gray-900 font-medium">{selectedCustomer.personalInfo?.fullName || selectedCustomer.name}</p>
                </div>
                
                <div>
                  <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
                
                <div className="relative mt-1 rounded-md shadow-sm">
                  <label htmlFor="resetPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <Input
                    id="resetPassword"
                    type={showResetPassword ? "text" : "password"}
                    value={resetPassword}
                    onChange={(e) => {
                      setResetPassword(e.target.value);
                      // Clear password match error when user types in new password
                      if (passwordMatchError && e.target.value === confirmPassword) {
                        setPasswordMatchError(false);
                      }
                      // Clear password length error when user types in new password
                      if (passwordLengthError && e.target.value.length >= 6) {
                        setPasswordLengthError(false);
                      }
                    }}
                    className={`rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10 transition-all duration-200 ${
                      passwordMatchError || passwordLengthError ? 'border-red-500' : ''
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center top-6">
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                    >
                      {showResetPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="relative mt-1 rounded-md shadow-sm">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      // Clear password match error when user types in confirm password
                      if (passwordMatchError && resetPassword === e.target.value) {
                        setPasswordMatchError(false);
                      }
                    }}
                    className={`rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10 transition-all duration-200 ${
                      passwordMatchError ? 'border-red-500' : ''
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center top-6">
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Show password match error message */}
                {passwordMatchError && (
                  <div className="text-red-500 text-sm mt-1 animate-shake">
                    Passwords do not match
                  </div>
                )}
                
                {/* Show password length error message */}
                {passwordLengthError && (
                  <div className="text-red-500 text-sm mt-1 animate-shake">
                    Password must be at least 6 characters
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCloseResetModal}
                    disabled={isResetSaving}
                    className="transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleResetPassword}
                    disabled={isResetSaving}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {isResetSaving ? "Saving..." : "Reset Password"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        `}
      </style>
    </div>
  )
}