import { connectToDatabase } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const loans = db.collection("loans")

    const user = await loans.findOne({ _id: new ObjectId(userId as string) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    const requestData = await request.json()
    
    const { personalInfo, bankInfo, loanSelection, immigrationLoan } = requestData
    
    const { db } = await connectToDatabase()
    const loans = db.collection("loans")

    const userIdObj = new ObjectId(userId as string);

    const updateFields: Record<string, any> = {
      updatedAt: new Date(),
    }

    // Handle personalInfo
    if (personalInfo !== undefined) {
      // Instead of overwriting the entire personalInfo object, we need to merge it
      // First, get the existing user data
      const existingUser = await loans.findOne({ _id: userIdObj });
      const existingPersonalInfo = existingUser?.personalInfo || {};
      
      // If we're updating the entire personalInfo object (not just a field), we should merge carefully
      // Check if we're sending a complete personalInfo object or just specific fields
      const isPartialUpdate = Object.keys(personalInfo).length < Object.keys(existingPersonalInfo).length;
      
      let cleanPersonalInfo: Record<string, any> = {};
      
      if (isPartialUpdate) {
        // This is a partial update, merge with existing data
        cleanPersonalInfo = { ...existingPersonalInfo };
        Object.keys(personalInfo).forEach(key => {
          if (personalInfo[key] !== undefined) {
            cleanPersonalInfo[key] = personalInfo[key];
          }
        });
      } else {
        // This is a full update, but still preserve existing fields that aren't being updated
        cleanPersonalInfo = { ...existingPersonalInfo, ...personalInfo };
      }
      
      updateFields.personalInfo = cleanPersonalInfo;
    }
    
    // Handle bankInfo
    if (bankInfo !== undefined) {
      // Instead of overwriting the entire bankInfo object, we need to merge it
      // First, get the existing user data
      const existingUser = await loans.findOne({ _id: userIdObj });
      const existingBankInfo = existingUser?.bankInfo || {};
      
      // If we're updating the entire bankInfo object (not just a field), we should merge carefully
      // Check if we're sending a complete bankInfo object or just specific fields
      const isPartialUpdate = Object.keys(bankInfo).length < Object.keys(existingBankInfo).length;
      
      let cleanBankInfo: Record<string, any> = {};
      
      if (isPartialUpdate) {
        // This is a partial update, merge with existing data
        cleanBankInfo = { ...existingBankInfo };
        Object.keys(bankInfo).forEach(key => {
          if (bankInfo[key] !== undefined) {
            cleanBankInfo[key] = bankInfo[key];
          }
        });
      } else {
        // This is a full update, but still preserve existing fields that aren't being updated
        cleanBankInfo = { ...existingBankInfo, ...bankInfo };
      }
      
      updateFields.bankInfo = cleanBankInfo;
    }
    
    if (loanSelection !== undefined) {
      updateFields.loanSelection = loanSelection;
    }
    if (immigrationLoan !== undefined) {
      updateFields.immigrationLoan = immigrationLoan;
    }

    // Let's also check if the user exists before updating
    const userExists = await loans.findOne({ _id: userIdObj });
    if (userExists) {
    }

    const result = await loans.updateOne(
      { _id: userIdObj },
      {
        $set: updateFields,
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (result.modifiedCount === 0) {
      // Let's check what the current data looks like
      const userAfterUpdate = await loans.findOne({ _id: userIdObj });
      if (userAfterUpdate) {
      }
    }

    return NextResponse.json({ message: "Profile updated" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}