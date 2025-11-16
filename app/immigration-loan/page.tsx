"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload } from "lucide-react";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ImmigrationLoanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    motherName: "",
    nid: "",
    passport: "",
    phone: "",
    email: "",
    address: "",
    destinationCountry: "",
    reason: "",
  });
  const [documents, setDocuments] = useState({
    nidFront: null as File | null,
    nidBack: null as File | null,
    passport: null as File | null,
    signature: null as File | null,
  });
  const [previewUrls, setPreviewUrls] = useState({
    nidFront: "",
    nidBack: "",
    passport: "",
    signature: "",
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
      router.push("/login");
      return;
    }

    // Fetch user profile data
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/user/profile", {
          headers: { "x-user-id": userId },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          // Prefill form with existing data if available
          setFormData({
            fullName: userData.personalInfo?.fullName || "",
            fatherName: userData.personalInfo?.fatherName || "",
            motherName: userData.personalInfo?.motherName || "",
            nid: userData.personalInfo?.nid || "",
            passport: userData.personalInfo?.passport || "",
            phone: userData.personalInfo?.phone || "",
            email: userData.personalInfo?.email || "",
            address: userData.personalInfo?.address || "",
            destinationCountry: userData.personalInfo?.destinationCountry || "",
            reason: userData.personalInfo?.reason || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    fetchUserProfile()
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocuments({ ...documents, [field]: file });
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrls({ ...previewUrls, [field]: url });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First, upload documents to Cloudinary
      const uploadPromises = Object.entries(documents)
        .filter(([_, file]) => file) // Only upload files that exist
        .map(async ([fieldName, file]) => {
          const formData = new FormData();
          formData.append('file', file as File);
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error(`Failed to upload ${fieldName}`);
          }
          
          const result = await response.json();
          return { [fieldName]: result.secure_url };
        });
      
      // Wait for all uploads to complete
      const uploadResults = await Promise.all(uploadPromises);
      
      // Combine all URLs into a single object
      const documentUrls = uploadResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      
      // Save form data and document URLs to user profile
      const userId = localStorage.getItem("userId");
      const saveResponse = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId || '',
        },
        body: JSON.stringify({
          personalInfo: {
            ...formData,
            immigrationDocuments: documentUrls,
          }
        }),
      });
      
      if (!saveResponse.ok) {
        throw new Error('Failed to save form data');
      }
      
      // Redirect to success page or next step
      router.push('/dashboard');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('ত্রুটি হয়েছে! আবার চেষ্টা করুন।');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 mb-6 mx-auto">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-foreground text-xl font-medium">লোড হচ্ছে...</p>
          <p className="text-gray-500 mt-2">আপনার তথ্য আনা হচ্ছে</p>
        </div>
      </div>
    );
  }
  
  if (!isMobile) {
    // Desktop view
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <BottomNavigation />
        <main className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex justify-between items-center mb-8">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              পিছনে
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent">
              ইমিগ্রেশন ঋণ আবেদন
            </h1>
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>

          <Card className="p-8 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-2xl rounded-3xl">
            <CardHeader className="pb-6 text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">
                ব্যক্তিগত তথ্য ফর্ম
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-700">পূর্ণ নাম *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fatherName" className="text-gray-700">পিতার নাম *</Label>
                    <Input
                      id="fatherName"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      required
                      className="py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="motherName" className="text-gray-700">মাতার নাম *</Label>
                    <Input
                      id="motherName"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      required
                      className="py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nid" className="text-gray-700">জাতীয় পরিচয়পত্র নম্বর *</Label>
                    <Input
                      id="nid"
                      name="nid"
                      value={formData.nid}
                      onChange={handleInputChange}
                      required
                      className="py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="passport" className="text-gray-700">পাসপোর্ট নম্বর *</Label>
                    <Input
                      id="passport"
                      name="passport"
                      value={formData.passport}
                      onChange={handleInputChange}
                      required
                      className="py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700">ফোন নম্বর *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">ইমেইল ঠিকানা</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="destinationCountry" className="text-gray-700">গন্তব্য দেশ *</Label>
                    <Input
                      id="destinationCountry"
                      name="destinationCountry"
                      value={formData.destinationCountry}
                      onChange={handleInputChange}
                      required
                      className="py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-gray-700">ঠিকানা *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-gray-700">ইমিগ্রেশনের কারণ *</Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    required
                    className="py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries({
                    nidFront: "এনআইডি সামনের অংশ",
                    nidBack: "এনআইডি পিছনের অংশ",
                    passport: "পাসপোর্ট",
                    signature: "স্বাক্ষর",
                  }).map(([field, label]) => (
                    <div key={field} className="space-y-2">
                      <Label className="text-gray-700">{label} *</Label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-gray-500" />
                            <p className="text-sm text-gray-500">
                              <span className="font-semibold">ক্লিক করুন আপলোড করতে</span> বা টেনে আনুন
                            </p>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, field)}
                          />
                        </label>
                      </div>
                      {previewUrls[field as keyof typeof previewUrls] && (
                        <div className="mt-2 relative">
                          <button 
                            onClick={() => {
                              setDocuments({ ...documents, [field]: null });
                              setPreviewUrls({ ...previewUrls, [field]: "" });
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 z-10"
                          >
                            ×
                          </button>
                          <div className="border rounded-md overflow-hidden">
                            <img 
                              src={previewUrls[field as keyof typeof previewUrls]} 
                              alt="Preview" 
                              className="w-full h-auto max-h-32 object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between pt-6">
                  <Button 
                    variant="outline"
                    className="py-3 px-6 text-lg font-bold bg-white hover:bg-gray-50 text-blue-600 border-blue-200 rounded-xl shadow transition-all duration-300"
                    onClick={() => router.push("/dashboard")}
                  >
                    পরে পূরণ করব
                  </Button>
                  <Button 
                    type="submit"
                    className="py-3 px-8 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
                  >
                    জমা দিন
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Mobile view with moon-shaped header and static navbar
  return (
    <main className={`phone-frame min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900`}>
      {/* Moon-shaped header with curved top and bottom (without any radial effects) */}
      <div className="w-full pt-12 pb-16 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Moon-shaped curved background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-indigo-700/30 to-purple-600/30 backdrop-blur-lg"></div>
        
        {/* Top curved moon shape */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/20 to-transparent rounded-b-[50%]"></div>
        
        {/* Bottom curved moon shape to match header */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/20 to-transparent rounded-t-[50%]"></div>
        
        {/* Floating particles effect */}
        <div className="absolute top-8 left-8 w-2 h-2 rounded-full bg-blue-300/50 animate-ping"></div>
        <div className="absolute top-12 right-10 w-1.5 h-1.5 rounded-full bg-indigo-200/60 animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-16 left-12 w-1 h-1 rounded-full bg-purple-300/50 animate-ping" style={{ animationDelay: '2s' }}></div>
        
        {/* Logo container with subtle glow */}
        <div className="relative z-10 bg-white/20 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl p-6 shadow-blue-500/40">
          <div className="text-center">
            <img 
              src="/The World Bank.png" 
              alt="The World Bank Logo" 
              className="max-w-full max-h-20 object-contain mx-auto filter brightness-0 invert drop-shadow-2xl"
            />
          </div>
        </div>
        
        {/* Decorative glow elements */}
        <div className="absolute -top-6 left-1/4 w-32 h-32 bg-blue-500/15 rounded-full blur-3xl"></div>
        <div className="absolute -top-2 right-1/3 w-24 h-24 bg-indigo-500/15 rounded-full blur-3xl"></div>
      </div>
      
      {/* Immigration loan content section with improved styling and bottom padding for nav */}
      <div className="flex-1 flex flex-col px-4 pb-20 bg-gradient-to-b from-blue-50/90 to-indigo-100/90 backdrop-blur-sm">
        {/* Curved top to match header */}
        <div className="h-8 bg-gradient-to-b from-white/30 to-transparent rounded-t-[50%] -mt-4"></div>
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="outline" 
            className="flex items-center gap-1 text-sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-3 w-3" />
            পিছনে
          </Button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent">
            ইমিগ্রেশন ঋণ আবেদন
          </h1>
          <div className="w-16"></div> {/* Spacer for alignment */}
        </div>

        <Card className="p-4 bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl shadow-lg flex-1 flex flex-col">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-lg font-bold text-gray-800">
              ব্যক্তিগত তথ্য ফর্ম
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="fullName" className="text-gray-700 text-sm">পূর্ণ নাম *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="fatherName" className="text-gray-700 text-sm">পিতার নাম *</Label>
                  <Input
                    id="fatherName"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    required
                    className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="motherName" className="text-gray-700 text-sm">মাতার নাম *</Label>
                  <Input
                    id="motherName"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    required
                    className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="nid" className="text-gray-700 text-sm">জাতীয় পরিচয়পত্র নম্বর *</Label>
                  <Input
                    id="nid"
                    name="nid"
                    value={formData.nid}
                    onChange={handleInputChange}
                    required
                    className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="passport" className="text-gray-700 text-sm">পাসপোর্ট নম্বর *</Label>
                  <Input
                    id="passport"
                    name="passport"
                    value={formData.passport}
                    onChange={handleInputChange}
                    required
                    className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-gray-700 text-sm">ফোন নম্বর *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-gray-700 text-sm">ইমেইল ঠিকানা</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="destinationCountry" className="text-gray-700 text-sm">গন্তব্য দেশ *</Label>
                  <Input
                    id="destinationCountry"
                    name="destinationCountry"
                    value={formData.destinationCountry}
                    onChange={handleInputChange}
                    required
                    className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="address" className="text-gray-700 text-sm">ঠিকানা *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="reason" className="text-gray-700 text-sm">ইমিগ্রেশনের কারণ *</Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    required
                    className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] text-sm"
                  />
                </div>
                
                <div className="space-y-4">
                  {Object.entries({
                    nidFront: "এনআইডি সামনের অংশ",
                    nidBack: "এনআইডি পিছনের অংশ",
                    passport: "পাসপোর্ট",
                    signature: "স্বাক্ষর",
                  }).map(([field, label]) => (
                    <div key={field} className="space-y-1">
                      <Label className="text-gray-700 text-sm">{label} *</Label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-3 pb-4">
                            <Upload className="w-6 h-6 mb-2 text-gray-500" />
                            <p className="text-xs text-gray-500">
                              <span className="font-semibold">ক্লিক করুন আপলোড করতে</span> বা টেনে আনুন
                            </p>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, field)}
                          />
                        </label>
                      </div>
                      {previewUrls[field as keyof typeof previewUrls] && (
                        <div className="mt-2 relative">
                          <button 
                            onClick={() => {
                              setDocuments({ ...documents, [field]: null });
                              setPreviewUrls({ ...previewUrls, [field]: "" });
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 z-10"
                          >
                            ×
                          </button>
                          <div className="border rounded-md overflow-hidden">
                            <img 
                              src={previewUrls[field as keyof typeof previewUrls]} 
                              alt="Preview" 
                              className="w-full h-auto max-h-24 object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  variant="outline"
                  className="py-2 px-4 text-sm font-bold bg-white hover:bg-gray-50 text-blue-600 border-blue-200 rounded-lg shadow transition-all duration-300"
                  onClick={() => router.push("/dashboard")}
                >
                  পরে পূরণ করব
                </Button>
                <Button 
                  type="submit"
                  className="py-2 px-4 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                  জমা দিন
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      
      {/* Static bottom navigation - always visible and not overlapping content */}
      <div className="relative z-20">
        <BottomNavigation />
      </div>
    </main>
  );
}