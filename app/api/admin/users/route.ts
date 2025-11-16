import { connectToDatabase } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const admins = db.collection("admins")

    // Project only the fields we want to return, including role
    const allAdmins = await admins.find({}).project({
      name: 1,
      email: 1,
      role: 1,
      createdAt: 1
    }).toArray()

    return NextResponse.json(allAdmins, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, email, role, password } = await request.json()

    if (!id || !name || !email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const admins = db.collection("admins")

    // Check if admin exists
    const existingAdmin = await admins.findOne({ _id: new ObjectId(id) })
    if (!existingAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      role,
      updatedAt: new Date()
    }

    // If password is provided, hash it
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Update admin
    const result = await admins.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Admin updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error updating admin:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing admin ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const admins = db.collection("admins")

    // Delete admin
    const result = await admins.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Admin deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting admin:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}