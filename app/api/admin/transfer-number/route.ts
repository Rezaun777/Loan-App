import { connectToDatabase } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { withAdminAuth } from "@/lib/admin-middleware"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const settings = db.collection("settings")

    // Get the transfer text setting
    const setting = await settings.findOne({ key: "transferText" })
    
    return NextResponse.json({
      transferText: setting?.value || "বিকাশ সেন্ড মানি: 01700-000000"
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if admin has required role (administrator for this sensitive operation)
    const authResponse = await withAdminAuth(request, "administrator")
    if (authResponse) {
      return authResponse // Return the error response if not authorized
    }

    const { transferText } = await request.json()

    if (!transferText) {
      return NextResponse.json({ error: "Transfer text is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const settings = db.collection("settings")

    // Update or create the transfer text setting
    await settings.updateOne(
      { key: "transferText" },
      { $set: { value: transferText, updatedAt: new Date() } },
      { upsert: true }
    )

    return NextResponse.json({ message: "Transfer text updated successfully" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}