"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import toast, { Toaster } from "react-hot-toast"
import { convertToBanglaDigits } from "@/lib/utils"

interface Loan {
  _id: string
  userId: string
  amount: number
  duration: number
  monthlyInstallment: number
  status: string
  level?: string
  assignedTo?: string
  payoutNumber?: string
  fees?: Record<string, number>
  customMessage?: string
  personalInfo?: Record<string, any>
  bankInfo?: Record<string, any>
  applicationDate?: string
  statusUpdatedAt?: string
  loanEndDate?: string
  monthlyPaymentDates?: string[]
  displayAmount?: number // New field for edited display amount
}

const LOAN_STATUSES = ["pending", "pass", "pay_pending", "pay_pass", "rejected"]
const LOAN_LEVELS = ["transfer", "insurance", "vip", "maintenance", "fault", "custom"]

const STATUS_LABELS: Record<string, string> = {
  pending: "Loan Pending",
  pass: "Loan Pass",
  pay_pending: "Pay Pending",
  pay_pass: "Pay Pass",
  rejected: "Rejected",
}

const LEVEL_LABELS: Record<string, string> = {
  transfer: "Transfer",
  insurance: "Insurance",
  vip: "VIP",
  maintenance: "Maintenance",
  fault: "Fault",
  custom: "Custom",
}

const PREDEFINED_MESSAGES: Record<string, string> = {
  transfer: "আপনার ঋণ নেওয়ার ক্ষমতা আছে নাকি সেটা যাচাই করতে আপনাকে সাময়িক সময়ের জন্য নিচের দেওয়া পরিমাণ ট্রান্সফার ফি দিতে হবে...",
  insurance: "আপনাকে ঋণ নিতে সিকিউরিটির জন্য বীমা করতে হবে...",
  vip: "অভিনন্দন! আপনি VIP গ্রাহক হওয়ার সুযোগ পেয়েছেন...",
  maintenance: "আপনার ঋণ টি রক্ষণাবেক্ষণ করতে আমাদের কর্মচারী নিয়োগ থাকবে...",
  fault: "আপনার দেওয়া তথ্যে কিছু ভুল হয়েছে...",
  savings: "বাংলাদেশ ব্যাংক ঋণের ক্ষেত্রে সঞ্চয় বাধ্যতামূলক করেছেন...",
  bankFee: "আপনার একাউন্ট টাকা পাঠাতে আমাদের ব্যাংকের খরচ হবে...",
  installment: "প্রথম কিস্তি ছাড়া আমরা আপনার একাউন্ট সচল করতে পারছি না...",
  govtFee: "আপনার একাউন্ট টাকা পাঠানোর জন্য সরকারী ভ্যাট দিতে হবে...",
  cancellation: "আপনার ঋণ টি বাতিল করতে এবং পূর্বের লেনদেনকৃত টাকা ফেরত পেতে...",
  custom: "", // Empty for custom message entry
}

