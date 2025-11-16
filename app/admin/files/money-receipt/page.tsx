"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Recipient {
  name: string
  address: string
  phone: string
  email: string
}

interface Invoice {
  amount: string
  description: string
  date: string
}

interface GeneratedInvoice extends Recipient, Invoice {
  id: number
  status: string
  purpose: string
  paidBy: string
  amountInWords: string
  receiptNo: string
  digitalSignature?: string
}

export default function MoneyReceiptPage() {
  const router = useRouter()
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [recipient, setRecipient] = useState<Recipient>({
    name: "",
    address: "",
    phone: "",
    email: ""
  })
  const [invoice, setInvoice] = useState<Invoice>({
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  })
  const [purpose, setPurpose] = useState("")
  const [paidBy, setPaidBy] = useState("")
  const [amountInWords, setAmountInWords] = useState("")
  const [receiptNo, setReceiptNo] = useState("")
  const [invoices, setInvoices] = useState<GeneratedInvoice[]>([])
  const [showReceipt, setShowReceipt] = useState(false)
  const [currentReceipt, setCurrentReceipt] = useState<GeneratedInvoice | null>(null)
  const [useCloneDate, setUseCloneDate] = useState(true)
  const [useCloneReceiptNo, setUseCloneReceiptNo] = useState(true)
  const [digitalSignature, setDigitalSignature] = useState("")

  useEffect(() => {
    const adminId = localStorage.getItem("adminId")
    if (!adminId) {
      router.push("/admin-login")
    } else {
      setIsAuthLoading(false)
    }
  }, [router])

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setRecipient(prev => ({ ...prev, [name]: value }))
  }

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setInvoice(prev => ({ ...prev, [name]: value }))
  }

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Use clone values if selected
    const finalDate = useCloneDate ? new Date().toISOString().split('T')[0] : invoice.date
    const finalReceiptNo = useCloneReceiptNo ? `RCPT-${Date.now()}` : receiptNo
    
    // In a real app, this would generate and save the invoice
    const newInvoice: GeneratedInvoice = {
      id: Date.now(),
      ...recipient,
      ...invoice,
      date: finalDate,
      purpose,
      paidBy,
      amountInWords,
      receiptNo: finalReceiptNo,
      digitalSignature,
      status: "Generated"
    }
    setInvoices(prev => [newInvoice, ...prev])
    
    // Show the receipt template
    setCurrentReceipt(newInvoice)
    setShowReceipt(true)
    
    // Reset form
    setRecipient({
      name: "",
      address: "",
      phone: "",
      email: ""
    })
    setInvoice({
      amount: "",
      description: "",
      date: new Date().toISOString().split('T')[0]
    })
    setPurpose("")
    setPaidBy("")
    setAmountInWords("")
    setReceiptNo("")
    setDigitalSignature("")
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = (receipt: GeneratedInvoice) => {
    // Create a new window with the receipt
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - ${receipt.receiptNo}</title>
            <style>
              body { 
                font-family: Inter, Roboto, Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background: #f5f5f5;
              }
              .receipt-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border-radius: 6px;
                box-shadow: 0 6px 18px rgba(0,0,0,0.08);
                padding: 32px 36px;
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 30px;
              }
              .logo-block {
                display: flex;
                align-items: center;
              }
              .logo-text {
                margin-right: 24px;
              }
              .logo-text div:first-child {
                font-weight: bold;
                font-size: 22px;
              }
              .logo-text div:last-child {
                font-size: 12px;
              }
              .logo-bars {
                display: flex;
              }
              .bar1 {
                width: 8px;
                height: 56px;
                background: #0D6BFF;
                margin-right: 8px;
              }
              .bar2 {
                width: 6px;
                height: 48px;
                background: #6FC3FF;
                margin-top: 4px;
              }
              .title {
                font-size: 36px;
                font-weight: 800;
                color: #153B0E;
                letter-spacing: 0.02em;
              }
              .receipt-info {
                text-align: right;
              }
              .receipt-info div {
                margin-bottom: 8px;
                font-size: 14px;
                font-weight: 600;
              }
              .section-header {
                background: #153B0E;
                height: 28px;
                display: flex;
                align-items: center;
                padding-left: 10px;
                color: white;
                font-size: 14px;
                font-weight: 700;
              }
              .content-box {
                border: 1px solid #E6E6E6;
                min-height: 40px;
                padding: 10px;
                background: white;
                font-size: 15px;
                font-weight: 500;
              }
              .two-column {
                display: flex;
                justify-content: space-between;
                margin-bottom: 24px;
              }
              .column {
                width: 48%;
              }
              .amount-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 24px;
              }
              .amount-received {
                width: 22%;
              }
              .amount-words {
                width: 72%;
              }
              .purpose-section {
                margin-top: 18px;
                margin-bottom: 48px;
              }
              .purpose-content {
                min-height: 48px;
                padding: 12px;
              }
              .signature-area {
                text-align: right;
                margin-top: 40px;
              }
              .signature-box {
                display: inline-block;
                width: 260px;
                text-align: center;
              }
              .signature-line {
                border-top: 1px dashed #333;
                margin-bottom: 8px;
              }
              .signature-text {
                font-size: 13px;
                font-weight: 700;
              }
              .authorized-name {
                font-size: 13px;
                font-weight: 700;
                margin-top: 4px;
              }
              @media print {
                body {
                  background: white;
                  padding: 0;
                }
                .receipt-container {
                  box-shadow: none;
                  padding: 32px 36px;
                }
                .section-header {
                  background: #153B0E !important;
                  color: white !important;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .title {
                  color: #153B0E !important;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .bar1 {
                  background: #0D6BFF !important;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .bar2 {
                  background: #6FC3FF !important;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="header">
                <div class="logo-block">
                  <div class="logo-text">
                    <div>THE WORLD BANK</div>
                    <div>Bangladesh</div>
                  </div>
                  <div class="logo-bars">
                    <div class="bar1"></div>
                    <div class="bar2"></div>
                  </div>
                </div>
                <div class="title">MONEY RECEIPT</div>
                <div class="receipt-info">
                  <div>Receipt Date: ${receipt.date}</div>
                  <div>Receipt No: ${receipt.receiptNo}</div>
                </div>
              </div>
              
              <div class="two-column">
                <div class="column">
                  <div class="section-header">Received From</div>
                  <div class="content-box">${receipt.name}</div>
                </div>
                <div class="column">
                  <div class="section-header">Paid by</div>
                  <div class="content-box">${receipt.paidBy}</div>
                </div>
              </div>
              
              <div class="amount-section">
                <div class="amount-received">
                  <div class="section-header">Amount Received</div>
                  <div class="content-box">Tk ${receipt.amount}</div>
                </div>
                <div class="amount-words">
                  <div class="section-header">Amount in Words</div>
                  <div class="content-box">${receipt.amountInWords}</div>
                </div>
              </div>
              
              <div class="purpose-section">
                <div class="section-header">Purpose of Payment</div>
                <div class="content-box purpose-content">${receipt.purpose}</div>
              </div>
              
              <div class="signature-area">
                <div class="signature-box">
                  <div class="authorized-name">MD. Mahfuz Khandaker</div>
                  <div class="signature-text">Authorized Signature</div>
                  <div class="signature-line"></div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      // Give some time for content to load before printing
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }
  }

  const handlePrintReceipt = (receipt: GeneratedInvoice) => {
    // Create a new window with the receipt
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - ${receipt.receiptNo}</title>
            <style>
              body { 
                font-family: Inter, Roboto, Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background: #f5f5f5;
              }
              .receipt-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border-radius: 6px;
                box-shadow: 0 6px 18px rgba(0,0,0,0.08);
                padding: 32px 36px;
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 30px;
              }
              .logo-block {
                display: flex;
                align-items: center;
              }
              .logo-text {
                margin-right: 24px;
              }
              .logo-text div:first-child {
                font-weight: bold;
                font-size: 22px;
              }
              .logo-text div:last-child {
                font-size: 12px;
              }
              .logo-bars {
                display: flex;
              }
              .bar1 {
                width: 8px;
                height: 56px;
                background: #0D6BFF;
                margin-right: 8px;
              }
              .bar2 {
                width: 6px;
                height: 48px;
                background: #6FC3FF;
                margin-top: 4px;
              }
              .title {
                font-size: 36px;
                font-weight: 800;
                color: #153B0E;
                letter-spacing: 0.02em;
              }
              .receipt-info {
                text-align: right;
              }
              .receipt-info div {
                margin-bottom: 8px;
                font-size: 14px;
                font-weight: 600;
              }
              .section-header {
                background: #153B0E;
                height: 28px;
                display: flex;
                align-items: center;
                padding-left: 10px;
                color: white;
                font-size: 14px;
                font-weight: 700;
              }
              .content-box {
                border: 1px solid #E6E6E6;
                min-height: 40px;
                padding: 10px;
                background: white;
                font-size: 15px;
                font-weight: 500;
              }
              .two-column {
                display: flex;
                justify-content: space-between;
                margin-bottom: 24px;
              }
              .column {
                width: 48%;
              }
              .amount-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 24px;
              }
              .amount-received {
                width: 22%;
              }
              .amount-words {
                width: 72%;
              }
              .purpose-section {
                margin-top: 18px;
                margin-bottom: 48px;
              }
              .purpose-content {
                min-height: 48px;
                padding: 12px;
              }
              .signature-area {
                text-align: right;
                margin-top: 40px;
              }
              .signature-box {
                display: inline-block;
                width: 260px;
                text-align: center;
              }
              .signature-line {
                border-top: 1px dashed #333;
                margin-bottom: 8px;
              }
              .signature-text {
                font-size: 13px;
                font-weight: 700;
              }
              .authorized-name {
                font-size: 13px;
                font-weight: 700;
                margin-top: 4px;
              }
              @media print {
                body {
                  background: white;
                  padding: 0;
                }
                .receipt-container {
                  box-shadow: none;
                  padding: 32px 36px;
                }
                .section-header {
                  background: #153B0E !important;
                  color: white !important;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .title {
                  color: #153B0E !important;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .bar1 {
                  background: #0D6BFF !important;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .bar2 {
                  background: #6FC3FF !important;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="header">
                <div class="logo-block">
                  <div class="logo-text">
                    <div>THE WORLD BANK</div>
                    <div>Bangladesh</div>
                  </div>
                  <div class="logo-bars">
                    <div class="bar1"></div>
                    <div class="bar2"></div>
                  </div>
                </div>
                <div class="title">MONEY RECEIPT</div>
                <div class="receipt-info">
                  <div>Receipt Date: ${receipt.date}</div>
                  <div>Receipt No: ${receipt.receiptNo}</div>
                </div>
              </div>
              
              <div class="two-column">
                <div class="column">
                  <div class="section-header">Received From</div>
                  <div class="content-box">${receipt.name}</div>
                </div>
                <div class="column">
                  <div class="section-header">Paid by</div>
                  <div class="content-box">${receipt.paidBy}</div>
                </div>
              </div>
              
              <div class="amount-section">
                <div class="amount-received">
                  <div class="section-header">Amount Received</div>
                  <div class="content-box">Tk ${receipt.amount}</div>
                </div>
                <div class="amount-words">
                  <div class="section-header">Amount in Words</div>
                  <div class="content-box">${receipt.amountInWords}</div>
                </div>
              </div>
              
              <div class="purpose-section">
                <div class="section-header">Purpose of Payment</div>
                <div class="content-box purpose-content">${receipt.purpose}</div>
              </div>
              
              <div class="signature-area">
                <div class="signature-box">
                  <div class="authorized-name">MD. Mahfuz Khandaker</div>
                  <div class="signature-text">Authorized Signature</div>
                  <div class="signature-line"></div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      // Give some time for content to load before printing
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }
  }

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Money Receipt</h1>
          <p className="text-gray-600 mt-2">Generate and manage money receipts</p>
        </div>

        {showReceipt && currentReceipt ? (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[800px] bg-white rounded-lg shadow-lg p-8 mb-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                {/* Logo Block */}
                <div className="flex items-center">
                  <div className="mr-6">
                    <div className="font-bold text-[22px]">THE WORLD BANK</div>
                    <div className="text-[12px]">Bangladesh</div>
                  </div>
                  <div className="flex">
                    <div className="w-[8px] h-[56px] bg-[#0D6BFF] mr-2"></div>
                    <div className="w-[6px] h-[48px] bg-[#6FC3FF] mt-1"></div>
                  </div>
                </div>

                {/* Title */}
                <div className="text-[36px] font-extrabold text-[#153B0E] tracking-[0.02em]">
                  MONEY RECEIPT
                </div>

                {/* Receipt Info */}
                <div className="text-right">
                  <div className="flex items-center mb-2">
                    <span className="text-[14px] font-semibold mr-2">Receipt Date:</span>
                    <span className="text-[14px] font-semibold">{currentReceipt.date}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[14px] font-semibold mr-2">Receipt No:</span>
                    <span className="text-[14px] font-semibold">{currentReceipt.receiptNo}</span>
                  </div>
                </div>
              </div>

              {/* Whitespace */}
              <div className="h-[30px]"></div>

              {/* Received From / Paid By */}
              <div className="flex justify-between mb-6">
                <div className="w-[48%]">
                  <div className="bg-[#153B0E] h-[28px] flex items-center pl-3">
                    <span className="text-white text-[14px] font-bold">Received From</span>
                  </div>
                  <div className="border border-[#E6E6E6] min-h-[40px] p-3 bg-white">
                    {currentReceipt.name}
                  </div>
                </div>
                <div className="w-[48%]">
                  <div className="bg-[#153B0E] h-[28px] flex items-center pl-3">
                    <span className="text-white text-[14px] font-bold">Paid by</span>
                  </div>
                  <div className="border border-[#E6E6E6] min-h-[40px] p-3 bg-white">
                    {currentReceipt.paidBy}
                  </div>
                </div>
              </div>

              {/* Amount Received / Amount in Words */}
              <div className="flex justify-between mb-6">
                <div className="w-[22%]">
                  <div className="bg-[#153B0E] h-[28px] flex items-center pl-3">
                    <span className="text-white text-[14px] font-bold">Amount Received</span>
                  </div>
                  <div className="border border-[#E6E6E6] min-h-[40px] p-3 bg-white">
                    Tk {currentReceipt.amount}
                  </div>
                </div>
                <div className="w-[72%]">
                  <div className="bg-[#153B0E] h-[28px] flex items-center pl-3">
                    <span className="text-white text-[14px] font-bold">Amount in Words</span>
                  </div>
                  <div className="border border-[#E6E6E6] min-h-[40px] p-3 bg-white">
                    {currentReceipt.amountInWords}
                  </div>
                </div>
              </div>

              {/* Purpose of Payment */}
              <div className="mb-12">
                <div className="bg-[#153B0E] h-[28px] flex items-center pl-3 mb-2">
                  <span className="text-white text-[14px] font-bold">Purpose of Payment</span>
                </div>
                <div className="border border-[#E6E6E6] min-h-[48px] p-3 bg-white">
                  {currentReceipt.purpose}
                </div>
              </div>

              {/* Signature */}
              <div className="flex justify-end mt-12">
                <div className="w-[260px]">
                  <div className="text-[13px] font-bold text-center">MD. Mahfuz Khandaker</div>
                  <div className="text-[13px] text-center">Authorized Signature</div>
                  <div className="border-t border-dashed border-gray-800 mt-1"></div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={() => setShowReceipt(false)} 
                variant="outline"
                className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-150"
              >
                Back to Form
              </Button>
              <Button 
                onClick={handlePrint}
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors duration-150"
              >
                Print Receipt
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Generate Receipt Form */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Generate New Receipt</h2>
                <div className="bg-blue-50 px-3 py-1 rounded-full">
                  <span className="text-xs font-semibold text-blue-700">New</span>
                </div>
              </div>
              <form onSubmit={handleGenerateInvoice} className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Recipient Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">Customer Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={recipient.name}
                        onChange={handleRecipientChange}
                        placeholder="Enter customer name"
                        required
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Mobile Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={recipient.phone}
                        onChange={handleRecipientChange}
                        placeholder="Enter mobile number"
                        required
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={recipient.address}
                        onChange={handleRecipientChange}
                        placeholder="Enter address"
                        required
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Receipt Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="purpose" className="text-sm font-medium text-gray-700">Purpose</Label>
                      <Select value={purpose} onValueChange={setPurpose}>
                        <SelectTrigger className="rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Loan Payment">Loan Payment</SelectItem>
                          <SelectItem value="Service Charge">Service Charge</SelectItem>
                          <SelectItem value="Registration Fee">Registration Fee</SelectItem>
                          <SelectItem value="Monthly Installment">Monthly Installment</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="paidBy" className="text-sm font-medium text-gray-700">Paid By</Label>
                      <Select value={paidBy} onValueChange={setPaidBy}>
                        <SelectTrigger className="rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Bkash">Bkash</SelectItem>
                          <SelectItem value="Nagad">Nagad</SelectItem>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount" className="text-sm font-medium text-gray-700">Amount (Tk)</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        value={invoice.amount}
                        onChange={handleInvoiceChange}
                        placeholder="Enter amount"
                        required
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <Label htmlFor="amountInWords" className="text-sm font-medium text-gray-700">In Word</Label>
                      <Input
                        id="amountInWords"
                        value={amountInWords}
                        onChange={(e) => setAmountInWords(e.target.value)}
                        placeholder="Enter amount in words"
                        required
                        className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="receiptNo" className="text-sm font-medium text-gray-700">Receipt No.</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            id="receiptNo"
                            value={receiptNo}
                            onChange={(e) => setReceiptNo(e.target.value)}
                            placeholder="Enter receipt number"
                            disabled={useCloneReceiptNo}
                            className="rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="cloneReceiptNo"
                              checked={useCloneReceiptNo}
                              onChange={(e) => setUseCloneReceiptNo(e.target.checked)}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="cloneReceiptNo" className="ml-2 text-sm text-gray-700">Clone</label>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="date" className="text-sm font-medium text-gray-700">Receipt Date</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            id="date"
                            name="date"
                            type="date"
                            value={invoice.date}
                            onChange={handleInvoiceChange}
                            disabled={useCloneDate}
                            className="rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="cloneDate"
                              checked={useCloneDate}
                              onChange={(e) => setUseCloneDate(e.target.checked)}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="cloneDate" className="ml-2 text-sm text-gray-700">Clone</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-sm font-medium"
                >
                  Generate Receipt
                </Button>
              </form>
            </div>

            {/* Recent Receipts */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Receipts</h2>
              {invoices.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts generated yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Generate your first receipt to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{inv.name}</h3>
                          <p className="text-sm text-gray-500">Amount: Tk {inv.amount}</p>
                          <p className="text-sm text-gray-500">Date: {inv.date}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-blue-600 hover:text-blue-900 border-blue-200 hover:bg-blue-50 transition-colors duration-150"
                            onClick={() => {
                              setCurrentReceipt(inv)
                              setShowReceipt(true)
                            }}
                          >
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-600 hover:text-green-900 border-green-200 hover:bg-green-50 transition-colors duration-150"
                            onClick={() => handlePrintReceipt(inv)}
                          >
                            Print
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}