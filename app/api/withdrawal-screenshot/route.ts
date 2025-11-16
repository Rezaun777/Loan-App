import { connectToDatabase } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { screenshotUrl } = await request.json()

    if (!screenshotUrl) {
      return NextResponse.json({ error: "Screenshot URL is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const withdrawals = db.collection("withdrawals")

    // Create a new withdrawal record
    const withdrawalRecord = {
      userId: new ObjectId(userId as string),
      screenshotUrl,
      createdAt: new Date(),
      status: "pending"
    }

    const result = await withdrawals.insertOne(withdrawalRecord)

    return NextResponse.json(
      {
        message: "Screenshot saved successfully",
        withdrawalId: result.insertedId,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error saving withdrawal screenshot:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}