import { connectToDatabase } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customerId = params.id
    
    if (!ObjectId.isValid(customerId)) {
      return NextResponse.json({ error: "Invalid customer ID format" }, { status: 400 })
    }

    const requestData = await request.json()
    
    const { personalInfo, bankInfo } = requestData
    
    const { db } = await connectToDatabase()
    const loans = db.collection("loans")

    const updateFields: Record<string, any> = {
      updatedAt: new Date(),
    }

    // Handle personalInfo
    if (personalInfo !== undefined) {
      // Instead of overwriting the entire personalInfo object, we need to merge it
      // First, get the existing user data
      const existingUser = await loans.findOne({ _id: new ObjectId(customerId) });
      const existingPersonalInfo = existingUser?.personalInfo || {};
      
      // Merge the existing personalInfo with the new data
      const cleanPersonalInfo = { ...existingPersonalInfo, ...personalInfo };
      
      updateFields.personalInfo = cleanPersonalInfo;
    }
    
    // Handle bankInfo
    if (bankInfo !== undefined) {
      // Instead of overwriting the entire bankInfo object, we need to merge it
      // First, get the existing user data
      const existingUser = await loans.findOne({ _id: new ObjectId(customerId) });
      const existingBankInfo = existingUser?.bankInfo || {};
      
      // Merge the existing bankInfo with the new data
      const cleanBankInfo = { ...existingBankInfo, ...bankInfo };
      
      updateFields.bankInfo = cleanBankInfo;
    }

    const result = await loans.updateOne(
      { _id: new ObjectId(customerId) },
      {
        $set: updateFields,
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Customer updated successfully" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}