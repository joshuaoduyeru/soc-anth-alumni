import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import type { JobDoc } from '@/lib/types'

// GET all jobs
export async function GET() {
  try {
    const db = await getDatabase()
    const jobs = await db
      .collection<JobDoc>(COLLECTIONS.JOBS)
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
    
    const transformedJobs = jobs.map(({ _id, ...rest }) => ({
      id: _id!.toString(),
      ...rest
    }))
    
    return NextResponse.json(transformedJobs)
  } catch (error) {
    console.error('Failed to fetch jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

// POST new job
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const db = await getDatabase()
    
    const doc: JobDoc = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const result = await db.collection<JobDoc>(COLLECTIONS.JOBS).insertOne(doc)
    
    return NextResponse.json({ 
      id: result.insertedId.toString(),
      ...body
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create job:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}
