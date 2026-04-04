import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IEvent extends Document {
  title: string
  description: string
  coverImageUrl?: string

  // Date & Time
  startDate: Date
  endDate: Date
  timezone: string

  // Location
  type: 'In-Person' | 'Virtual' | 'Hybrid'
  location?: string
  onlineUrl?: string

  // Capacity
  maxAttendees?: number

  // Status
  status: 'draft' | 'published' | 'cancelled' | 'completed'

  // Ownership
  createdBy: mongoose.Types.ObjectId

  // Timestamps
  createdAt: Date
  updatedAt: Date

  // Virtuals
  isPast?: boolean
  registrationCount?: number
}

export interface IEventRegistration extends Document {
  event: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  status: 'registered' | 'attended' | 'cancelled' | 'waitlisted'
  registeredAt: Date
  checkedInAt?: Date
  notes?: string

  createdAt: Date
  updatedAt: Date
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    coverImageUrl: {
      type: String,
      default: null,
    },

    // Date & Time
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    timezone: {
      type: String,
      default: 'UTC',
    },

    // Location
    type: {
      type: String,
      enum: ['In-Person', 'Virtual', 'Hybrid'],
      default: 'Hybrid',
    },
    location: {
      type: String,
      default: null,
    },
    onlineUrl: {
      type: String,
      default: null,
    },

    // Capacity
    maxAttendees: {
      type: Number,
      default: null,
    },

    // Status
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft',
    },

    // Ownership
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
EventSchema.index({ startDate: 1 })

// Virtuals
EventSchema.virtual('isPast').get(function () {
  return new Date() > this.endDate
})

// Virtual populate for registrations
EventSchema.virtual('registrations', {
  ref: 'EventRegistration',
  localField: '_id',
  foreignField: 'event',
})

const EventRegistrationSchema = new Schema<IEventRegistration>(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled', 'waitlisted'],
      default: 'registered',
    },
    registeredAt: {
      type: Date,
      default: () => new Date(),
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Unique constraint: one user per event
EventRegistrationSchema.index({ event: 1, user: 1 }, { unique: true })

export const Event = (mongoose.models.Event as Model<IEvent>) || mongoose.model<IEvent>('Event', EventSchema)
export const EventRegistration =
  (mongoose.models.EventRegistration as Model<IEventRegistration>) ||
  mongoose.model<IEventRegistration>('EventRegistration', EventRegistrationSchema)
