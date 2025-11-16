"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  IdCard, 
  Briefcase,
  Users,
  Target
} from "lucide-react"

interface PersonalInfo {
  fullName?: string
  mobileNumber?: string
  birthDate?: string
  presentAddress?: string
  nidNumber?: string
  occupation?: string
  permanentAddress?: string
  loanPurpose?: string
  nomineeRelation?: string
  nomineeName?: string
  nomineePhone?: string
}

interface EditPersonalInfoModalProps {
  isOpen: boolean
  onClose: () => void
  personalInfo: PersonalInfo
  onSave: (updatedData: PersonalInfo) => void
}

export function EditPersonalInfoModal({ isOpen, onClose, personalInfo, onSave }: EditPersonalInfoModalProps) {
  const [formData, setFormData] = useState<PersonalInfo>({
    fullName: "",
    mobileNumber: "",
    birthDate: "",
    presentAddress: "",
    nidNumber: "",
    occupation: "",
    permanentAddress: "",
    loanPurpose: "",
    nomineeRelation: "",
    nomineeName: "",
    nomineePhone: "",
  })
  
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (personalInfo) {
      setFormData({
        fullName: personalInfo.fullName || "",
        mobileNumber: personalInfo.mobileNumber || "",
        birthDate: personalInfo.birthDate || "",
        presentAddress: personalInfo.presentAddress || "",
        nidNumber: personalInfo.nidNumber || "",
        occupation: personalInfo.occupation || "",
        permanentAddress: personalInfo.permanentAddress || "",
        loanPurpose: personalInfo.loanPurpose || "",
        nomineeRelation: personalInfo.nomineeRelation || "",
        nomineeName: personalInfo.nomineeName || "",
        nomineePhone: personalInfo.nomineePhone || "",
      })
    }
  }, [personalInfo])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      onSave(formData)
      onClose()
    } catch (error) {
      console.error("Error updating personal info:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">ব্যক্তিগত তথ্য সম্পাদনা</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm text-gray-700">নাম</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="সম্পূর্ণ নাম"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="mobileNumber" className="text-sm text-gray-700">মোবাইল</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="মোবাইল নম্বর"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="birthDate" className="text-sm text-gray-700">জন্ম তারিখ</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="presentAddress" className="text-sm text-gray-700">ঠিকানা</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="presentAddress"
                      name="presentAddress"
                      value={formData.presentAddress}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="বর্তমান ঠিকানা"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="nidNumber" className="text-sm text-gray-700">এনআইডি নম্বর</Label>
                  <div className="relative mt-1">
                    <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="nidNumber"
                      name="nidNumber"
                      value={formData.nidNumber}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="NID নম্বর"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="occupation" className="text-sm text-gray-700">পেশা</Label>
                  <div className="relative mt-1">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="occupation"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="পেশা"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="permanentAddress" className="text-sm text-gray-700">স্থায়ী ঠিকানা</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="permanentAddress"
                      name="permanentAddress"
                      value={formData.permanentAddress}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="স্থায়ী ঠিকানা"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="loanPurpose" className="text-sm text-gray-700">লোনের উদ্দেশ্য</Label>
                  <div className="relative mt-1">
                    <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="loanPurpose"
                      name="loanPurpose"
                      value={formData.loanPurpose}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="লোনের উদ্দেশ্য"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="nomineeRelation" className="text-sm text-gray-700">নমিনি সম্পর্ক</Label>
                  <div className="relative mt-1">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      id="nomineeRelation"
                      name="nomineeRelation"
                      value={formData.nomineeRelation}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">সম্পর্ক নির্বাচন করুন</option>
                      <option value="parent">পিতা/মাতা</option>
                      <option value="spouse">স্বামী/স্ত্রী</option>
                      <option value="child">পুত্র/কন্যা</option>
                      <option value="sibling">ভাই/বোন</option>
                      <option value="other">অন্যান্য</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="nomineeName" className="text-sm text-gray-700">নমিনি নাম</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="nomineeName"
                      name="nomineeName"
                      value={formData.nomineeName}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="নমিনির নাম"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="nomineePhone" className="text-sm text-gray-700">নমিনি মোবাইল নম্বর</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="nomineePhone"
                      name="nomineePhone"
                      value={formData.nomineePhone}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="নমিনি মোবাইল নম্বর"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "সংরক্ষণ করছেন..." : "সংরক্ষণ করুন"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}