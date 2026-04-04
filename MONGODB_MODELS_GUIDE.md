# MongoDB Mongoose Models - Implementation Guide

## 📁 Models Directory Structure

```
lib/models/
├── index.ts              ← Barrel export (import all models from one place)
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

## 🔑 Core Models Overview

### 1. User Model (accounts/User.model.ts)
**Purpose:** Store alumni and admin user profiles

**Key Fields:**
```typescript
{
  // Identity
  firstName: string
  lastName: string
  email: string (unique, indexed)
  passwordHash: string (bcrypted, select: false)

  // Role & Status
  role: 'alumni' | 'admin'
  isActive: boolean
  isVerified: boolean

  // Profile
  avatarUrl: string
  phone: string
  location: string
  bio: string (max 1000 chars)

  // Professional
  jobTitle: string
  company: string
  industry: string

  // Education (array of education records)
  education: [ {
    degree: "Bachelor's" | "Master's" | "PhD"
    major: string
    graduationYear: number
    institution: string
  }]

  // Social Links
  socialLinks: {
    linkedin: string
    twitter: string
    github: string
    website: string
  }

  // Preferences
  notificationPreferences: {
    emailOnEvent: boolean
    emailOnJobPost: boolean
    emailOnMentorship: boolean
    emailOnNewsletter: boolean
    emailOnBadge: boolean
  }

  // Relations
  savedJobs: [ObjectId]  // References to Job model

  // Auth & Security
  passwordResetToken: string (select: false)
  passwordResetExpires: Date (select: false)
  emailVerifyToken: string (select: false)
  lastLoginAt: Date
  loginCount: number

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

**Virtuals:**
- `fullName`: Concatenated first + last name
- `primaryEducation`: Most recent degree

---

### 2. Event Model (events/Event.model.ts)
**Purpose:** Store alumni events (reunions, workshops, etc.)

**Key Fields:**
```typescript
{
  title: string (indexed)
  description: string
  coverImageUrl: string

  // Date & Time
  startDate: Date (indexed)
  endDate: Date
  timezone: string

  // Location
  type: 'In-Person' | 'Virtual' | 'Hybrid'
  location: string            // physical address
  onlineUrl: string           // virtual join link

  // Capacity
  maxAttendees: number

  // Status
  status: 'draft' | 'published' | 'cancelled' | 'completed'

  // Ownership
  createdBy: ObjectId (ref: User)

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

**Virtuals:**
- `registrations`: Related EventRegistration documents (virtual populate)
- `isPast`: Boolean if event date has passed

---

### 3. EventRegistration Model
**Purpose:** Track who registered for which events

**Key Fields:**
```typescript
{
  event: ObjectId (ref: Event, indexed)
  user: ObjectId (ref: User, indexed)
  status: 'registered' | 'attended' | 'cancelled' | 'waitlisted'
  registeredAt: Date
  checkedInAt: Date
  notes: string              // admin notes

  // Unique constraint: each user per event
  createdAt: Date
  updatedAt: Date
}
```

---

### 4. Job Model (jobs/Job.model.ts)
**Purpose:** Store job postings for alumni

**Key Fields:**
```typescript
{
  // Core
  title: string (indexed)
  company: string (indexed)
  description: string

  // Location & Type
  location: string
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  remote: 'On-site' | 'Remote' | 'Hybrid'

  // Compensation
  salaryRange: string  // e.g. "$100k – $130k"
  currency: string     // default: USD

  // Industry & Tags
  industry: string (indexed)
  tags: [string]       // e.g. ['python', 'react', 'startups']

  // Application
  applicationUrl: string
  applicationEmail: string
  applicationDeadline: Date

  // Status
  status: 'active' | 'closed' | 'draft'
  expiresAt: Date (indexed)

  // Meta
  postedBy: ObjectId (ref: User, indexed)
  viewCount: number

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

**Virtuals:**
- `isExpired`: Boolean if job has passed expiration date

---

### 5. MentorProfile Model (mentorship/Mentorship.model.ts)
**Purpose:** Mark alumni as mentors and manage their availability

**Key Fields:**
```typescript
{
  // Link to User (one-to-one)
  user: ObjectId (ref: User, unique)

  // Expertise
  expertise: string (required)
  expertiseTags: [string]     // e.g. ['career-coaching', 'tech']
  industry: string
  yearsOfExperience: number

  // Availability
  availability: 'Weekly' | 'Bi-weekly' | 'Monthly'
  isAcceptingRequests: boolean

  // About
  bio: string (max 1000 chars)

  // Stats (denormalized for fast reads)
  totalRequests: number       // total mentorship requests received
  activeConnections: number   // current active mentorships

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

---

### 6. MentorshipRequest Model
**Purpose:** Track mentorship requests between mentees and mentors

**Key Fields:**
```typescript
{
  mentor: ObjectId (ref: MentorProfile, indexed)
  mentee: ObjectId (ref: User, indexed)
  message: string      // why they want mentorship
  goals: string        // what they hope to achieve

  // Status
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled'
  respondedAt: Date    // when mentor responded
  completedAt: Date    // when relationship ended/completed

  // Admin notes
  mentorNotes: string (select: false)

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

**Unique Constraint:** One open request per mentee to same mentor

---

### 7. Badge Model (badges/Badge.model.ts)
**Purpose:** Award badges to recognize alumni achievements

**Badges Types:**
```typescript
export const BADGE_TYPES = [
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
```

**Badge Fields:**
```typescript
{
  recipient: ObjectId (ref: User, indexed)
  badgeType: string (ref: BadgeType ID)
  reason: string (max 500 chars)
  awardedBy: ObjectId (ref: User)  // admin who awarded it
  awardedAt: Date (indexed)
  isVisible: boolean

  // Timestamps
  createdAt: Date
}
```

**Unique Constraint:** Each user can have each badge type only once

---

### 8. Newsletter Model (communications/Newsletter.model.ts)
**Purpose:** Send newsletters to alumni groups

**Key Fields:**
```typescript
{
  // Content
  subject: string
  body: string       // HTML or markdown
  preview: string    // short preview text

  // Targeting
  recipientGroup: 'all' | 'recent_graduates' | 'mentors' | 'bachelors' | 'masters' | 'phd'

  // Delivery Stats
  recipientCount: number
  deliveredCount: number
  openedCount: number
  clickedCount: number

  // Status
  status: 'draft' | 'queued' | 'sending' | 'sent' | 'failed'
  sentAt: Date (indexed)
  scheduledFor: Date

  // Authorship
  createdBy: ObjectId (ref: User, indexed)

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

---

### 9. Notification Model (notifications/Notification.model.ts)
**Purpose:** In-app notifications for users

**Key Fields:**
```typescript
{
  user: ObjectId (ref: User, indexed)

  // Content
  title: string
  message: string

  // Type
  type: 'event_registration' | 'event_reminder' | 'event_cancelled' | 
        'job_posted' | 'mentorship_request' | 'mentorship_accepted' | 
        'mentorship_declined' | 'badge_awarded' | 'newsletter' | 
        'system' | 'admin_message'

  // Linked Entity (generic reference)
  relatedModel: 'Event' | 'Job' | 'MentorshipRequest' | 'Badge' | 'Newsletter' | null
  relatedId: ObjectId

  // State
  isRead: boolean (indexed)
  readAt: Date

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

---

### 10. AuditLog Model (audit/AuditLog.model.ts)
**Purpose:** Track all admin actions for accountability

**Key Fields:**
```typescript
{
  // Who
  actor: ObjectId (ref: User, indexed)
  actorRole: 'alumni' | 'admin'

  // What
  action: string  // e.g. 'user.create', 'badge.award', 'newsletter.send'

  // Target
  targetModel: 'User' | 'Event' | 'Job' | 'Badge' | 'MentorProfile' | ...
  targetId: ObjectId (indexed)

  // Change Snapshot
  previousState: object       // state before change
  newState: object           // state after change

  // Context
  ipAddress: string
  userAgent: string
  notes: string

  // Timestamps (never updated, only inserted)
  createdAt: Date
}
```

**Unique Constraint:** None (audit logs are immutable)

---

## 🔗 Model Relationships

```
User (1) ──── (Many) Event (createdBy)
User (1) ──── (Many) Job (postedBy)
User (1) ──── (1) MentorProfile (unique)
User (1) ──── (Many) Badge (recipient)
User (1) ──── (Many) MentorshipRequest (mentee)

MentorProfile (1) ──── (Many) MentorshipRequest

Event (1) ──── (Many) EventRegistration
User (1) ──── (Many) EventRegistration

Job (1) ──-- (Many) User (savedJobs)
```

---

## 📦 Barrel Export (models/index.ts)

```typescript
export { default as User } from './accounts/User.model';
export { Event, EventRegistration } from './events/Event.model';
export { default as Job } from './jobs/Job.model';
export { MentorProfile, MentorshipRequest } from './mentorship/Mentorship.model';
export { BadgeType, Badge, BADGE_TYPES } from './badges/Badge.model';
export { default as Newsletter } from './communications/Newsletter.model';
export { default as Notification } from './notifications/Notification.model';
export { default as AuditLog } from './audit/AuditLog.model';
```

**Usage:**
```typescript
import { User, Event, Job, Badge, MentorProfile } from '@/models'

// Now you can:
const user = await User.findById(id)
const events = await Event.find({ status: 'published' })
```

---

## 🚀 Using Models in API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { User, Badge, MentorProfile } from '@/models'

export async function GET(req: NextRequest) {
  try {
    // Find admin users
    const admins = await User.find({ role: 'admin' })

    // Find all badges awarded to a user
    const userBadges = await Badge.find({ recipient: userId })
      .populate('badgeType')
      .populate('awardedBy', 'firstName lastName email')

    // Get mentors with active requests
    const mentors = await MentorProfile.find({ isAcceptingRequests: true })
      .populate('user', 'firstName lastName email bio')
      .lean()

    return NextResponse.json({ admins, userBadges, mentors })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

---

## 📝 Usage Examples

### Create a User
```typescript
const user = await User.create({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  passwordHash: hashedPassword,
  education: [{
    degree: "Bachelor's",
    major: 'Computer Science',
    graduationYear: 2020,
  }],
})
```

### Award a Badge
```typescript
const badge = await Badge.create({
  recipient: userId,
  badgeType: 'super_mentor',
  reason: 'Mentored 5+ mentees successfully',
  awardedBy: adminId,
})
```

### Create Mentorship Request
```typescript
const request = await MentorshipRequest.create({
  mentor: mentorProfileId,
  mentee: userId,
  message: 'I want to learn about career transitions',
  goals: 'Change from engineering to product management',
})
```

### Log Admin Action
```typescript
await AuditLog.create({
  actor: adminId,
  actorRole: 'admin',
  action: 'user.promote',
  targetModel: 'User',
  targetId: userId,
  newState: { role: 'admin' },
  previousState: { role: 'alumni' },
  ipAddress: req.ip,
  userAgent: req.headers.get('user-agent'),
})
```

---

## 🔐 Security Best Practices

1. **Select: false** - Never return passwords or sensitive tokens
2. **Indexes** - Added on frequently searched fields
3. **Validation** - Zod schemas mirror model fields
4. **Constraints** - Unique constraints prevent duplicates
5. **Audit Logs** - Track all admin actions
6. **TTL Indexes** - Auto-expire reset tokens and logs

---

## 📚 Next Steps

1. Create the models directory structure
2. Copy model files into appropriate subdirectories
3. Set up MongoDB connection
4. Test models with sample data
5. Update API routes to use models
6. Implement frontend hooks that call API endpoints

Your data is now properly structured and scalable! 🎉
