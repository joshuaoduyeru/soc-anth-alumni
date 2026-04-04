import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { User, AuditLog } from '@/models'
import { Types } from 'mongoose'

/**
 * GET /api/admin
 * 
 * Query Parameters:
 *   - userId: Check if specific user is admin
 * 
 * Returns: List of admins or admin status for a user
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (userId) {
      // Check if specific user is admin
      try {
        const user = await User.findById(userId).select(
          'email firstName lastName role isAdmin'
        )

        if (!user) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          userId: user._id.toString(),
          isAdmin: user.role === 'admin',
          email: user.email,
          name: user.fullName,
        })
      } catch (err: any) {
        return NextResponse.json(
          { error: 'Invalid user ID format' },
          { status: 400 }
        )
      }
    }

    // Get all admins
    const admins = await User.find({ role: 'admin' })
      .select('firstName lastName email role createdAt')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(
      admins.map((admin: any) => ({
        _id: admin._id.toString(),
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
      }))
    )
  } catch (error) {
    console.error('Failed to fetch admin info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin info' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin
 * 
 * Request Body:
 *   - userId (required): ID of user to promote to admin
 * 
 * Returns: Success message or error
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { userId, adminId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // User is already admin
    if (user.role === 'admin') {
      return NextResponse.json(
        { error: 'User is already an admin' },
        { status: 409 }
      )
    }

    // Update user role
    user.role = 'admin'
    await user.save()

    // Log audit
    await AuditLog.create({
      actor: adminId ? new Types.ObjectId(adminId) : null,
      actorRole: 'admin',
      action: 'user.promoted_to_admin',
      targetModel: 'User',
      targetId: user._id,
      newState: {
        role: 'admin',
        _id: user._id.toString(),
      },
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'User promoted to admin',
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.fullName,
        role: user.role,
      },
    })
  } catch (error: any) {
    console.error('Failed to promote user:', error)
    return NextResponse.json(
      { error: 'Failed to promote user' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin
 * 
 * Query Parameters:
 *   - userId (required): ID of admin user to demote
 * 
 * Returns: Success message or error
 */
export async function DELETE(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const adminId = searchParams.get('adminId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // User is not an admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'User is not an admin' },
        { status: 409 }
      )
    }

    // Remove admin privileges
    user.role = 'alumni'
    await user.save()

    // Log audit
    await AuditLog.create({
      actor: adminId ? new Types.ObjectId(adminId) : null,
      actorRole: 'admin',
      action: 'user.demoted_from_admin',
      targetModel: 'User',
      targetId: user._id,
      newState: {
        role: 'alumni',
        _id: user._id.toString(),
      },
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Admin privileges removed',
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.fullName,
        role: user.role,
      },
    })
  } catch (error: any) {
    console.error('Failed to remove admin privileges:', error)
    return NextResponse.json(
      { error: 'Failed to remove admin privileges' },
      { status: 500 }
    )
  }
}
