import { connectToDatabase } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, adminId, role } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if requesting admin exists
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const admins = db.collection("admins")

    // Check if email already exists
    const existingAdmin = await admins.findOne({ email })
    if (existingAdmin) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new admin with role (default to "admin" if not specified)
    const adminRole = role && (role === "administrator" || role === "admin") ? role : "admin"

    // Create new admin
    const result = await admins.insertOne({
      name,
      email,
      password: hashedPassword,
      role: adminRole,
      createdAt: new Date(),
    })

    return NextResponse.json(
      {
        message: "Admin created successfully",
        adminId: result.insertedId,
        role: adminRole,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}