import { connectToDatabase } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()

    const result = await db.collection("bankAccounts").insertOne({
      ...body,
      createdAt: new Date(body.createdAt),
    })

    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save bank account" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const data = await db.collection("bankAccounts").find({}).sort({ createdAt: -1 }).toArray()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bank accounts" }, { status: 500 })
  }
}
