import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"

interface CustomerData {
  _id: string
  name: string
  phone: string
  personalInfo?: Record<string, any>
  bankInfo?: Record<string, any>
  images?: Record<string, string>
  applicationDate?: string
  statusUpdatedAt?: string
  loanEndDate?: string
  monthlyPaymentDates?: string[]
}

interface UserProps {
  customer: CustomerData
  onSave?: (updatedCustomer: CustomerData) => void
}

export function User({ customer, onSave }: UserProps) {
  const [editableCustomer, setEditableCustomer] = useState<CustomerData>(customer)
  const [isEditing, setIsEditing] = useState(false)

  // Update editableCustomer when customer prop changes
  useEffect(() => {
    setEditableCustomer(customer)
  }, [customer])

  const handleInputChange = (section: string, field: string, value: string) => {
    setEditableCustomer(prev => {
      // Handle top-level fields like 'name' and 'phone'
      if (section === 'root') {
        return {
          ...prev,
          [field]: value
        }
      }
      
      // Handle nested sections like 'personalInfo' and 'bankInfo'
      const sectionData = prev[section as keyof CustomerData] as Record<string, any> || {}
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: value
        }
      }
    })
  }

  const handleSave = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": editableCustomer._id
        },
        body: JSON.stringify({
          personalInfo: editableCustomer.personalInfo,
          bankInfo: editableCustomer.bankInfo
        }),
      })

      if (response.ok) {
        if (onSave) {
          onSave(editableCustomer)
        }
        toast.success("Profile updated successfully!")
        setIsEditing(false)
      } else {
        const errorData = await response.json();
        toast.error("Failed to update profile: " + (errorData.error || "Unknown error"))
      }
    } catch (err) {
      toast.error("Error updating profile")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{editableCustomer.name}</h2>
          <p className="text-gray-600">Customer Profile Details</p>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
          <div className="bg-blue-50 px-3 py-1 rounded-full">
            <span className="text-xs font-semibold text-blue-700">Editable</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">Name</p>
            {isEditing ? (
              <Input
                value={editableCustomer.personalInfo?.fullName || editableCustomer.name || ""}
                onChange={(e) => {
                  // Update both name fields to keep them in sync
                  setEditableCustomer(prev => ({
                    ...prev,
                    name: e.target.value,
                    personalInfo: {
                      ...prev.personalInfo,
                      fullName: e.target.value
                    }
                  }))
                }}
                className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="font-medium text-gray-900 mt-1">{editableCustomer.personalInfo?.fullName || editableCustomer.name || "N/A"}</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">ID Number</p>
            {isEditing ? (
              <Input
                value={editableCustomer.personalInfo?.nidNumber || ""}
                onChange={(e) => handleInputChange("personalInfo", "nidNumber", e.target.value)}
                className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="font-medium text-gray-900 mt-1">{editableCustomer.personalInfo?.nidNumber || "N/A"}</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">Current Address</p>
            {isEditing ? (
              <Input
                value={editableCustomer.personalInfo?.presentAddress || ""}
                onChange={(e) => handleInputChange("personalInfo", "presentAddress", e.target.value)}
                className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="font-medium text-gray-900 mt-1">{editableCustomer.personalInfo?.presentAddress || "N/A"}</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">Permanent Address</p>
            {isEditing ? (
              <Input
                value={editableCustomer.personalInfo?.permanentAddress || ""}
                onChange={(e) => handleInputChange("personalInfo", "permanentAddress", e.target.value)}
                className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="font-medium text-gray-900 mt-1">{editableCustomer.personalInfo?.permanentAddress || "N/A"}</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">Mobile Number</p>
            {isEditing ? (
              <Input
                value={editableCustomer.personalInfo?.mobileNumber || editableCustomer.phone || ""}
                onChange={(e) => {
                  // Update both phone fields to keep them in sync
                  setEditableCustomer(prev => ({
                    ...prev,
                    phone: e.target.value,
                    personalInfo: {
                      ...prev.personalInfo,
                      mobileNumber: e.target.value
                    }
                  }))
                }}
                className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="font-medium text-gray-900 mt-1">{editableCustomer.personalInfo?.mobileNumber || editableCustomer.phone || "N/A"}</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">Occupation</p>
            {isEditing ? (
              <Input
                value={editableCustomer.personalInfo?.occupation || ""}
                onChange={(e) => handleInputChange("personalInfo", "occupation", e.target.value)}
                className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="font-medium text-gray-900 mt-1">{editableCustomer.personalInfo?.occupation || "N/A"}</p>
            )}
          </div>
          <div className="col-span-2 bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">Loan Purpose</p>
            {isEditing ? (
              <Input
                value={editableCustomer.personalInfo?.loanPurpose || ""}
                onChange={(e) => handleInputChange("personalInfo", "loanPurpose", e.target.value)}
                className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="font-medium text-gray-900 mt-1">{editableCustomer.personalInfo?.loanPurpose || "N/A"}</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">Birth Date</p>
            {isEditing ? (
              <Input
                type="date"
                value={editableCustomer.personalInfo?.birthDate || ""}
                onChange={(e) => handleInputChange("personalInfo", "birthDate", e.target.value)}
                className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="font-medium text-gray-900 mt-1">
                {editableCustomer.personalInfo?.birthDate 
                  ? new Date(editableCustomer.personalInfo.birthDate).toLocaleDateString('en-GB') 
                  : "N/A"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Nominee Information */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Nominee Information</h3>
          <div className="bg-green-50 px-3 py-1 rounded-full">
            <span className="text-xs font-semibold text-green-700">Editable</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">Nominee Name</p>
            {isEditing ? (
              <Input
                value={editableCustomer.personalInfo?.nomineeName || ""}
                onChange={(e) => handleInputChange("personalInfo", "nomineeName", e.target.value)}
                className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="font-medium text-gray-900 mt-1">{editableCustomer.personalInfo?.nomineeName || "N/A"}</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">Nominee Phone</p>
            {isEditing ? (
              <Input
                value={editableCustomer.personalInfo?.nomineePhone || ""}
                onChange={(e) => handleInputChange("personalInfo", "nomineePhone", e.target.value)}
                className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="font-medium text-gray-900 mt-1">{editableCustomer.personalInfo?.nomineePhone || "N/A"}</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">Nominee Relation</p>
            {isEditing ? (
              <Input
                value={editableCustomer.personalInfo?.nomineeRelation || ""}
                onChange={(e) => handleInputChange("personalInfo", "nomineeRelation", e.target.value)}
                className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="font-medium text-gray-900 mt-1">{editableCustomer.personalInfo?.nomineeRelation || "N/A"}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bank Information */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Bank Information</h3>
          <div className="bg-yellow-50 px-3 py-1 rounded-full">
            <span className="text-xs font-semibold text-yellow-700">Editable</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">Bank Name</p>
            {isEditing ? (
              <Input
                value={editableCustomer.bankInfo?.bankName || ""}
                onChange={(e) => handleInputChange("bankInfo", "bankName", e.target.value)}
                className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="font-medium text-gray-900 mt-1">{editableCustomer.bankInfo?.bankName || "N/A"}</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">Account Type</p>
            {isEditing ? (
              <Input
                value={editableCustomer.bankInfo?.accountType || ""}
                onChange={(e) => handleInputChange("bankInfo", "accountType", e.target.value)}
                className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="font-medium text-gray-900 mt-1">{editableCustomer.bankInfo?.accountType || "N/A"}</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">Account Number</p>
            {isEditing ? (
              <Input
                value={editableCustomer.bankInfo?.accountNumber || ""}
                onChange={(e) => handleInputChange("bankInfo", "accountNumber", e.target.value)}
                className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="font-medium text-gray-900 mt-1">{editableCustomer.bankInfo?.accountNumber || "N/A"}</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">Account Holder Name</p>
            {isEditing ? (
              <Input
                value={editableCustomer.bankInfo?.accountName || editableCustomer.bankInfo?.accountHolderName || ""}
                onChange={(e) => handleInputChange("bankInfo", "accountName", e.target.value)}
                className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="font-medium text-gray-900 mt-1">{editableCustomer.bankInfo?.accountName || editableCustomer.bankInfo?.accountHolderName || "N/A"}</p>
            )}
          </div>
        </div>
      </div>

      {/* Loan Dates */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Loan Dates</h3>
          <div className="bg-indigo-50 px-3 py-1 rounded-full">
            <span className="text-xs font-semibold text-indigo-700">Information</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">Application Date</p>
            <p className="font-medium text-gray-900 mt-1">
              {editableCustomer.applicationDate 
                ? new Date(editableCustomer.applicationDate).toLocaleDateString('en-GB') 
                : 'Not set'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">Status Updated At</p>
            <p className="font-medium text-gray-900 mt-1">
              {editableCustomer.statusUpdatedAt 
                ? new Date(editableCustomer.statusUpdatedAt).toLocaleDateString('en-GB') 
                : 'Not updated'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">Loan End Date</p>
            <p className="font-medium text-gray-900 mt-1">
              {editableCustomer.loanEndDate 
                ? new Date(editableCustomer.loanEndDate).toLocaleDateString('en-GB') 
                : 'Not set'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">Monthly Payment Dates</p>
            <p className="font-medium text-gray-900 mt-1">
              {editableCustomer.monthlyPaymentDates && editableCustomer.monthlyPaymentDates.length > 0
                ? `${editableCustomer.monthlyPaymentDates.length} payments scheduled`
                : 'Not scheduled'}
            </p>
          </div>
        </div>
      </div>

      {/* Withdrawal Screenshots Section - Conditional */}
      {editableCustomer.personalInfo?.withdrawalScreenshot && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Withdrawal Screenshot</h3>
            <div className="bg-green-50 px-3 py-1 rounded-full">
              <span className="text-xs font-semibold text-green-700">View Only</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Withdrawal Screenshot</p>
              <div className="relative w-full h-40 bg-muted rounded overflow-hidden">
                <img
                  src={editableCustomer.personalInfo.withdrawalScreenshot}
                  alt="Withdrawal Screenshot"
                  className="object-cover w-full h-full rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Images */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Documents</h3>
          <div className="bg-purple-50 px-3 py-1 rounded-full">
            <span className="text-xs font-semibold text-purple-700">View Only</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {editableCustomer.personalInfo?.profilePhoto && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Profile Photo</p>
              <div className="relative w-full h-40 bg-muted rounded overflow-hidden">
                <img
                  src={editableCustomer.personalInfo.profilePhoto}
                  alt="Member Photo"
                  className="object-cover w-full h-full rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </div>
            </div>
          )}
          {editableCustomer.personalInfo?.nidCardFront && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">ID - Front</p>
              <div className="relative w-full h-40 bg-muted rounded overflow-hidden">
                <img
                  src={editableCustomer.personalInfo.nidCardFront}
                  alt="NID Front"
                  className="object-cover w-full h-full rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </div>
            </div>
          )}
          {editableCustomer.personalInfo?.nidCardBack && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">ID - Back</p>
              <div className="relative w-full h-40 bg-muted rounded overflow-hidden">
                <img
                  src={editableCustomer.personalInfo.nidCardBack}
                  alt="NID Back"
                  className="object-cover w-full h-full rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </div>
            </div>
          )}
          {editableCustomer.personalInfo?.selfieWithId && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Selfie with ID</p>
              <div className="relative w-full h-40 bg-muted rounded overflow-hidden">
                <img
                  src={editableCustomer.personalInfo.selfieWithId}
                  alt="Selfie with ID"
                  className="object-cover w-full h-full rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </div>
            </div>
          )}
          {editableCustomer.personalInfo?.signature && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Signature</p>
              <div className="relative w-full h-40 bg-muted rounded overflow-hidden">
                <img
                  src={editableCustomer.personalInfo.signature}
                  alt="Signature"
                  className="object-cover w-full h-full rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}