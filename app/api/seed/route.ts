import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { User, Event, Job, Badge, BADGE_TYPES, AuditLog } from '@/models'
import { Types } from 'mongoose'

// ── Seed data ────────────────────────────────────────────────────────────────
// NOTE: passwordHash fields below receive a plain-text password string.
// The User model's pre-save hook (bcrypt) hashes it before it is persisted.

const seedUsers = [
  {
    firstName: 'Adebayo',
    lastName: 'Okonkwo',
    email: 'adebayo.okonkwo@example.com',
    passwordHash: 'password123',
    role: 'alumni' as const,
    jobTitle: 'Social Research Analyst',
    company: 'Nigerian Institute of Social Research',
    location: 'Lagos, Nigeria',
    bio: 'Passionate about using sociological research to drive social change in Nigeria.',
    phone: '+234 801 234 5678',
    socialLinks: { linkedin: 'https://linkedin.com/in/adebayo-okonkwo' },
    education: [
      { degree: "Bachelor's", major: 'Sociology', graduationYear: 2015, institution: 'Obafemi Awolowo University' },
    ],
  },
  {
    firstName: 'Chidinma',
    lastName: 'Eze',
    email: 'chidinma.eze@example.com',
    passwordHash: 'password123',
    role: 'alumni' as const,
    jobTitle: 'Cultural Heritage Consultant',
    company: 'UNESCO Nigeria',
    location: 'Abuja, Nigeria',
    bio: 'Dedicated to preserving Nigerian cultural heritage through anthropological research.',
    phone: '+234 802 345 6789',
    socialLinks: { linkedin: 'https://linkedin.com/in/chidinma-eze' },
    education: [
      { degree: "Master's", major: 'Anthropology', graduationYear: 2018, institution: 'Obafemi Awolowo University' },
    ],
  },
  {
    firstName: 'Oluwaseun',
    lastName: 'Adeyemi',
    email: 'alumni@example.com',
    passwordHash: 'alumni123',
    role: 'alumni' as const,
    jobTitle: 'Community Development Officer',
    company: 'ActionAid Nigeria',
    location: 'Ile-Ife, Nigeria',
    bio: 'Working to empower communities through participatory development approaches.',
    phone: '+234 803 456 7890',
    education: [
      { degree: "Bachelor's", major: 'Sociology', graduationYear: 2020, institution: 'Obafemi Awolowo University' },
    ],
  },
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    passwordHash: 'admin123',
    role: 'admin' as const,
    jobTitle: 'Department Coordinator',
    company: 'OAU',
    location: 'Ile-Ife, Nigeria',
    bio: 'Department administrator managing the alumni network.',
    education: [],
  },
]

const seedEvents = [
  {
    title: 'OAU-SAN Annual Homecoming 2025',
    description:
      'Join us for the annual homecoming celebration. Reconnect with classmates and celebrate our shared heritage.',
    startDate: new Date('2025-11-15T10:00:00'),
    endDate: new Date('2025-11-15T16:00:00'),
    type: 'In-Person' as const,
    location: 'OAU Campus, Ile-Ife',
    timezone: 'Africa/Lagos',
    maxAttendees: 500,
    status: 'published' as const,
  },
  {
    title: 'Career Development Workshop',
    description: 'A workshop focused on career advancement strategies for sociology and anthropology graduates.',
    startDate: new Date('2025-12-10T14:00:00'),
    endDate: new Date('2025-12-10T17:00:00'),
    type: 'Virtual' as const,
    onlineUrl: 'https://zoom.us/meeting/example',
    timezone: 'Africa/Lagos',
    maxAttendees: 100,
    status: 'published' as const,
  },
]

const seedJobs = [
  {
    title: 'Senior Research Analyst',
    company: 'Nigerian Bureau of Statistics',
    description: 'Lead research projects on demographic and social statistics across Nigeria.',
    type: 'Full-time' as const,
    remote: 'On-site' as const,
    location: 'Abuja, Nigeria',
    industry: 'Government',
    tags: ['Research', 'Statistics', 'Data Analysis'],
    salaryRange: '₦450,000 – ₦600,000',
    applicationDeadline: new Date('2025-11-30'),
    expiresAt: new Date('2025-11-30'),
    status: 'active' as const,
  },
  {
    title: 'Community Engagement Coordinator',
    company: 'World Bank Nigeria',
    description: 'Coordinate community engagement activities for development projects across Nigeria.',
    type: 'Full-time' as const,
    remote: 'Hybrid' as const,
    location: 'Lagos, Nigeria',
    industry: 'International Development',
    tags: ['Community Development', 'Engagement', 'Project Management'],
    salaryRange: '₦350,000 – ₦500,000',
    applicationDeadline: new Date('2025-12-15'),
    expiresAt: new Date('2025-12-15'),
    status: 'active' as const,
  },
]

export async function POST() {
  try {
    await connectDB()

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Job.deleteMany({}),
      Badge.deleteMany({}),
    ])

    // Create users — pre-save hook bcrypts passwordHash automatically
    const createdUsers = await User.create(seedUsers)
    const adminUser = createdUsers.find((u) => u.role === 'admin')

    // Create events
    const eventsWithCreator = seedEvents.map((event) => ({
      ...event,
      createdBy: adminUser?._id,
    }))
    const createdEvents = await Event.create(eventsWithCreator)

    // Create jobs
    const jobsWithPoster = seedJobs.map((job) => ({
      ...job,
      postedBy: adminUser?._id,
    }))
    const createdJobs = await Job.create(jobsWithPoster)

    // Award sample badges to first 3 alumni
    let badgesCreated = 0
    const alumniOnly = createdUsers.filter((u) => u.role === 'alumni')
    for (let i = 0; i < Math.min(3, alumniOnly.length); i++) {
      try {
        await Badge.create({
          recipient: alumniOnly[i]._id,
          badgeType: BADGE_TYPES[i % BADGE_TYPES.length].id,
          reason: 'Seeded badge for demo',
          awardedBy: adminUser?._id,
        })
        badgesCreated++
      } catch {
        // Silently skip duplicate badge constraint violations
      }
    }

    // Audit log
    await AuditLog.create({
      actor: adminUser?._id ?? null,
      actorRole: 'system',
      action: 'system.database_seeded',
      targetModel: 'User',
      newState: {
        usersCreated: createdUsers.length,
        eventsCreated: createdEvents.length,
        jobsCreated: createdJobs.length,
        badgesCreated,
      },
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      counts: {
        users: createdUsers.length,
        events: createdEvents.length,
        jobs: createdJobs.length,
        badges: badgesCreated,
      },
      credentials: {
        admin:  { email: 'admin@example.com',  password: 'admin123'  },
        alumni: { email: 'alumni@example.com', password: 'alumni123' },
      },
    })
  } catch (error: any) {
    console.error('Failed to seed database:', error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to seed the database with initial data.',
  })
}
