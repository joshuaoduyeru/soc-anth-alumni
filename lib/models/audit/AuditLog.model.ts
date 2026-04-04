import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAuditLog extends Document {
  // Who
  actor?: mongoose.Types.ObjectId
  actorRole: 'alumni' | 'admin' | 'system'

  // What
  action: string

  // Target
  targetModel: 'User' | 'Event' | 'Job' | 'Badge' | 'MentorProfile' | 'Newsletter' | 'Notification'
  targetId?: mongoose.Types.ObjectId

  // Change Snapshot
  previousState?: object
  newState?: object

  // Context
  ipAddress?: string
  userAgent?: string
  notes?: string

  // Timestamps (never updated)
  createdAt: Date
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    // Who
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    actorRole: {
      type: String,
      enum: ['alumni', 'admin', 'system'],
      default: 'alumni',
    },

    // What
    action: {
      type: String,
      required: [true, 'Action is required'],
    },

    // Target
    targetModel: {
      type: String,
      enum: ['User', 'Event', 'Job', 'Badge', 'MentorProfile', 'Newsletter', 'Notification'],
      required: [true, 'Target model is required'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    // Change Snapshot
    previousState: {
      type: Schema.Types.Mixed,
      default: null,
    },
    newState: {
      type: Schema.Types.Mixed,
      default: null,
    },

    // Context
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

// Indexes
AuditLogSchema.index({ actor: 1, createdAt: -1 })
AuditLogSchema.index({ targetModel: 1, targetId: 1 })

export default (mongoose.models.AuditLog as Model<IAuditLog>) ||
  mongoose.model<IAuditLog>('AuditLog', AuditLogSchema)
