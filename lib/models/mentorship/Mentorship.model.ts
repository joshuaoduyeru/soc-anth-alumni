import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMentorProfile extends Document {
  // Link to User (one-to-one)
  user: mongoose.Types.ObjectId

  // Expertise
  expertise: string
  expertiseTags: string[]
  industry?: string
  yearsOfExperience: number

  // Availability
  availability: 'Weekly' | 'Bi-weekly' | 'Monthly'
  isAcceptingRequests: boolean

  // About
  bio?: string

  // Stats (denormalized for fast reads)
  totalRequests: number
  activeConnections: number

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

export interface IMentorshipRequest extends Document {
  mentor: mongoose.Types.ObjectId
  mentee: mongoose.Types.ObjectId
  message: string
  goals: string

  // Status
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled'
  respondedAt?: Date
  completedAt?: Date

  // Admin notes
  mentorNotes?: string

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

const MentorProfileSchema = new Schema<IMentorProfile>(
  {
    // Link to User (one-to-one)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // Expertise
    expertise: {
      type: String,
      required: [true, 'Expertise area is required'],
    },
    expertiseTags: [
      {
        type: String,
      },
    ],
    industry: {
      type: String,
      default: null,
    },
    yearsOfExperience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: 0,
    },

    // Availability
    availability: {
      type: String,
      enum: ['Weekly', 'Bi-weekly', 'Monthly'],
      default: 'Monthly',
    },
    isAcceptingRequests: {
      type: Boolean,
      default: false,
    },

    // About
    bio: {
      type: String,
      maxlength: 1000,
      default: null,
    },

    // Stats (denormalized for fast reads)
    totalRequests: {
      type: Number,
      default: 0,
    },
    activeConnections: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
MentorProfileSchema.index({ user: 1 })

const MentorshipRequestSchema = new Schema<IMentorshipRequest>(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MentorProfile',
      required: true,
      index: true,
    },
    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    goals: {
      type: String,
      required: [true, 'Goals are required'],
    },

    // Status
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
      default: 'pending',
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },

    // Admin notes
    mentorNotes: {
      type: String,
      select: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Unique constraint: one open request per mentee to same mentor
MentorshipRequestSchema.index(
  { mentor: 1, mentee: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'accepted'] } },
  }
)

export const MentorProfile =
  (mongoose.models.MentorProfile as Model<IMentorProfile>) ||
  mongoose.model<IMentorProfile>('MentorProfile', MentorProfileSchema)

export const MentorshipRequest =
  (mongoose.models.MentorshipRequest as Model<IMentorshipRequest>) ||
  mongoose.model<IMentorshipRequest>('MentorshipRequest', MentorshipRequestSchema)
