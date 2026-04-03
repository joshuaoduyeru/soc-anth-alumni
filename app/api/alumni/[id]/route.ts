import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import type { AlumniDoc } from '@/lib/types'

// GET single alumni
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDatabase()
    
    const alumni = await db
      .collection<AlumniDoc>(COLLECTIONS.ALUMNI)
      .findOne({ _id: new ObjectId(id) })
    
    if (!alumni) {
      return NextResponse.json({ error: 'Alumni not found' }, { status: 404 })
    }
    
    const { _id, password, ...rest } = alumni
    return NextResponse.json({ id: _id!.toString(), ...rest })
  } catch (error) {
    console.error('Failed to fetch alumni:', error)
    return NextResponse.json({ error: 'Failed to fetch alumni' }, { status: 500 })
  }
}

// PUT update alumni
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const db = await getDatabase()
    
    const { password, ...updateData } = body
    
    const result = await db
      .collection<AlumniDoc>(COLLECTIONS.ALUMNI)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date() } }
      )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Alumni not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update alumni:', error)
    return NextResponse.json({ error: 'Failed to update alumni' }, { status: 500 })
  }
}

// DELETE alumni
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDatabase()
    
    const result = await db
      .collection<AlumniDoc>(COLLECTIONS.ALUMNI)
      .deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Alumni not found' }, { status: 404 })
    }
    
    // Also delete related records
    await Promise.all([
      db.collection(COLLECTIONS.BADGES).deleteMany({ alumniId: id }),
      db.collection(COLLECTIONS.MENTORS).deleteMany({ alumniId: id }),
    ])
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete alumni:', error)
    return NextResponse.json({ error: 'Failed to delete alumni' }, { status: 500 })
  }
}
