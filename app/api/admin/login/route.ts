import { connectToDatabase } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const admins = db.collection("admins")

    const admin = await admins.findOne({ email })
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const validPassword = await bcrypt.compare(password, admin.password)
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if admin has a role, default to "admin" if not set
    const role = admin.role || "admin"

    return NextResponse.json(
      {
        message: "Login successful",
        adminId: admin._id,
        email: admin.email,
        name: admin.name,
        role: role,
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}