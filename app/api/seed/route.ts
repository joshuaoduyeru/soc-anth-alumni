import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { User, Event, Job, Badge, BADGE_TYPES, AuditLog } from '@/models'
import { Types } from 'mongoose'
import bcrypt from 'bcryptjs'

// Sample seed data
const seedUsers = [
  {
    firstName: 'Adebayo',
    lastName: 'Okonkwo',
    email: 'adebayo.okonkwo@example.com',
    passwordHash: 'password123',
    role: 'alumni',
    jobTitle: 'Social Research Analyst',
    company: 'Nigerian Institute of Social Research',
    location: 'Lagos, Nigeria',
    bio: 'Passionate about using sociological research to drive social change in Nigeria.',
    linkedinUrl: 'linkedin.com/in/adebayo-okonkwo',
    phone: '+234 801 234 5678',
    skills: ['Qualitative Research', 'SPSS', 'Data Analysis', 'Policy Analysis'],
    isMentor: true,
  },
  {
    firstName: 'Chidinma',
    lastName: 'Eze',
    email: 'chidinma.eze@example.com',
    passwordHash: 'password123',
    role: 'alumni',
    jobTitle: 'Cultural Heritage Consultant',
    company: 'UNESCO Nigeria',
    location: 'Abuja, Nigeria',
    bio: 'Dedicated to preserving Nigerian cultural heritage through anthropological research.',
    linkedinUrl: 'linkedin.com/in/chidinma-eze',
    phone: '+234 802 345 6789',
    skills: ['Ethnography', 'Cultural Documentation', 'Heritage Conservation', 'Grant Writing'],
    isMentor: true,
  },
  {
    firstName: 'Oluwaseun',
    lastName: 'Adeyemi',
    email: 'alumni@example.com',
    passwordHash: 'alumni123',
    role: 'alumni',
    jobTitle: 'Community Development Officer',
    company: 'ActionAid Nigeria',
    location: 'Ile-Ife, Nigeria',
    bio: 'Working to empower communities through participatory development approaches.',
    linkedinUrl: 'linkedin.com/in/oluwaseun-adeyemi',
    phone: '+234 803 456 7890',
    skills: ['Community Organizing', 'Project Management', 'Advocacy', 'M&E'],
    isMentor: false,
  },
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    passwordHash: 'admin123',
    role: 'admin',
    jobTitle: 'Department Coordinator',
    company: 'OAU',
    location: 'Ile-Ife, Nigeria',
    bio: 'Department administrator managing the alumni network.',
    isMentor: false,
  },
]

const seedEvents = [
  {
    title: 'OAU-SAN Annual Homecoming 2024',
    description:
      'Join us for the annual homecoming celebration at Obafemi Awolowo University. Reconnect with classmates and celebrate our shared heritage.',
    startDate: new Date('2024-11-15T10:00:00'),
    endDate: new Date('2024-11-15T16:00:00'),
    type: 'In-Person',
    location: 'OAU Campus, Ile-Ife',
    timezone: 'Africa/Lagos',
    maxAttendees: 500,
    status: 'published',
  },
  {
    title: 'Career Development Workshop',
    description: 'A workshop focused on career advancement strategies for sociology and anthropology graduates.',
    startDate: new Date('2024-10-20T14:00:00'),
    endDate: new Date('2024-10-20T17:00:00'),
    type: 'Virtual',
    onlineUrl: 'https://zoom.us/meeting/example',
    timezone: 'Africa/Lagos',
    maxAttendees: 100,
    status: 'published',
  },
]

const seedJobs = [
  {
    title: 'Senior Research Analyst',
    company: 'Nigerian Bureau of Statistics',
    description: 'Lead research projects on demographic and social statistics.',
    type: 'Full-time',
    remote: 'On-site',
    location: 'Abuja, Nigeria',
    industry: 'Government',
    tags: ['Research', 'Statistics', 'Data Analysis'],
    salaryRange: 'N450,000 - N600,000',
    applicationDeadline: new Date('2024-11-30'),
    expiresAt: new Date('2024-11-30'),
    status: 'active',
  },
  {
    title: 'Community Engagement Coordinator',
    company: 'World Bank Nigeria',
    description: 'Coordinate community engagement activities for development projects across Nigeria.',
    type: 'Full-time',
    remote: 'Hybrid',
    location: 'Lagos, Nigeria',
    industry: 'International Development',
    tags: ['Community Development', 'Engagement', 'Project Management'],
    salaryRange: 'N350,000 - N500,000',
    applicationDeadline: new Date('2024-12-15'),
    expiresAt: new Date('2024-12-15'),
    status: 'active',
  },
]

export async function POST() {
  try {
    await connectDB()

    // Clear existing data
    await User.deleteMany({})
    await Event.deleteMany({})
    await Job.deleteMany({})
    await Badge.deleteMany({})

    // Create users
    const createdUsers = await User.create(seedUsers)
    const adminUser = createdUsers.find((u) => u.role === 'admin')

    // Create events and attach to admin
    const eventsWithCreator = seedEvents.map((event) => ({
      ...event,
      createdBy: adminUser?._id,
    }))
    await Event.create(eventsWithCreator)

    // Create jobs and attach to admin
    const jobsWithPoster = seedJobs.map((job) => ({
      ...job,
      postedBy: adminUser?._id,
    }))
    await Job.create(jobsWithPoster)

    // Award some badges to alumni
    if (createdUsers.length > 0) {
      for (let i = 0; i < Math.min(3, createdUsers.length); i++) {
        const user = createdUsers[i]
        if (user.role === 'alumni') {
          await Badge.create({
            recipient: user._id,
            badgeType: BADGE_TYPES[i % BADGE_TYPES.length].id,
            reason: 'Seeded badge for demo',
            awardedBy: adminUser?._id,
          }).catch(() => {
            // Skip if badge already exists (unique constraint)
          })
        }
      }
    }

    // Log audit
    await AuditLog.create({
      actor: adminUser?._id,
      actorRole: 'system',
      action: 'system.database_seeded',
      targetModel: 'User',
      newState: {
        usersCreated: createdUsers.length,
        eventsCreated: seedEvents.length,
        jobsCreated: seedJobs.length,
      },
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      counts: {
        users: createdUsers.length,
        events: seedEvents.length,
        jobs: seedJobs.length,
        badges: Math.min(3, createdUsers.length),
      },
      credentials: {
        admin: {
          email: 'admin@example.com',
          password: 'admin123',
        },
        alumni: {
          email: 'alumni@example.com',
          password: 'alumni123',
        },
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
    message: 'POST to this endpoint to seed the database with initial data',
  })
}
