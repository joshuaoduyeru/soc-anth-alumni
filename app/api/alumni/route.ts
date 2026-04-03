import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import type { AlumniDoc } from '@/lib/types'

// GET all alumni
export async function GET() {
  try {
    const db = await getDatabase()
    const alumni = await db
      .collection<AlumniDoc>(COLLECTIONS.ALUMNI)
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
    
    // Transform _id to id for frontend
    const transformedAlumni = alumni.map(({ _id, password, ...rest }) => ({
      id: _id!.toString(),
      ...rest
    }))
    
    return NextResponse.json(transformedAlumni)
  } catch (error) {
    console.error('Failed to fetch alumni:', error)
    return NextResponse.json({ error: 'Failed to fetch alumni' }, { status: 500 })
  }
}

// POST new alumni (registration)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, password, year, degree, major, ...rest } = body
    
    const db = await getDatabase()
    
    // Check if email exists
    const existing = await db
      .collection<AlumniDoc>(COLLECTIONS.ALUMNI)
      .findOne({ email: email.toLowerCase() })
    
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }
    
    // Hash password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined
    
    const doc: AlumniDoc = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      year,
      degree,
      major,
      role: 'alumni',
      ...rest,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const result = await db.collection<AlumniDoc>(COLLECTIONS.ALUMNI).insertOne(doc)
    
    return NextResponse.json({ 
      id: result.insertedId.toString(),
      firstName,
      lastName,
      email: email.toLowerCase(),
      year,
      degree,
      major,
      role: 'alumni',
      ...rest
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create alumni:', error)
    return NextResponse.json({ error: 'Failed to create alumni' }, { status: 500 })
  }
}
