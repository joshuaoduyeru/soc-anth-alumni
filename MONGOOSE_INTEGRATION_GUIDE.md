# Integration Guide: Mongoose Models + Next.js API

This guide explains how to integrate the Mongoose models with your Next.js application.

---

## 📋 Current vs. New Architecture

### CURRENT (MongoDB Native Driver)
```
API Routes
    ↓
getDatabase()
    ↓
db.collection('alumni').find()
    ↓
Raw MongoDB documents
```

### NEW (Mongoose ORM)
```
API Routes
    ↓
import { User, Event, Badge }
    ↓
User.find()
    ↓
Mongoose models with validation & virtuals
```

---

## 🔄 Migration Path

### Step 1: Set Up Mongoose Connection

Create `lib/mongoose.ts`:

```typescript
import mongoose, { Connection } from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI environment variable')
}

let cached: { conn: Connection | null; promise: Promise<Connection> | null } = {
  conn: null,
  promise: null,
}

export async function connectDB(): Promise<Connection> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose.connection
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}
```

### Step 2: Create Models Directory

```
lib/models/
├── index.ts
├── accounts/
│   └── User.model.ts
├── events/
│   └── Event.model.ts
├── jobs/
│   └── Job.model.ts
├── mentorship/
│   └── Mentorship.model.ts
├── badges/
│   └── Badge.model.ts
├── communications/
│   └── Newsletter.model.ts
├── notifications/
│   └── Notification.model.ts
└── audit/
    └── AuditLog.model.ts
```

### Step 3: Export All Models

Create `lib/models/index.ts`:

```typescript
export { default as User } from './accounts/User.model'
export { Event, EventRegistration } from './events/Event.model'
export { default as Job } from './jobs/Job.model'
export { MentorProfile, MentorshipRequest } from './mentorship/Mentorship.model'
export { BadgeType, Badge, BADGE_TYPES } from './badges/Badge.model'
export { default as Newsletter } from './communications/Newsletter.model'
export { default as Notification } from './notifications/Notification.model'
export { default as AuditLog } from './audit/AuditLog.model'
```

### Step 4: Update API Routes

**Before (using native MongoDB driver):**
```typescript
export async function GET(req: NextRequest) {
  const db = await getDatabase()
  const user = await db
    .collection('alumni')
    .findOne({ _id: new ObjectId(userId) })
  return NextResponse.json(user)
}
```

**After (using Mongoose models):**
```typescript
import { User } from '@/models'
import { connectDB } from '@/lib/mongoose'

export async function GET(req: NextRequest) {
  await connectDB()
  const user = await User.findById(userId)
    .select('-passwordHash')  // Exclude password
  return NextResponse.json(user)
}
```

---

## 🔀 API Route Examples

### Creating a User

```typescript
import { User } from '@/models'
import { connectDB } from '@/lib/mongoose'

export async function POST(req: NextRequest) {
  await connectDB()
  
  try {
    const { firstName, lastName, email, passwordHash } = await req.json()

    // Check if user exists
    const existing = await User.findOne({ email })
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      education: [],
    })

    // Log action
    await AuditLog.create({
      actor: null,  // system action
      actorRole: 'system',
      action: 'user.create',
      targetModel: 'User',
      targetId: user._id,
      newState: { email, firstName, lastName },
    })

    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      name: user.fullName,  // Virtual!
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
```

### Getting Admin Users

```typescript
import { User } from '@/models'
import { connectDB } from '@/lib/mongoose'

export async function GET(req: NextRequest) {
  await connectDB()

  try {
    const admins = await User.find({ role: 'admin' })
      .select('-passwordHash -emailVerifyToken')
      .lean()  // Return plain JS objects (faster)

    return NextResponse.json(
      admins.map((admin) => ({
        id: admin._id.toString(),
        email: admin.email,
        name: `${admin.firstName} ${admin.lastName}`,
        createdAt: admin.createdAt,
      }))
    )
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 })
  }
}
```

### Award a Badge

```typescript
import { Badge, User } from '@/models'
import { connectDB } from '@/lib/mongoose'

export async function POST(req: NextRequest) {
  await connectDB()

  try {
    const { recipientId, badgeType, reason } = await req.json()
    const adminId = req.headers.get('x-admin-id')  // From auth middleware

    // Check user exists
    const recipient = await User.findById(recipientId)
    if (!recipient) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create badge (unique constraint prevents duplicates)
    const badge = await Badge.create({
      recipient: recipientId,
      badgeType,
      reason,
      awardedBy: adminId,
    })

    // Create notification
    await Notification.create({
      user: recipientId,
      title: 'Badge Awarded!',
      message: `You earned the ${badgeType} badge!`,
      type: 'badge_awarded',
      relatedModel: 'Badge',
      relatedId: badge._id,
    })

    return NextResponse.json({ success: true, badge })
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key error
      return NextResponse.json(
        { error: 'User already has this badge' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Failed to award badge' }, { status: 500 })
  }
}
```

### Get Mentors with Details

