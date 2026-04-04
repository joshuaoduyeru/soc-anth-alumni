import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBadgeType {
  id: string
  name: string
  icon: string
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

export const BADGE_TYPES: IBadgeType[] = [
  { id: 'pioneer', name: 'Pioneer', icon: '🚀', category: 'milestone' },
  { id: 'super_mentor', name: 'Super Mentor', icon: '👨‍🏫', category: 'mentorship' },
  { id: 'network_champion', name: 'Network Champion', icon: '🤝', category: 'community' },
  { id: 'distinguished_speaker', name: 'Distinguished Speaker', icon: '🎤', category: 'events' },
  { id: 'generous_donor', name: 'Generous Donor', icon: '💰', category: 'contribution' },
  { id: 'active_volunteer', name: 'Active Volunteer', icon: '🙋', category: 'contribution' },
  { id: 'career_achiever', name: 'Career Achiever', icon: '📈', category: 'milestone' },
  { id: 'top_recruiter', name: 'Top Recruiter', icon: '👔', category: 'contribution' },
  { id: 'alumni_of_the_year', name: 'Alumni of the Year', icon: '🎓', category: 'award' },
]

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
