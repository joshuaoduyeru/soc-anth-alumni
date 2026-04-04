import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Badge, BADGE_TYPES, Notification, AuditLog } from '@/models'
import { Types } from 'mongoose'

/**
 * GET /api/badges
 * Fetch all available badge types and user badges
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { userId } = Object.fromEntries(new URL(req.url).searchParams)

    if (!userId) {
      // Return all badge types
      return NextResponse.json({
        types: BADGE_TYPES,
      })
    }

    // Get user's badges
    const userBadges = await Badge.find({ recipient: userId })
      .populate('awardedBy', 'firstName lastName')
      .sort({ awardedAt: -1 })
      .lean()

    return NextResponse.json(
      userBadges.map((badge: any) => ({
        id: badge._id.toString(),
        badgeType: badge.badgeType,
        reason: badge.reason,
        awardedAt: badge.awardedAt,
        awardedBy: badge.awardedBy,
        isVisible: badge.isVisible,
      }))
    )
  } catch (error) {
    console.error('Failed to fetch badges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/badges
 * Award a badge to a user (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { recipientId, badgeType, reason, awardedBy } = await req.json()

    // Validate required fields
    if (!recipientId || !badgeType || !awardedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: recipientId, badgeType, awardedBy' },
        { status: 400 }
      )
    }

    // Validate badge type
    const validBadgeType = BADGE_TYPES.find((t) => t.id === badgeType)
    if (!validBadgeType) {
      return NextResponse.json(
        { error: 'Invalid badge type' },
        { status: 400 }
      )
    }

    try {
      const badge = await Badge.create({
        recipient: new Types.ObjectId(recipientId),
        badgeType,
        reason: reason || null,
        awardedBy: new Types.ObjectId(awardedBy),
        awardedAt: new Date(),
        isVisible: true,
      })

      // Create notification
      await Notification.create({
        user: new Types.ObjectId(recipientId),
        title: 'Badge Awarded!',
        message: `You earned the "${validBadgeType.name}" badge!`,
        type: 'badge_awarded',
        relatedModel: 'Badge',
        relatedId: badge._id,
        isRead: false,
      }).catch(console.error)

      // Log audit
      await AuditLog.create({
        actor: new Types.ObjectId(awardedBy),
        actorRole: 'admin',
        action: 'badge.awarded',
        targetModel: 'Badge',
        targetId: badge._id,
        newState: {
          badgeType: badge.badgeType,
          recipient: recipientId,
        },
      }).catch(console.error)

      return NextResponse.json(
        {
          id: badge._id.toString(),
          badgeType: badge.badgeType,
          awardedAt: badge.awardedAt,
        },
        { status: 201 }
      )
    } catch (error: any) {
      if (error.code === 11000) {
        return NextResponse.json(
          { error: 'User already has this badge' },
          { status: 409 }
        )
      }
      throw error
    }
  } catch (error: any) {
    console.error('Failed to award badge:', error)
    return NextResponse.json(
      { error: 'Failed to award badge' },
      { status: 500 }
    )
  }
