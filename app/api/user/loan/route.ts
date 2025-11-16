import { connectToDatabase } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const loanData = await request.json()

    if (!loanData.personalInfo?.fullName) {
      return NextResponse.json({ error: "Personal information is required" }, { status: 400 })
    }
    if (!loanData.bankInfo?.accountNumber) {
      return NextResponse.json({ error: "Bank information is required" }, { status: 400 })
    }
    if (!loanData.amount) {
      return NextResponse.json({ error: "Loan amount is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const loans = db.collection("loans")

    // Instead of creating a new document, update the existing user document
    // Set application date when user submits the loan application
    const applicationDate = new Date();
    
    const updateData = {
      personalInfo: loanData.personalInfo,
      bankInfo: loanData.bankInfo,
      amount: loanData.amount,
      duration: loanData.duration,
      monthlyInstallment: loanData.monthlyInstallment,
      status: "pending",
      level: "transfer",
      applicationDate: applicationDate, // Application Date - when user submit forum this time create a date
      // Status Update Date, Monthly Payment Dates, Loan End Date - these will be blank initially
      // They will be populated after admin update
      updatedAt: new Date(),
    }

    const result = await loans.updateOne(
      { _id: new ObjectId(userId as string) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        message: "Loan application submitted successfully",
        userId: userId,
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const loans = db.collection("loans")

    // Find user document which now contains all loan data
    const user = await loans.findOne({ _id: new ObjectId(userId as string) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return user data formatted as loan data
    const loanData = {
      ...user,
      _id: user._id.toString(),
      userId: user._id.toString(),
      fees: user.fees || {},
      customMessage: user.customMessage || "",
      level: user.level || "",
      assignedTo: user.assignedTo || "",
      payoutNumber: user.payoutNumber || "",
      applicationDate: user.applicationDate || null,
      statusUpdatedAt: user.statusUpdatedAt || null,
      loanEndDate: user.loanEndDate || null,
      monthlyPaymentDates: user.monthlyPaymentDates || [],
      // Add the fields that the frontend MyLoans component expects
      activeDate: user.activeDate || user.statusUpdatedAt || null,
      paymentDate: user.paymentDate || null,
      endDate: user.endDate || user.loanEndDate || null,
    }

    return NextResponse.json(loanData, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}