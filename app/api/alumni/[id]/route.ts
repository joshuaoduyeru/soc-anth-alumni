import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { User, Badge, MentorProfile } from '@/models'

/**
 * GET /api/alumni/[id]
 * Get a single alumni user by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params

    const user = await User.findById(id).select('-passwordHash').lean()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role,
      company: user.company,
      jobTitle: user.jobTitle,
      location: user.location,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      education: user.education,
      socialLinks: user.socialLinks,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error('Failed to fetch alumni:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alumni' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/alumni/[id]
 * Update alumni user profile
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params
    const body = await req.json()

    const user = await User.findByIdAndUpdate(id, body, { new: true })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
  } catch (error: any) {
    console.error('Failed to update alumni:', error)
    return NextResponse.json(
      { error: 'Failed to update alumni' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/alumni/[id]
 * Delete alumni user (admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ _id: string }> }
) {
  try {
    await connectDB()

    const { _id } = await params

    const user = await User.findByIdAndDelete(_id)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Clean up related records
    await Promise.all([
      Badge.deleteMany({ recipient: _id }),
      MentorProfile.deleteOne({ user: _id }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete alumni:', error)
    return NextResponse.json(
      { error: 'Failed to delete alumni' },
      { status: 500 }
    )
  }
}
