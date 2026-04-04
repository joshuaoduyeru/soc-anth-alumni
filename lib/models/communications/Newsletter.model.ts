import mongoose, { Schema, Document, Model } from 'mongoose'

export interface INewsletter extends Document {
  // Content
  subject: string
  body: string
  preview?: string

  // Targeting
  recipientGroup: 'all' | 'recent_graduates' | 'mentors' | 'bachelors' | 'masters' | 'phd'

  // Delivery Stats
  recipientCount: number
  deliveredCount: number
  openedCount: number
  clickedCount: number

  // Status
  status: 'draft' | 'queued' | 'sending' | 'sent' | 'failed'
  sentAt?: Date
  scheduledFor?: Date

  // Authorship
  createdBy: mongoose.Types.ObjectId

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

const NewsletterSchema = new Schema<INewsletter>(
  {
    // Content
    subject: {
      type: String,
      required: [true, 'Newsletter subject is required'],
    },
    body: {
      type: String,
      required: [true, 'Newsletter body is required'],
    },
    preview: {
      type: String,
      default: null,
    },

    // Targeting
    recipientGroup: {
      type: String,
      enum: ['all', 'recent_graduates', 'mentors', 'bachelors', 'masters', 'phd'],
      default: 'all',
    },

    // Delivery Stats
    recipientCount: {
      type: Number,
      default: 0,
    },
    deliveredCount: {
      type: Number,
      default: 0,
    },
    openedCount: {
      type: Number,
      default: 0,
    },
    clickedCount: {
      type: Number,
      default: 0,
    },

    // Status
    status: {
      type: String,
      enum: ['draft', 'queued', 'sending', 'sent', 'failed'],
      default: 'draft',
    },
    sentAt: {
      type: Date,
      default: null,
      index: true,
    },
    scheduledFor: {
      type: Date,
      default: null,
    },

    // Authorship
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
NewsletterSchema.index({ sentAt: 1 })

export default (mongoose.models.Newsletter as Model<INewsletter>) ||
  mongoose.model<INewsletter>('Newsletter', NewsletterSchema)
