import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBadgeType {
  _id: string
  name: string
  icon: string
  description: string   // was missing — caused badge.desc errors in components
  category: 'milestone' | 'mentorship' | 'community' | 'events' | 'contribution' | 'award'
}

export interface IBadge extends Document {
  recipient: mongoose.Types.ObjectId
  badgeType: string
  reason?: string
  awardedBy: mongoose.Types.ObjectId
  awardedAt: Date
  isVisible: boolean

  // Timestamps
  createdAt: Date
}

import { BADGE_TYPES } from '@/lib/constants/badges'
export { BADGE_TYPES }

const BadgeSchema = new Schema<IBadge>(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    badgeType: {
      type: String,
      required: [true, 'Badge type is required'],
      enum: BADGE_TYPES.map((bt) => bt.id),
    },
    reason: {
      type: String,
      maxlength: 500,
      default: null,
    },
    awardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin who awarded badge is required'],
    },
    awardedAt: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

// Unique constraint: each user can have each badge type only once
BadgeSchema.index({ recipient: 1, badgeType: 1 }, { unique: true })

export const Badge = (mongoose.models.Badge as Model<IBadge>) || mongoose.model<IBadge>('Badge', BadgeSchema)
