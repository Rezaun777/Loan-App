import { connectToDatabase } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { customerId, email, password } = await request.json()

    if (!customerId || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(customerId)) {
      return NextResponse.json({ error: "Invalid customer ID format" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const loans = db.collection("loans")

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update customer's email and password
    const result = await loans.updateOne(
      { _id: new ObjectId(customerId) },
      {
        $set: {
          phone: email, // Using email as phone for login
          password: hashedPassword,
          "personalInfo.email": email,
          "personalInfo.mobileNumber": email,
          "personalInfo.password": hashedPassword,
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Password and email updated successfully" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}