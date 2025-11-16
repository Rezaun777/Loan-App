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

// Add GET method to fetch all withdrawal screenshots for a user
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const withdrawals = db.collection("withdrawals")

    // Find all withdrawal screenshots for the user, sorted by creation date (newest first)
    const screenshots = await withdrawals
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray()

    // Format the data
    const formattedScreenshots = screenshots.map(screenshot => ({
      ...screenshot,
      _id: screenshot._id.toString(),
      userId: screenshot.userId.toString(),
      createdAt: screenshot.createdAt.toISOString()
    }))

    return NextResponse.json(formattedScreenshots, { status: 200 })
  } catch (error) {
    console.error("Error fetching withdrawal screenshots:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