export default function LoansPage() {
  const router = useRouter()
  const [loans, setLoans] = useState<Loan[]>([])
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([])
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [selectedUserProfile, setSelectedUserProfile] = useState<Loan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [adminRole, setAdminRole] = useState<string | null>(null)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalLoans, setTotalLoans] = useState(0)

  const [formData, setFormData] = useState({
    assignedTo: "",
    loanAmount: "",
    displayAmount: "",
    loanMonth: "",
    installment: "",
    payoutNumber: "",
    loanStatus: "",
    loanLevel: "",
    transferFee: "",
    insuranceFee: "",
    vipFee: "",
    maintenanceFee: "",
    faultFee: "",
    customFee: "",
    customMessage: "",
  })
  
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    nidNumber: "",
    presentAddress: "",
    permanentAddress: "",
    phone: "",
    occupation: "",
    loanPurpose: "",
  })

  const [nomineeInfo, setNomineeInfo] = useState({
    nomineeName: "",
    nomineePhone: "",
    nomineeRelation: "",
  })

  useEffect(() => {
    // Get admin role from localStorage
    const role = localStorage.getItem("adminRole")
    setAdminRole(role)

    const fetchLoans = async () => {
      try {
        const adminId = localStorage.getItem("adminId")
        if (!adminId) {
          router.push("/admin-login")
          return
        }

        const response = await fetch("/api/admin/loans")
        if (response.ok) {
          const data = await response.json()
          // Sort loans by application date (newest first)
          const sortedLoans = [...data].sort((a: Loan, b: Loan) => {
            const dateA = a.applicationDate ? new Date(a.applicationDate).getTime() : 0
            const dateB = b.applicationDate ? new Date(b.applicationDate).getTime() : 0
            return dateB - dateA
          })
          setLoans(sortedLoans)
          setFilteredLoans(sortedLoans)
          setTotalLoans(sortedLoans.length)
          setError(null)
        } else {
          const errorData = await response.json()
          setError("Failed to fetch loans")
        }
      } catch (err) {
        setError("Error loading loans")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLoans()
  }, [router])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
    
    if (value.trim() === "") {
      setFilteredLoans(loans)
      setTotalLoans(loans.length)
    } else {
      const filtered = loans.filter(
        (loan) =>
          loan.personalInfo?.fullName?.toLowerCase().includes(value.toLowerCase()) ||
          loan.personalInfo?.name?.toLowerCase().includes(value.toLowerCase()) ||
          loan.personalInfo?.mobileNumber?.includes(value) ||
          loan.personalInfo?.phone?.includes(value) ||
          loan.status?.includes(value) ||
          loan.duration?.toString().includes(value),
      )
      setFilteredLoans(filtered)
      setTotalLoans(filtered.length)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      pass: "bg-green-100 text-green-800",
      pay_pending: "bg-orange-100 text-orange-800",
      pay_pass: "bg-teal-100 text-teal-800",
      rejected: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getLevelBadgeColor = (level: string) => {
    const colors: Record<string, string> = {
      transfer: "bg-blue-100 text-blue-800",
      insurance: "bg-purple-100 text-purple-800",
      vip: "bg-yellow-100 text-yellow-800",
      maintenance: "bg-indigo-100 text-indigo-800",
      fault: "bg-red-100 text-red-800",
      custom: "bg-gray-100 text-gray-800",
    }
    return colors[level] || "bg-gray-100 text-gray-800"
  }

  const handleOpenLoan = (loan: Loan) => {
    setSelectedLoan(loan)
    setFormData({
      assignedTo: loan.assignedTo || "",
      loanAmount: loan.amount?.toString() || "",
      displayAmount: (loan.displayAmount || loan.amount)?.toString() || "",
      loanMonth: loan.duration?.toString() || "",
      installment: loan.monthlyInstallment?.toString() || "",
      payoutNumber: loan.payoutNumber || "Bkash Send Money: 01341011539",
      loanStatus: loan.status || "",
      loanLevel: loan.level || "",
      transferFee: loan.fees?.transfer?.toString() || "",
      insuranceFee: loan.fees?.insurance?.toString() || "",
      vipFee: loan.fees?.vip?.toString() || "",
      maintenanceFee: loan.fees?.maintenance?.toString() || "",
      faultFee: loan.fees?.fault?.toString() || "",
      customFee: loan.fees?.custom?.toString() || "",
      customMessage: loan.customMessage || "",
    })
    
    // Set personal info form data
    setPersonalInfo({
      name: loan.personalInfo?.fullName || loan.personalInfo?.name || "",
      nidNumber: loan.personalInfo?.nidNumber || "",
      presentAddress: loan.personalInfo?.presentAddress || "",
      permanentAddress: loan.personalInfo?.permanentAddress || "",
      phone: loan.personalInfo?.mobileNumber || loan.personalInfo?.phone || "",
      occupation: loan.personalInfo?.occupation || "",
      loanPurpose: loan.personalInfo?.loanPurpose || "",
    })
    
    // Set nominee info form data
    setNomineeInfo({
      nomineeName: loan.personalInfo?.nomineeName || "",
      nomineePhone: loan.personalInfo?.nomineePhone || "",
      nomineeRelation: loan.personalInfo?.nomineeRelation || "",
    })
  }

  const handleViewProfile = (loan: Loan) => {
    // Ensure proper initialization of nested objects
    setSelectedUserProfile({
      ...loan,
      personalInfo: loan.personalInfo || {},
      bankInfo: loan.bankInfo || {}
    })
  }

  const handleSaveProfile = async () => {
    if (!selectedUserProfile) return

    try {
      // Extract the data properly to ensure correct structure
      const personalInfoData = selectedUserProfile.personalInfo || {}
      const bankInfoData = selectedUserProfile.bankInfo || {}
      
      // Only send data that actually has content
      const requestBody: any = {
        loanId: selectedUserProfile._id
      }
      
      if (Object.keys(personalInfoData).length > 0) {
        requestBody.personalInfo = personalInfoData
      }
      if (Object.keys(bankInfoData).length > 0) {
        requestBody.bankInfo = bankInfoData
      }
      
      const response = await fetch("/api/admin/loans", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        // Update the loans data to reflect the changes
        const loansResponse = await fetch("/api/admin/loans")
        if (loansResponse.ok) {
          const data = await loansResponse.json()
          setLoans(data)
          setFilteredLoans(data)
        }
        setSelectedUserProfile(null)
      } else {
        const errorText = await response.text();
      }
    } catch (err) {
    }
  }

  const handleDeleteMember = async (loan: Loan) => {
    // Determine the correct customer ID to use for deletion
    let customerIdToDelete = loan.userId || loan._id;
    
    // Show confirmation toast instead of window.confirm
    toast((t) => (
      <div className="flex flex-col gap-4">
        <p>Delete {loan.personalInfo?.fullName || loan.personalInfo?.name || "this member"} and all their loans?</p>
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
              performDelete(customerIdToDelete, loan);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 10000 }); // Auto-dismiss after 10 seconds
  }

  const performDelete = async (customerIdToDelete: string, loan: Loan) => {

    // Show loading toast
    const toastId = toast.loading("Deleting member...")
    
    try {
      // Immediately update UI to remove the loan from display
      const updatedLoans = loans.filter((l) => l.userId !== customerIdToDelete && l._id !== customerIdToDelete);
      setLoans(updatedLoans);
      
      // Update filtered loans based on current search
      if (searchTerm.trim() === "") {
        setFilteredLoans(updatedLoans);
        setTotalLoans(updatedLoans.length);
      } else {
        const filtered = updatedLoans.filter(
          (loanItem) =>
            loanItem.personalInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loanItem.personalInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loanItem.personalInfo?.mobileNumber?.includes(searchTerm) ||
            loanItem.personalInfo?.phone?.includes(searchTerm) ||
            loanItem.status?.includes(searchTerm) ||
            loanItem.duration?.toString().includes(searchTerm),
        );
        setFilteredLoans(filtered);
        setTotalLoans(filtered.length);
      }
      
      // Perform the actual deletion
      const response = await fetch(`/api/admin/customers`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customerIdToDelete }),
      })
      
      if (response.ok) {
        toast.success("Member deleted successfully!", { id: toastId })
      } else {
        toast.error("Failed to delete member", { id: toastId })
      }
      
    } catch (err) {
      toast.error("Error deleting member", { id: toastId })
    }
  }

  const handleUpdateLoan = async () => {
    if (!selectedLoan) return

    try {
      // Prepare personal info data
      const personalInfoData = {
        ...selectedLoan.personalInfo,
        fullName: personalInfo.name,
        name: personalInfo.name,
        nidNumber: personalInfo.nidNumber,
        presentAddress: personalInfo.presentAddress,
        permanentAddress: personalInfo.permanentAddress,
        mobileNumber: personalInfo.phone,
        phone: personalInfo.phone,
        occupation: personalInfo.occupation,
        loanPurpose: personalInfo.loanPurpose,
        nomineeName: nomineeInfo.nomineeName,
        nomineePhone: nomineeInfo.nomineePhone,
        nomineeRelation: nomineeInfo.nomineeRelation,
      };
      
      // Prepare bank info data - use the updated values from selectedLoan state
      const bankInfoData = {
        ...(selectedLoan.bankInfo || {}),
      };

      // Update loan info using the existing loans API
      const loanResponse = await fetch("/api/admin/loans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanId: selectedLoan._id,
          amount: formData.loanAmount ? Number(formData.loanAmount) : undefined,
          displayAmount: formData.displayAmount ? Number(formData.displayAmount) : undefined,
          duration: formData.loanMonth ? Number(formData.loanMonth) : undefined,
          monthlyInstallment: formData.installment ? Number(formData.installment) : undefined,
          status: formData.loanStatus,
          level: formData.loanLevel,
          assignedTo: formData.assignedTo,
          payoutNumber: formData.payoutNumber,
          fees: {
            transfer: formData.transferFee ? Number(formData.transferFee) : 0,
            insurance: formData.insuranceFee ? Number(formData.insuranceFee) : 0,
            vip: formData.vipFee ? Number(formData.vipFee) : 0,
            maintenance: formData.maintenanceFee ? Number(formData.maintenanceFee) : 0,
            fault: formData.faultFee ? Number(formData.faultFee) : 0,
            custom: formData.customFee ? Number(formData.customFee) : 0,
          },
          customMessage: formData.customMessage,
          personalInfo: personalInfoData,
          bankInfo: bankInfoData
        }),
      })

      if (loanResponse.ok) {
        const loansResponse = await fetch("/api/admin/loans")
        if (loansResponse.ok) {
          const data = await loansResponse.json()
          setLoans(data)
          setFilteredLoans(data)
        }
        setSelectedLoan(null)
      } else {
      }
    } catch (err) {
    }
  }
  
  // Pagination functions
  const totalPages = Math.ceil(totalLoans / itemsPerPage)
  
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
          className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 mr-1"
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
          className={`px-3 py-1 rounded-md border text-sm font-medium mr-1 ${
            currentPage === i
              ? "border-blue-500 bg-blue-50 text-blue-600"
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
          className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ml-1"
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
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, totalLoans)}
              </span>{" "}
              of <span className="font-medium">{totalLoans}</span> results
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

  // Get current page loans
  const indexOfLastLoan = currentPage * itemsPerPage
  const indexOfFirstLoan = indexOfLastLoan - itemsPerPage
  const currentLoans = filteredLoans.slice(indexOfFirstLoan, indexOfLastLoan)

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <AdminSidebar />
      <Toaster position="top-center" />

      <main className="flex-1 p-6 md:p-8">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Loan Management</h1>
          <p className="text-gray-600 text-lg">Manage and process customer loan applications</p>
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
            <h3 className="text-xl font-bold text-indigo-800 mb-2 animate-pulse">Loading Loans</h3>
            <p className="text-indigo-600 animate-bounce">Preparing your loan management dashboard...</p>
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
                  <h2 className="text-2xl font-bold text-gray-800">Loan Applications</h2>
                  <p className="text-gray-600 text-sm mt-1">{totalLoans} applications found</p>
                </div>
                <div className="w-full md:w-80">
                  <div className="relative">
                    <Input
                      placeholder="Search by member name, phone, status or duration"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              </div>
            </div>

            {currentLoans.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-200">
                <div className="mx-auto h-16 w-16 text-gray-400 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-xl font-bold text-gray-900">No loan applications found</h3>
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
                          <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Loan Amount</th>
                          <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Level</th>
                          <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Duration</th>
                          <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Installment</th>
                          <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Admin</th>
                          <th scope="col" className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentLoans.map((loan, index) => (
                          <tr 
                            key={loan._id} 
                            className="hover:bg-indigo-50/50 transition-all duration-200"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{indexOfFirstLoan + index + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loan.personalInfo?.fullName || loan.personalInfo?.name || "N/A"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{loan.personalInfo?.mobileNumber || loan.personalInfo?.phone || "N/A"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">Tk {loan.amount?.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(loan.status)}`}>
                                {STATUS_LABELS[loan.status] || loan.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {loan.level ? (
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelBadgeColor(loan.level)}`}>
                                  {LEVEL_LABELS[loan.level]}
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                                  N/A
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{loan.duration} months</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">Tk {loan.monthlyInstallment?.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{loan.assignedTo || "N/A"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-indigo-200 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 transition-all duration-200 shadow-sm"
                                  onClick={() => handleOpenLoan(loan)}
                                >
                                  Edit Loan
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-green-200 text-green-600 hover:text-green-900 hover:bg-green-50 transition-all duration-200 shadow-sm"
                                  onClick={() => handleViewProfile(loan)}
                                >
                                  View Profile
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-red-200 text-red-600 hover:text-red-900 hover:bg-red-50 transition-all duration-200 shadow-sm"
                                  onClick={() => handleDeleteMember(loan)}
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

        {/* Loan Management Dialog */}
        <Dialog open={!!selectedLoan} onOpenChange={() => setSelectedLoan(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl border border-gray-200">
            <DialogHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 -m-6 mb-6 rounded-t-2xl text-white">
              <DialogTitle className="text-2xl font-bold">Edit Loan Information</DialogTitle>
              <p className="text-indigo-100 mt-1">Manage and update loan details</p>
            </DialogHeader>

            {selectedLoan && (
              <div className="space-y-6">
                {/* Member Information Section */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-white">Editable</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Member Name</Label>
                      <Input
                        value={personalInfo.name}
                        onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">ID Number</Label>
                      <Input
                        value={personalInfo.nidNumber}
                        onChange={(e) => setPersonalInfo({...personalInfo, nidNumber: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Current Address</Label>
                      <Input
                        value={personalInfo.presentAddress}
                        onChange={(e) => setPersonalInfo({...personalInfo, presentAddress: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Permanent Address</Label>
                      <Input
                        value={personalInfo.permanentAddress}
                        onChange={(e) => setPersonalInfo({...personalInfo, permanentAddress: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Mobile Number</Label>
                      <Input
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Occupation</Label>
                      <Input
                        value={personalInfo.occupation}
                        onChange={(e) => setPersonalInfo({...personalInfo, occupation: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="col-span-2 bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Loan Purpose</Label>
                      <Textarea
                        value={personalInfo.loanPurpose}
                        onChange={(e) => setPersonalInfo({...personalInfo, loanPurpose: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Nominee Section */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Nominee Information</h3>
                    <div className="bg-gradient-to-r from-green-500 to-teal-500 px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-white">Editable</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Nominee Name</Label>
                      <Input
                        value={nomineeInfo.nomineeName}
                        onChange={(e) => setNomineeInfo({...nomineeInfo, nomineeName: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Nominee Phone</Label>
                      <Input
                        value={nomineeInfo.nomineePhone}
                        onChange={(e) => setNomineeInfo({...nomineeInfo, nomineePhone: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Nominee Relation</Label>
                      <Input
                        value={nomineeInfo.nomineeRelation}
                        onChange={(e) => setNomineeInfo({...nomineeInfo, nomineeRelation: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Images Section */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Documents</h3>
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-white">View Only</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedLoan.personalInfo?.profilePhoto && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <Label className="text-sm font-medium text-gray-700">Profile Photo</Label>
                        <div className="mt-2 aspect-video relative rounded-lg overflow-hidden border border-gray-200">
                          <Image 
                            src={selectedLoan.personalInfo.profilePhoto} 
                            alt="Profile Photo" 
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                    {selectedLoan.personalInfo?.nidCardFront && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <Label className="text-sm font-medium text-gray-700">NID Front</Label>
                        <div className="mt-2 aspect-video relative rounded-lg overflow-hidden border border-gray-200">
                          <Image 
                            src={selectedLoan.personalInfo.nidCardFront} 
                            alt="NID Front" 
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                    {selectedLoan.personalInfo?.nidCardBack && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <Label className="text-sm font-medium text-gray-700">NID Back</Label>
                        <div className="mt-2 aspect-video relative rounded-lg overflow-hidden border border-gray-200">
                          <Image 
                            src={selectedLoan.personalInfo.nidCardBack} 
                            alt="NID Back" 
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                    {selectedLoan.personalInfo?.selfieWithId && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <Label className="text-sm font-medium text-gray-700">Selfie with ID</Label>
                        <div className="mt-2 aspect-video relative rounded-lg overflow-hidden border border-gray-200">
                          <Image 
                            src={selectedLoan.personalInfo.selfieWithId} 
                            alt="Selfie with ID" 
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                    {selectedLoan.personalInfo?.signature && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <Label className="text-sm font-medium text-gray-700">Signature</Label>
                        <div className="mt-2 aspect-video relative rounded-lg overflow-hidden border border-gray-200">
                          <Image 
                            src={selectedLoan.personalInfo.signature} 
                            alt="Signature" 
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bank Information Section */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Bank Information</h3>
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-white">Editable</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Account Type</Label>
                      <Select 
                        value={selectedLoan.bankInfo?.accountType || ""}
                        onValueChange={(value) => setSelectedLoan(prev => prev ? {
                          ...prev,
                          bankInfo: {
                            ...(prev.bankInfo || {}),
                            accountType: value
                          }
                        } : null)}
                      >
                        <SelectTrigger className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank">Bank</SelectItem>
                          <SelectItem value="nagad">Nagad</SelectItem>
                          <SelectItem value="bkash">Bkash</SelectItem>
                          <SelectItem value="rocket">Rocket</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Bank Name</Label>
                      <Input
                        value={selectedLoan.bankInfo?.bankName || ""}
                        onChange={(e) => setSelectedLoan(prev => prev ? {
                          ...prev,
                          bankInfo: {
                            ...(prev.bankInfo || {}),
                            bankName: e.target.value
                          }
                        } : null)}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Account Name</Label>
                      <Input
                        value={selectedLoan.bankInfo?.accountName || ""}
                        onChange={(e) => setSelectedLoan(prev => prev ? {
                          ...prev,
                          bankInfo: {
                            ...(prev.bankInfo || {}),
                            accountName: e.target.value
                          }
                        } : null)}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Account Number</Label>
                      <Input
                        value={selectedLoan.bankInfo?.accountNumber || ""}
                        onChange={(e) => setSelectedLoan(prev => prev ? {
                          ...prev,
                          bankInfo: {
                            ...(prev.bankInfo || {}),
                            accountNumber: e.target.value
                          }
                        } : null)}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Loan Details Section */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Loan Details</h3>
                    <div className="bg-gradient-to-r from-green-500 to-teal-500 px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-white">Editable</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Loan Amount</Label>
                      <Input
                        type="number"
                        value={formData.loanAmount}
                        onChange={(e) => setFormData({...formData, loanAmount: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Display Amount (Editable)</Label>
                      <Input
                        type="number"
                        value={formData.displayAmount}
                        onChange={(e) => setFormData({...formData, displayAmount: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-1">This amount will be shown to users, but calculations will use the original loan amount</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Loan Duration (months)</Label>
                      <Input
                        type="number"
                        value={formData.loanMonth}
                        onChange={(e) => setFormData({...formData, loanMonth: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Monthly Installment</Label>
                      <Input
                        type="number"
                        value={formData.installment}
                        onChange={(e) => setFormData({...formData, installment: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Assigned To</Label>
                      <Input
                        value={formData.assignedTo}
                        onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                        disabled={adminRole !== "administrator"}
                        className={`mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          adminRole !== "administrator" ? "bg-gray-100 cursor-not-allowed" : ""
                        }`}
                      />
                      {adminRole !== "administrator" && (
                        <p className="text-xs text-gray-500 mt-1">Only administrators can edit this field</p>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Payout Number</Label>
                      <Input
                        value={formData.payoutNumber}
                        onChange={(e) => setFormData({...formData, payoutNumber: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Loan Status</Label>
                      <Select value={formData.loanStatus} onValueChange={(value) => setFormData({...formData, loanStatus: value})}>
                        <SelectTrigger className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {LOAN_STATUSES.map(status => (
                            <SelectItem key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Loan Level</Label>
                      <Select 
                        value={formData.loanLevel} 
                        onValueChange={(value) => {
                          // Auto-populate the custom message when a level is selected
                          const message = PREDEFINED_MESSAGES[value] || "";
                          setFormData({
                            ...formData, 
                            loanLevel: value,
                            customMessage: message
                          });
                        }}
                      >
                        <SelectTrigger className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {LOAN_LEVELS.map(level => (
                            <SelectItem key={level} value={level}>
                              {LEVEL_LABELS[level]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Loan Dates Section */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Loan Dates</h3>
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-white">Information</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Application Date</Label>
                      <p className="mt-1 text-gray-900">
                        {selectedLoan.applicationDate 
                          ? new Date(selectedLoan.applicationDate).toLocaleDateString('en-GB') 
                          : 'Not set'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Status Updated At</Label>
                      <p className="mt-1 text-gray-900">
                        {selectedLoan.statusUpdatedAt 
                          ? new Date(selectedLoan.statusUpdatedAt).toLocaleDateString('en-GB') 
                          : 'Not updated'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Loan End Date</Label>
                      <p className="mt-1 text-gray-900">
                        {selectedLoan.loanEndDate 
                          ? new Date(selectedLoan.loanEndDate).toLocaleDateString('en-GB') 
                          : 'Not set'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Monthly Payment Dates</Label>
                      <p className="mt-1 text-gray-900">
                        {selectedLoan.monthlyPaymentDates && selectedLoan.monthlyPaymentDates.length > 0
                          ? `${selectedLoan.monthlyPaymentDates.length} payments scheduled`
                          : 'Not scheduled'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fees Section */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Fees</h3>
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-white">Editable</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Transfer Fee</Label>
                      <Input
                        type="number"
                        value={formData.transferFee}
                        onChange={(e) => setFormData({...formData, transferFee: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Insurance Fee</Label>
                      <Input
                        type="number"
                        value={formData.insuranceFee}
                        onChange={(e) => setFormData({...formData, insuranceFee: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">VIP Fee</Label>
                      <Input
                        type="number"
                        value={formData.vipFee}
                        onChange={(e) => setFormData({...formData, vipFee: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Maintenance Fee</Label>
                      <Input
                        type="number"
                        value={formData.maintenanceFee}
                        onChange={(e) => setFormData({...formData, maintenanceFee: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Fault Fee</Label>
                      <Input
                        type="number"
                        value={formData.faultFee}
                        onChange={(e) => setFormData({...formData, faultFee: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Custom Fee</Label>
                      <Input
                        type="number"
                        value={formData.customFee}
                        onChange={(e) => setFormData({...formData, customFee: e.target.value})}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom Message Section */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Custom Message</h3>
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-white">Editable</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Predefined Message</Label>
                      <Select onValueChange={(value) => {
                        const message = PREDEFINED_MESSAGES[value] || "";
                        setFormData({...formData, customMessage: message});
                      }}>
                        <SelectTrigger className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
                          <SelectValue placeholder="Select a predefined message" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transfer">Transfer</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="fault">Fault</SelectItem>
                          <SelectItem value="savings">Savings</SelectItem>
                          <SelectItem value="bankFee">Bank Fee</SelectItem>
                          <SelectItem value="installment">Installment</SelectItem>
                          <SelectItem value="govtFee">Government Fee</SelectItem>
                          <SelectItem value="cancellation">Cancellation</SelectItem>
                          <SelectItem value="custom">Custom Message</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Message</Label>
                      <Textarea
                        value={formData.customMessage}
                        onChange={(e) => setFormData({...formData, customMessage: e.target.value})}
                        rows={4}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedLoan(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateLoan}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* User Profile Dialog */}
        <Dialog open={!!selectedUserProfile} onOpenChange={() => setSelectedUserProfile(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl border border-gray-200">
            <DialogHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 -m-6 mb-6 rounded-t-2xl text-white">
              <DialogTitle className="text-2xl font-bold">User Profile</DialogTitle>
              <p className="text-indigo-100 mt-1">View and edit user information</p>
            </DialogHeader>
            
            {selectedUserProfile && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-white">Editable</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Member Name</Label>
                      <Input
                        value={selectedUserProfile?.personalInfo?.fullName || ""}
                        onChange={(e) => setSelectedUserProfile(prev => prev ? {
                          ...prev,
                          personalInfo: {
                            ...(prev.personalInfo || {}),
                            fullName: e.target.value
                          }
                        } : null)}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">ID Number</Label>
                      <Input
                        value={selectedUserProfile?.personalInfo?.nidNumber || ""}
                        onChange={(e) => setSelectedUserProfile(prev => prev ? {
                          ...prev,
                          personalInfo: {
                            ...(prev.personalInfo || {}),
                            nidNumber: e.target.value
                          }
                        } : null)}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Current Address</Label>
                      <Input
                        value={selectedUserProfile?.personalInfo?.presentAddress || ""}
                        onChange={(e) => setSelectedUserProfile(prev => prev ? {
                          ...prev,
                          personalInfo: {
                            ...(prev.personalInfo || {}),
                            presentAddress: e.target.value
                          }
                        } : null)}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Permanent Address</Label>
                      <Input
                        value={selectedUserProfile?.personalInfo?.permanentAddress || ""}
                        onChange={(e) => setSelectedUserProfile(prev => prev ? {
                          ...prev,
                          personalInfo: {
                            ...(prev.personalInfo || {}),
                            permanentAddress: e.target.value
                          }
                        } : null)}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Mobile Number</Label>
                      <Input
                        value={selectedUserProfile?.personalInfo?.mobileNumber || ""}
                        onChange={(e) => setSelectedUserProfile(prev => prev ? {
                          ...prev,
                          personalInfo: {
                            ...(prev.personalInfo || {}),
                            mobileNumber: e.target.value
                          }
                        } : null)}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />

                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Occupation</Label>
                      <Input
                        value={selectedUserProfile?.personalInfo?.occupation || ""}
                        onChange={(e) => setSelectedUserProfile(prev => prev ? {
                          ...prev,
                          personalInfo: {
                            ...(prev.personalInfo || {}),
                            occupation: e.target.value
                          }
                        } : null)}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="col-span-2 bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Loan Purpose</Label>
                      <Textarea
                        value={selectedUserProfile?.personalInfo?.loanPurpose || ""}
                        onChange={(e) => setSelectedUserProfile(prev => prev ? {
                          ...prev,
                          personalInfo: {
                            ...(prev.personalInfo || {}),
                            loanPurpose: e.target.value
                          }
                        } : null)}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Nominee Information</h3>
                    <div className="bg-gradient-to-r from-green-500 to-teal-500 px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-white">Editable</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Nominee Name</Label>
                      <Input
                        value={selectedUserProfile?.personalInfo?.nomineeName || ""}
                        onChange={(e) => setSelectedUserProfile(prev => prev ? {
                          ...prev,
                          personalInfo: {
                            ...(prev.personalInfo || {}),
                            nomineeName: e.target.value
                          }
                        } : null)}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Nominee Phone</Label>
                      <Input
                        value={selectedUserProfile?.personalInfo?.nomineePhone || ""}
                        onChange={(e) => setSelectedUserProfile(prev => prev ? {
                          ...prev,
                          personalInfo: {
                            ...(prev.personalInfo || {}),
                            nomineePhone: e.target.value
                          }
                        } : null)}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Nominee Relation</Label>
                      <Input
                        value={selectedUserProfile?.personalInfo?.nomineeRelation || ""}
                        onChange={(e) => setSelectedUserProfile(prev => prev ? {
                          ...prev,
                          personalInfo: {
                            ...(prev.personalInfo || {}),
                            nomineeRelation: e.target.value
                          }
                        } : null)}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Document Images Section */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Document Images</h3>
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-white">View Only</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedUserProfile?.personalInfo?.profilePhoto && (
                      <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center">
                        <Label className="text-sm font-medium text-gray-700 mb-2">Profile Photo</Label>
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                          <Image 
                            src={selectedUserProfile.personalInfo.profilePhoto} 
                            alt="Profile Photo" 
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder-image.png";
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {selectedUserProfile?.personalInfo?.nidCardFront && (
                      <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center">
                        <Label className="text-sm font-medium text-gray-700 mb-2">NID Front</Label>
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                          <Image 
                            src={selectedUserProfile.personalInfo.nidCardFront} 
                            alt="NID Card Front" 
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder-image.png";
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {selectedUserProfile?.personalInfo?.nidCardBack && (
                      <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center">
                        <Label className="text-sm font-medium text-gray-700 mb-2">NID Back</Label>
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                          <Image 
                            src={selectedUserProfile.personalInfo.nidCardBack} 
                            alt="NID Card Back" 
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder-image.png";
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {selectedUserProfile?.personalInfo?.selfieWithId && (
                      <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center">
                        <Label className="text-sm font-medium text-gray-700 mb-2">Selfie with ID</Label>
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                          <Image 
                            src={selectedUserProfile.personalInfo.selfieWithId} 
                            alt="Selfie with ID" 
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder-image.png";
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {selectedUserProfile?.personalInfo?.signature && (
                      <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center">
                        <Label className="text-sm font-medium text-gray-700 mb-2">Signature</Label>
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                          <Image 
                            src={selectedUserProfile.personalInfo.signature} 
                            alt="Signature" 
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder-image.png";
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Bank Information</h3>
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-white">Editable</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Account Type</Label>
                      <Select 
                        value={selectedUserProfile?.bankInfo?.accountType || ""}
                        onValueChange={(value) => setSelectedUserProfile(prev => prev ? {
                          ...prev,
                          bankInfo: {
                            ...(prev.bankInfo || {}),
                            accountType: value
                          }
                        } : null)}
                      >
                        <SelectTrigger className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank">Bank</SelectItem>
                          <SelectItem value="nagad">Nagad</SelectItem>
                          <SelectItem value="bkash">bKash</SelectItem>
                          <SelectItem value="rocket">Rocket</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Bank Name</Label>
                      <Input
                        value={selectedUserProfile?.bankInfo?.bankName || ""}
                        onChange={(e) => setSelectedUserProfile(prev => prev ? {
                          ...prev,
                          bankInfo: {
                            ...(prev.bankInfo || {}),
                            bankName: e.target.value
                          }
                        } : null)}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Account Name</Label>
                      <Input
                        value={selectedUserProfile?.bankInfo?.accountName || ""}
                        onChange={(e) => setSelectedUserProfile(prev => prev ? {
                          ...prev,
                          bankInfo: {
                            ...(prev.bankInfo || {}),
                            accountName: e.target.value
                          }
                        } : null)}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Label className="text-sm font-medium text-gray-700">Account Number</Label>
                      <Input
                        value={selectedUserProfile?.bankInfo?.accountNumber || ""}
                        onChange={(e) => setSelectedUserProfile(prev => prev ? {
                          ...prev,
                          bankInfo: {
                            ...(prev.bankInfo || {}),
                            accountNumber: e.target.value
                          }
                        } : null)}
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedUserProfile(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      
      {/* Custom Animation Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}