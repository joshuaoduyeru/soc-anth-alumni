import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("oau-san")
    const badges = await db.collection("badges").find({}).toArray()
    return NextResponse.json(badges)
  } catch (error) {
    console.error("Failed to fetch badges:", error)
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("oau-san")
    const data = await request.json()
    
    const badge = {
      ...data,
      _id: new ObjectId(),
      createdAt: new Date().toISOString(),
    }
    
    await db.collection("badges").insertOne(badge)
    return NextResponse.json(badge, { status: 201 })
  } catch (error) {
    console.error("Failed to create badge:", error)
    return NextResponse.json({ error: "Failed to create badge" }, { status: 500 })
  }
}
