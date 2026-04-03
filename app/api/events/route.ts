import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import type { EventDoc } from '@/lib/types'

// GET all events
export async function GET() {
  try {
    const db = await getDatabase()
    const events = await db
      .collection<EventDoc>(COLLECTIONS.EVENTS)
      .find({})
      .sort({ date: 1 })
      .toArray()
    
    const transformedEvents = events.map(({ _id, ...rest }) => ({
      id: _id!.toString(),
      ...rest
    }))
    
    return NextResponse.json(transformedEvents)
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

// POST new event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const db = await getDatabase()
    
    const doc: EventDoc = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const result = await db.collection<EventDoc>(COLLECTIONS.EVENTS).insertOne(doc)
    
    return NextResponse.json({ 
      id: result.insertedId.toString(),
      ...body
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
