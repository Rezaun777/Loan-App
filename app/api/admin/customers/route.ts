import { connectToDatabase } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const loans = db.collection("loans")

    const allUsers = await loans.find({}).toArray()
    
    // Format the data and add applicationDate field
    const formattedUsers = allUsers.map(user => ({
      ...user,
      _id: user._id.toString(),
      applicationDate: user.applicationDate || user.createdAt || null
    }))
    
    return NextResponse.json(formattedUsers, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { customerId } = await request.json()

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const loans = db.collection("loans")

    // Delete customer and all related loans
    await loans.deleteOne({ _id: new ObjectId(customerId as string) })
    await loans.deleteMany({ userId: new ObjectId(customerId as string) })

    return NextResponse.json({ message: "Customer deleted" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}