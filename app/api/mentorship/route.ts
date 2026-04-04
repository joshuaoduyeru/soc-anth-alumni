import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { MentorProfile, MentorshipRequest, Notification, AuditLog } from '@/models'
import { Types } from 'mongoose'

/**
 * GET /api/mentorship
 * Fetch mentor profiles or mentorship requests
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { type, userId, status } = Object.fromEntries(
      new URL(req.url).searchParams
    )

    if (type === 'mentor-profiles') {
      // Fetch available mentors
      const mentors = await MentorProfile.find({ isAcceptingRequests: true })
        .populate('user', 'firstName lastName email avatarUrl bio company')
        .sort({ activeConnections: -1 })
        .lean()

      return NextResponse.json(
        mentors.map((mentor: any) => ({
          _id: mentor._id.toString(),
          user: mentor.user,
          expertise: mentor.expertise,
          expertiseTags: mentor.expertiseTags,
          industry: mentor.industry,
          yearsOfExperience: mentor.yearsOfExperience,
          availability: mentor.availability,
          activeConnections: mentor.activeConnections,
        }))
      )
    }

    if (type === 'requests') {
      // Fetch mentorship requests for a user
      if (!userId) {
        return NextResponse.json(
          { error: 'userId required for requests' },
          { status: 400 }
        )
      }

      const query: any = {}
      if (status) query.status = status

      const requests = await MentorshipRequest.find({
        $or: [{ mentor: userId }, { mentee: userId }],
        ...query,
      })
        .populate('mentor', 'firstName lastName email')
        .populate('mentee', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .lean()

      return NextResponse.json(
        requests.map((req: any) => ({
          _id: req._id.toString(),
          mentor: req.mentor,
          mentee: req.mentee,
          message: req.message,
          status: req.status,
          createdAt: req.createdAt,
          respondedAt: req.respondedAt,
        }))
      )
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (error) {
    console.error('Failed to fetch mentorship:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mentorship' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/mentorship
 * Create a mentorship request or mentor profile
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { type, menteeId, mentorId, message, goals } = body

    if (type === 'request') {
      // Create mentorship request
      if (!menteeId || !mentorId || !message) {
        return NextResponse.json(
          { error: 'Missing required fields: menteeId, mentorId, message' },
          { status: 400 }
        )
      }

      const request = await MentorshipRequest.create({
        mentor: new Types.ObjectId(mentorId),
        mentee: new Types.ObjectId(menteeId),
        message,
        goals: goals || '',
        status: 'pending',
      })

      // Create notification for mentor
      await Notification.create({
        user: new Types.ObjectId(mentorId),
        title: 'New Mentorship Request',
        message: 'Someone has requested to be mentored by you',
        type: 'mentorship_request',
        relatedModel: 'MentorshipRequest',
        relatedId: request._id,
        isRead: false,
      }).catch(console.error)

      return NextResponse.json(
        {
          _id: request._id.toString(),
          status: request.status,
          createdAt: request.createdAt,
        },
        { status: 201 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid type parameter' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Failed to create mentorship:', error)
    return NextResponse.json(
      { error: 'Failed to create mentorship' },
      { status: 500 }
    )
  }
}