```typescript
import { MentorProfile, User } from '@/models'
import { connectDB } from '@/lib/mongoose'

export async function GET(req: NextRequest) {
  await connectDB()

  try {
    const { industry, expertise } = Object.fromEntries(new URL(req.url).searchParams)

    const query: any = { isAcceptingRequests: true }
    if (industry) query.industry = industry
    if (expertise) query.expertiseTags = { $in: [expertise] }

    const mentors = await MentorProfile.find(query)
      .populate('user', 'firstName lastName email bio avatarUrl')
      .sort({ activeConnections: -1 })
      .lean()

    return NextResponse.json(
      mentors.map((mentor) => ({
        id: mentor._id.toString(),
        user: mentor.user,
        expertise: mentor.expertise,
        availability: mentor.availability,
        activeConnections: mentor.activeConnections,
      }))
    )
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch mentors' }, { status: 500 })
  }
}
```

---

## 📊 Query Examples

### Find with Multiple Conditions

```typescript
// Users who are mentors
const mentors = await User.find({ 
  role: 'alumni',
  isMentor: true,
  isActive: true,
})

// Recent events
const upcoming = await Event.find({
  startDate: { $gte: new Date() },
  status: 'published',
})
.sort({ startDate: 1 })
.limit(10)

// Job postings in tech
const techJobs = await Job.find({
  status: 'active',
  $or: [
    { industry: 'Technology' },
    { tags: 'tech' },
  ],
})
.where('expiresAt').gt(new Date())
```

### Populate Relations

```typescript
// Events with creator details
const events = await Event.find()
  .populate('createdBy', 'firstName lastName email')

// Badges with badge type and awardee
const badges = await Badge.find({ recipient: userId })
  .populate('badgeType')
  .populate('awardedBy', 'firstName lastName')

// Mentorship requests with full details
const requests = await MentorshipRequest.find({ mentee: userId })
  .populate({
    path: 'mentor',
    populate: { path: 'user', select: 'firstName lastName email' },
  })
```

### Text Search

```typescript
// Search across fields
const results = await User.find(
  { $text: { $search: 'javascript react' } },
  { score: { $meta: 'textScore' } }
)
.sort({ score: { $meta: 'textScore' } })

// Job search
const jobs = await Job.find(
  { $text: { $search: 'senior engineer' } }
)
```

### Aggregation Pipeline

```typescript
// Stats by industry
const stats = await Job.aggregate([
  { $match: { status: 'active' } },
  {
    $group: {
      _id: '$industry',
      count: { $sum: 1 },
      avgSalary: { $avg: '$salaryRange' },
    },
  },
  { $sort: { count: -1 } },
])

// User badge counts
const badgeCounts = await Badge.aggregate([
  { $group: { _id: '$recipient', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 },
])
```

---

## 🔐 Middleware for Admin Checks

Create `lib/admin-middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/models'
import { connectDB } from '@/lib/mongoose'

export async function checkAdmin(req: NextRequest) {
  try {
    await connectDB()
    
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      throw new Error('Not authenticated')
    }

    const user = await User.findById(userId)
    if (!user || user.role !== 'admin') {
      throw new Error('Not authorized')
    }

    return { user, isAuthorized: true }
  } catch (error) {
    return { user: null, isAuthorized: false, error }
  }
}
```

**Usage in API routes:**

```typescript
export async function POST(req: NextRequest) {
  const { isAuthorized } = await checkAdmin(req)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  // Admin-only logic here
  await connectDB()
  // ...
}
```

---

## 🧪 Testing Models

```typescript
// test/models.test.ts
import { User, Badge, Event } from '@/models'
import { connectDB } from '@/lib/mongoose'

describe('User Model', () => {
  beforeAll(async () => {
    await connectDB()
  })

  it('creates user with full name virtual', async () => {
    const user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      passwordHash: 'hash',
    })

    expect(user.fullName).toBe('John Doe')
  })

  it('enforces unique email', async () => {
    await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      passwordHash: 'hash',
    })

    expect(
      User.create({
        firstName: 'Jane2',
        lastName: 'Smith2',
        email: 'jane@example.com',  // duplicate
        passwordHash: 'hash',
      })
    ).rejects.toThrow()
  })
})
```

---

## 🚀 Deployment Checklist

- [ ] Mongoose connection string in production `.env.production`
- [ ] Database indexes created: `db.collection.createIndex(...)`
- [ ] Connection pooling configured
- [ ] Error handling for connection failures
- [ ] API routes updated to use models
- [ ] Passwords selected: false in responses
- [ ] Admin middleware implemented
- [ ] Audit logging for admin actions
- [ ] Rate limiting on endpoints
- [ ] Request validation (Zod schemas)

---

## 📚 Related Documentation

- `MONGODB_MODELS_GUIDE.md` - Detailed model documentation
- `COLOR_SCHEME_GUIDE.md` - UI color implementation
- `ADMIN_SETUP.md` - Admin user setup

---

## ✅ Implementation Status

- [x] Models defined (provided by user)
- [x] User dropdown with colors
- [x] Admin API route with better error handling
- [x] Color scheme applied to AppShell
- [ ] Mongoose connection setup (Next step)
- [ ] Migrate API routes to Mongoose
- [ ] Update frontend to use new endpoints
- [ ] Add authentication middleware
- [ ] Implement audit logging

Your MongoDB models are ready to be integrated! 🎉
