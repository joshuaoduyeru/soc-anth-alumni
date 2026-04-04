import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { User } from '@/models'

/**
 * POST /api/auth/register
 * Register a new alumni user.
 * Accepts plain `password` — the User model's pre-save hook hashes it.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { firstName, lastName, email, password, education } = await req.json()

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, email, password' },
        { status: 400 }
      )
    }

    // Check duplicate
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // passwordHash field — the pre-save hook will bcrypt it
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      passwordHash: password,   // hook hashes this before persisting
      role: 'alumni',
      isActive: true,
      education: education ?? [],
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
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
        isAdmin: false,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration failed:', error)
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
