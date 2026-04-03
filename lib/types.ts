import { ObjectId } from 'mongodb'

// Database types (with MongoDB _id)
export interface AlumniDoc {
  _id?: ObjectId
  firstName: string
  lastName: string
  email: string
  password?: string // hashed
  year: number
  degree: string
  major?: string
  company?: string
  jobTitle?: string
  phone?: string
  location?: string
  linkedin?: string
  bio?: string
  isAdmin?: boolean
  isVerified?: boolean
  isMentor?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface EventDoc {
  _id?: ObjectId
  title: string
  date: string
  time: string
  location?: string
  description?: string
  maxAttendees?: number
  type: 'In-Person' | 'Virtual' | 'Hybrid'
  createdAt: Date
  updatedAt: Date
}

export interface JobDoc {
  _id?: ObjectId
  title: string
  company: string
  location?: string
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  salary?: string
  industry?: string
  description?: string
  link?: string
  createdAt: Date
  updatedAt: Date
}

export interface MentorDoc {
  _id?: ObjectId
  alumniId: string
  expertise: string
  experience?: string
  availability: 'Weekly' | 'Bi-weekly' | 'Monthly'
  industry?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}

export interface BadgeDoc {
  _id?: ObjectId
  alumniId: string
  type: string
  reason?: string
  date: string
  createdAt: Date
}

export interface CommunicationDoc {
  _id?: ObjectId
  subject: string
  body: string
  recipient: string
  recipientLabel: string
  count: number
  createdAt: Date
}

export interface EventRegistrationDoc {
  _id?: ObjectId
  eventId: string
  userId: string | null
  createdAt: Date
}

export interface MentorRequestDoc {
  _id?: ObjectId
  mentorId: string
  userId: string | null
  createdAt: Date
}

export interface UserDoc {
  _id?: ObjectId
  email: string
  password: string // hashed
  role: 'admin' | 'alumni'
  name: string
  alumniId?: string
  createdAt: Date
  updatedAt: Date
}

// Frontend types (with string id)
export interface Alumni {
  id: string
  firstName: string
  lastName: string
  email: string
  year: number
  degree: "Bachelor's" | "Master's" | "PhD"
  major?: string
  company?: string
  jobTitle?: string
  phone?: string
  location?: string
  linkedin?: string
  bio?: string
  role: 'alumni'
}

export interface Event {
  id: string
  title: string
  date: string
  time: string
  location?: string
  description?: string
  maxAttendees?: number
  type: 'In-Person' | 'Virtual' | 'Hybrid'
}

export interface Job {
  id: string
  title: string
  company: string
  location?: string
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  salary?: string
  industry?: string
  description?: string
  link?: string
}

export interface Mentor {
  id: string
  alumniId: string
  expertise: string
  experience?: string
  availability: 'Weekly' | 'Bi-weekly' | 'Monthly'
  industry?: string
  bio?: string
}

export interface Badge {
  id: string
  alumniId: string
  type: string
  reason?: string
  date: string
}

export interface Communication {
  id: string
  subject: string
  body: string
  recipient: string
  recipientLabel: string
  count: number
  ts: string
}

export interface EventRegistration {
  id: string
  eventId: string
  userId: string | null
  ts: string
}

export interface MentorRequest {
  id: string
  mentorId: string
  userId: string | null
  ts: string
}

export interface User {
  email: string
  role: 'admin' | 'alumni'
  name: string
  id: string | null
}

// Badge definitions
export const BADGE_DEFINITIONS = [
  { id: 'pioneer', name: 'Pioneer', icon: 'Rocket', desc: 'First to register' },
  { id: 'mentor', name: 'Super Mentor', icon: 'GraduationCap', desc: 'Active mentorship' },
  { id: 'networker', name: 'Network Champion', icon: 'Users', desc: 'Most connections' },
  { id: 'speaker', name: 'Distinguished Speaker', icon: 'Mic', desc: 'Event presenter' },
  { id: 'donor', name: 'Generous Donor', icon: 'Heart', desc: 'Financial contribution' },
  { id: 'volunteer', name: 'Active Volunteer', icon: 'HandHelping', desc: 'Event participation' },
  { id: 'career', name: 'Career Achiever', icon: 'TrendingUp', desc: 'Career milestone' },
  { id: 'recruiter', name: 'Top Recruiter', icon: 'Briefcase', desc: 'Job postings' },
  { id: 'alumni_year', name: 'Alumni of the Year', icon: 'Award', desc: 'Outstanding achievement' },
] as const

export const JOB_ICONS: Record<string, string> = {
  Technology: 'Laptop',
  Finance: 'TrendingUp',
  Healthcare: 'Heart',
  Design: 'Palette',
  Marketing: 'Megaphone',
  Engineering: 'Wrench',
  Education: 'BookOpen',
  Legal: 'Scale',
  Science: 'FlaskConical',
  Media: 'Radio',
}
