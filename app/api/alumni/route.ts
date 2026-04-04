import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { User } from '@/models'

/**
 * GET /api/alumni
 * Fetch all alumni users
 */
export async function GET() {
  try {
    await connectDB()

    const alumni = await User.find({ role: 'alumni' })
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(
      alumni.map((user: any) => ({
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
        isActive: user.isActive,
        avatarUrl: user.avatarUrl,
        jobTitle: user.jobTitle,
        company: user.company,
        location: user.location,
        bio: user.bio,
        education: user.education,
        createdAt: user.createdAt,
      }))
    )
  } catch (error) {
    console.error('Failed to fetch alumni:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alumni' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/alumni
 * Register a new alumni user
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const {
      firstName,
      lastName,
      email,
      passwordHash,
      jobTitle,
      company,
      location,
      bio,
      education,
    } = await req.json()

    // Validate required fields
    if (!firstName || !lastName || !email || !passwordHash) {
      return NextResponse.json(
        {
          error: 'Missing required fields: firstName, lastName, email, passwordHash',
        },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      passwordHash,
      role: 'alumni',
      isActive: true,
      jobTitle: jobTitle || null,
      company: company || null,
      location: location || null,
      bio: bio || null,
      education: education || [],
      notificationPreferences: {
        emailOnEvent: true,
        emailOnJobPost: true,
        emailOnMentorship: true,
        emailOnNewsletter: true,
        emailOnBadge: true,
      },
    })

    return NextResponse.json(
      {
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Failed to create alumni:', error)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create alumni' },
      { status: 500 }
    )
  }
}
