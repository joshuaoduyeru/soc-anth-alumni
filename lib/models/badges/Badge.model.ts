import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBadgeType {
  id: string
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

export const BADGE_TYPES: IBadgeType[] = [
  { id: 'pioneer',               name: 'Pioneer',               icon: '🚀', description: 'First to register on the platform',             category: 'milestone'    },
  { id: 'super_mentor',          name: 'Super Mentor',          icon: '👨‍🏫', description: 'Demonstrated active and impactful mentorship',   category: 'mentorship'   },
  { id: 'network_champion',      name: 'Network Champion',      icon: '🤝', description: 'Most connections within the alumni network',      category: 'community'    },
  { id: 'distinguished_speaker', name: 'Distinguished Speaker', icon: '🎤', description: 'Presented at an alumni event',                   category: 'events'       },
  { id: 'generous_donor',        name: 'Generous Donor',        icon: '💰', description: 'Made a financial contribution to the institution', category: 'contribution' },
  { id: 'active_volunteer',      name: 'Active Volunteer',      icon: '🙋', description: 'Actively participated in volunteering activities', category: 'contribution' },
  { id: 'career_achiever',       name: 'Career Achiever',       icon: '📈', description: 'Reached a significant career milestone',          category: 'milestone'    },
  { id: 'top_recruiter',         name: 'Top Recruiter',         icon: '👔', description: 'Posted multiple job opportunities for the community', category: 'contribution' },
  { id: 'alumni_of_the_year',    name: 'Alumni of the Year',    icon: '🎓', description: 'Recognised as Alumni of the Year',               category: 'award'        },
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
