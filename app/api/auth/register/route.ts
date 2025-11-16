import { connectToDatabase } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { name, phone, password } = await request.json()

    if (!name || !phone || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const loans = db.collection("loans")

    // Check if user already exists
    const existingUser = await loans.findOne({ phone })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with personalInfo including name, phone, and password
    const user = {
      name,
      phone,
      password: hashedPassword,
      createdAt: new Date(),
      status: "pending",
      personalInfo: {
        fullName: name,
        mobileNumber: phone,
        password: hashedPassword, // Store password in personalInfo as requested
      },
      bankInfo: {},
      loanInfo: {},
    }

    const result = await loans.insertOne(user)

    return NextResponse.json(
      {
        message: "User registered successfully",
        userId: result.insertedId.toString(),
        phone: phone,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}