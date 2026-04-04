import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IJob extends Document {
  // Core
  title: string
  company: string
  description: string

  // Location & Type
  location: string
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  remote: 'On-site' | 'Remote' | 'Hybrid'

  // Compensation
  salaryRange?: string
  currency: string

  // Industry & Tags
  industry: string
  tags: string[]

  // Application
  applicationUrl?: string
  applicationEmail?: string
  applicationDeadline?: Date

  // Status
  status: 'active' | 'closed' | 'draft'
  expiresAt: Date

  // Meta
  postedBy: mongoose.Types.ObjectId
  viewCount: number

  // Timestamps
  createdAt: Date
  updatedAt: Date

  // Virtuals
  isExpired?: boolean
  daysUntilExpiration?: number
}

const JobSchema = new Schema<IJob>(
  {
    // Core
    title: {
      type: String,
      required: [true, 'Job title is required'],
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },

    // Location & Type
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      required: [true, 'Job type is required'],
    },
    remote: {
      type: String,
      enum: ['On-site', 'Remote', 'Hybrid'],
      default: 'Hybrid',
    },

    // Compensation
    salaryRange: {
      type: String,
      default: null,
    },
    currency: {
      type: String,
      default: 'USD',
    },

    // Industry & Tags
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      index: true,
    },
    tags: [
      {
        type: String,
      },
    ],

    // Application
    applicationUrl: {
      type: String,
      default: null,
    },
    applicationEmail: {
      type: String,
      default: null,
    },
    applicationDeadline: {
      type: Date,
      default: null,
    },

    // Status
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      index: true,
    },

    // Meta
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
JobSchema.index({ expiresAt: 1 })
JobSchema.index({ company: 1 })

// Virtuals
JobSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiresAt
})

JobSchema.virtual('daysUntilExpiration').get(function () {
  const now = new Date()
  const diff = this.expiresAt.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

// Middleware to auto-close expired jobs
JobSchema.pre('find', function () {
  this.where('status').ne('closed').where('expiresAt').exists(true)
})

export default (mongoose.models.Job as Model<IJob>) || mongoose.model<IJob>('Job', JobSchema)
