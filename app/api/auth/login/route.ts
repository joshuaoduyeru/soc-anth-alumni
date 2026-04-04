import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { User } from '@/models'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+passwordHash'
    )

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 401 }
      )
    }

    // Compare password
    const validPassword = await user.comparePassword(password)
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Update last login
    user.lastLoginAt = new Date()
    user.loginCount = (user.loginCount || 0) + 1
    await user.save()

    return NextResponse.json({
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      isAdmin: user.role === 'admin',
      avatarUrl: user.avatarUrl,
      company: user.company,
      jobTitle: user.jobTitle,
    })
  } catch (error) {
    console.error('Login failed:', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}
