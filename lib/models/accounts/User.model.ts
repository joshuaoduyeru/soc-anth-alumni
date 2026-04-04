import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IEducation {
  degree: "Bachelor's" | "Master's" | "PhD"
  major: string
  graduationYear: number
  institution: string
}

export interface INotificationPreferences {
  emailOnEvent: boolean
  emailOnJobPost: boolean
  emailOnMentorship: boolean
  emailOnNewsletter: boolean
  emailOnBadge: boolean
}

export interface ISocialLinks {
  linkedin?: string
  twitter?: string
  github?: string
  website?: string
}

export interface IUser extends Document {
  // Identity
  firstName: string
  lastName: string
  email: string
  passwordHash: string

  // Role & Status
  role: 'alumni' | 'admin'
  isActive: boolean
  isVerified: boolean

  // Profile
  avatarUrl?: string
  phone?: string
  location?: string
  bio?: string

  // Professional
  jobTitle?: string
  company?: string
  industry?: string

  // Education
  education: IEducation[]

  // Social Links
  socialLinks?: ISocialLinks

  // Preferences
  notificationPreferences: INotificationPreferences

  // Relations
  savedJobs: mongoose.Types.ObjectId[]

  // Auth & Security
  passwordResetToken?: string
  passwordResetExpires?: Date
  emailVerifyToken?: string
  lastLoginAt?: Date
  loginCount: number

  // Timestamps
  createdAt: Date
  updatedAt: Date

  // Virtuals
  fullName?: string
  primaryEducation?: IEducation | undefined

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    // Identity
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },

    // Role & Status
    role: {
      type: String,
      enum: ['alumni', 'admin'],
      default: 'alumni',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Profile
    avatarUrl: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 1000,
      default: null,
    },

    // Professional
    jobTitle: {
      type: String,
      default: null,
    },
    company: {
      type: String,
      default: null,
    },
    industry: {
      type: String,
      default: null,
    },

    // Education
    education: [
      {
        degree: {
          type: String,
          enum: ["Bachelor's", "Master's", "PhD"],
        },
        major: String,
        graduationYear: Number,
        institution: String,
      },
    ],

    // Social Links
    socialLinks: {
      linkedin: { type: String, default: null },
      twitter: { type: String, default: null },
      github: { type: String, default: null },
      website: { type: String, default: null },
    },

    // Preferences
    notificationPreferences: {
      emailOnEvent: { type: Boolean, default: true },
      emailOnJobPost: { type: Boolean, default: true },
      emailOnMentorship: { type: Boolean, default: true },
      emailOnNewsletter: { type: Boolean, default: true },
      emailOnBadge: { type: Boolean, default: true },
    },

    // Relations
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
      },
    ],

    // Auth & Security
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    emailVerifyToken: {
      type: String,
      select: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
UserSchema.index({ email: 1 })

// Virtuals
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`
})

UserSchema.virtual('primaryEducation').get(function () {
  if (this.education && this.education.length > 0) {
    return this.education.sort((a, b) => b.graduationYear - a.graduationYear)[0]
  }
  return undefined
})

// Methods for password handling
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash)
}

// Middleware to hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt)
    next()
  } catch (error) {
    next(error as any)
  }
})

export default (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema)
