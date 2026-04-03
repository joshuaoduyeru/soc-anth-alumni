import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("oau-san")
    const mentorships = await db.collection("mentorships").find({}).toArray()
    return NextResponse.json(mentorships)
  } catch (error) {
    console.error("Failed to fetch mentorships:", error)
    return NextResponse.json({ error: "Failed to fetch mentorships" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("oau-san")
    const data = await request.json()
    
    const mentorship = {
      ...data,
      _id: new ObjectId(),
      createdAt: new Date().toISOString(),
    }
    
    await db.collection("mentorships").insertOne(mentorship)
    return NextResponse.json(mentorship, { status: 201 })
  } catch (error) {
    console.error("Failed to create mentorship:", error)
    return NextResponse.json({ error: "Failed to create mentorship" }, { status: 500 })
  }
}
