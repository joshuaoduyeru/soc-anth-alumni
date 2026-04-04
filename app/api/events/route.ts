import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Event, EventRegistration, Notification } from '@/models'
import { Types } from 'mongoose'

/**
 * GET /api/events
 * Fetch all published events, sorted by start date
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { status } = Object.fromEntries(new URL(req.url).searchParams)

    const query: any = {}
    if (status === 'published') query.status = 'published'
    if (status === 'upcoming')
      query.startDate = { $gte: new Date() }

    const events = await Event.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ startDate: 1 })
      .lean()

    return NextResponse.json(
      events.map((event: any) => ({
        id: event._id.toString(),
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        type: event.type,
        location: event.location,
        onlineUrl: event.onlineUrl,
        maxAttendees: event.maxAttendees,
        status: event.status,
        createdBy: event.createdBy,
        coverImageUrl: event.coverImageUrl,
        timezone: event.timezone,
      }))
    )
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/events
 * Create a new event (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const {
      title,
      description,
      startDate,
      endDate,
      type,
      location,
      onlineUrl,
      maxAttendees,
      coverImageUrl,
      timezone,
      createdBy,
    } = await req.json()

    // Validate required fields
    if (!title || !description || !startDate || !endDate || !createdBy) {
      return NextResponse.json(
        {
          error: 'Missing required fields: title, description, startDate, endDate, createdBy',
        },
        { status: 400 }
      )
    }

    // Validate dates
    if (new Date(endDate) <= new Date(startDate)) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    const event = await Event.create({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      type: type || 'Hybrid',
      location: location || null,
      onlineUrl: onlineUrl || null,
      maxAttendees: maxAttendees || null,
      coverImageUrl: coverImageUrl || null,
      timezone: timezone || 'UTC',
      createdBy: new Types.ObjectId(createdBy),
      status: 'draft',
    })

    return NextResponse.json(
      {
        id: event._id.toString(),
        title: event.title,
        status: event.status,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Failed to create event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
