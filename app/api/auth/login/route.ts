import { connectToDatabase } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json()

    if (!phone || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const loans = db.collection("loans")

    const user = await loans.findOne({ phone })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    return NextResponse.json(
      {
        message: "Login successful",
        userId: user._id.toString(),
        phone: user.phone,
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}