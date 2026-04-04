import mongoose, { Schema, Document, Model } from 'mongoose'

export interface INotification extends Document {
  user: mongoose.Types.ObjectId

  // Content
  title: string
  message: string

  // Type
  type:
    | 'event_registration'
    | 'event_reminder'
    | 'event_cancelled'
    | 'job_posted'
    | 'mentorship_request'
    | 'mentorship_accepted'
    | 'mentorship_declined'
    | 'badge_awarded'
    | 'newsletter'
    | 'system'
    | 'admin_message'

  // Linked Entity (generic reference)
  relatedModel?: 'Event' | 'Job' | 'MentorshipRequest' | 'Badge' | 'Newsletter' | null
  relatedId?: mongoose.Types.ObjectId

  // State
  isRead: boolean
  readAt?: Date

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Content
    title: {
      type: String,
      required: [true, 'Notification title is required'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
    },

    // Type
    type: {
      type: String,
      enum: [
        'event_registration',
        'event_reminder',
        'event_cancelled',
        'job_posted',
        'mentorship_request',
        'mentorship_accepted',
        'mentorship_declined',
        'badge_awarded',
        'newsletter',
        'system',
        'admin_message',
      ],
      required: [true, 'Notification type is required'],
    },

    // Linked Entity (generic reference)
    relatedModel: {
      type: String,
      enum: ['Event', 'Job', 'MentorshipRequest', 'Badge', 'Newsletter', null],
      default: null,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // State
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
NotificationSchema.index({ user: 1, isRead: 1 })

export default (mongoose.models.Notification as Model<INotification>) ||
  mongoose.model<INotification>('Notification', NotificationSchema)
