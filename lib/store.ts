import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface Alumni {
  _id?: string
  id?: number
  firstName: string
  lastName: string
  email: string
  password?: string
  year: number
  degree: string
  major?: string
  company?: string
  currentJob?: string
  jobTitle?: string
  phone?: string
  location?: string
  linkedin?: string
  bio?: string
  skills?: string[]
  isVerified?: boolean
  isMentor?: boolean
  isAdmin?: boolean
}

export interface Event {
  _id?: string
  id?: number
  title: string
  date: string
  time: string
  location?: string
  description?: string
  maxAttendees?: number
  capacity?: number
  registeredCount?: number
  type: string
}

export interface Job {
  _id?: string
  id?: number
  title: string
  company: string
  location?: string
  type: string
  salary?: string
  industry?: string
  description?: string
  requirements?: string[]
  link?: string
  deadline?: string
  postedBy?: string
  isActive?: boolean
}

export interface Mentor {
  _id?: string
  id?: number
  alumniId: string | number
  expertise: string
  experience?: string
  availability: string
  industry?: string
  bio?: string
}

export interface Badge {
  _id?: string
  id?: number
  alumniId?: string | number
  name?: string
  type?: string
  icon?: string
  color?: string
  description?: string
  reason?: string
  date?: string
}

export interface Communication {
  _id?: string
  id?: number
  subject: string
  body: string
  recipient: string
  recipientLabel: string
  count: number
  ts: string
}

export interface EventRegistration {
  eventId: string | number
  userId: string | number | null
  ts: string
}

export interface MentorRequest {
  mentorId: string | number
  userId: string | number | null
  ts: string
}

export interface User {
  _id?: string
  email: string
  role: 'admin' | 'alumni'
  name: string
  firstName?: string
  lastName?: string
  id?: string | number | null
  isAdmin?: boolean
}

export const BADGE_DEFINITIONS = [
  { id: 'pioneer', name: 'Pioneer Member', icon: 'Rocket', desc: 'First to register' },
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

// Local fallback data (used when API is unavailable)
const fallbackAlumni: Alumni[] = [
  { id: 1, firstName: 'Adebayo', lastName: 'Okonkwo', email: 'alumni@example.com', year: 2018, degree: "BSc", major: 'Sociology', company: 'Nigerian Institute of Social Research', jobTitle: 'Social Research Analyst', phone: '+234 801 234 5678', location: 'Lagos, Nigeria', linkedin: 'https://linkedin.com/in/adebayo', bio: 'Passionate about using sociological research to drive social change in Nigeria.', role: 'alumni' },
  { id: 2, firstName: 'Chidinma', lastName: 'Eze', email: 'c.eze@oauife.edu.ng', year: 2015, degree: "MSc", major: 'Anthropology', company: 'UNESCO Nigeria', jobTitle: 'Cultural Heritage Consultant', phone: '+234 802 345 6789', location: 'Abuja, Nigeria', bio: 'Dedicated to preserving Nigerian cultural heritage through anthropological research.', role: 'alumni' },
  { id: 3, firstName: 'Oluwaseun', lastName: 'Adeyemi', email: 'o.adeyemi@oauife.edu.ng', year: 2020, degree: "BSc", major: 'Sociology', company: 'ActionAid Nigeria', jobTitle: 'Community Development Officer', phone: '+234 803 456 7890', location: 'Ile-Ife, Nigeria', bio: 'Working to empower communities through participatory development approaches.', role: 'alumni' },
]

const fallbackEvents: Event[] = [
  { id: 1, title: 'OAU-SAN Annual Homecoming 2024', description: 'Join us for the annual homecoming celebration at Obafemi Awolowo University.', date: '2024-11-15', time: '10:00 AM', location: 'OAU Campus, Ile-Ife', type: 'Reunion', capacity: 500, registeredCount: 234 },
  { id: 2, title: 'Career Development Workshop', description: 'A workshop focused on career advancement strategies for sociology and anthropology graduates.', date: '2024-10-20', time: '2:00 PM', location: 'Virtual (Zoom)', type: 'Workshop', capacity: 100, registeredCount: 67 },
]

const fallbackJobs: Job[] = [
  { id: 1, title: 'Senior Research Analyst', company: 'Nigerian Bureau of Statistics', location: 'Abuja, Nigeria', type: 'Full-time', description: 'Lead research projects on demographic and social statistics.', requirements: ['MSc in Sociology or related field', '5+ years experience'], salary: 'N450,000 - N600,000/month', deadline: '2024-11-30', isActive: true },
  { id: 2, title: 'Community Engagement Coordinator', company: 'World Bank Nigeria', location: 'Lagos, Nigeria', type: 'Full-time', description: 'Coordinate community engagement activities for development projects.', requirements: ['BSc in Sociology/Anthropology', '3+ years in community development'], salary: 'N350,000 - N500,000/month', deadline: '2024-12-15', isActive: true },
]

const fallbackBadges: Badge[] = [
  { id: 1, name: 'Pioneer Member', description: 'One of the first 100 members to join OAU-SAN', icon: 'Award', color: 'gold' },
  { id: 2, name: 'Active Mentor', description: 'Mentored 5+ alumni members', icon: 'Users', color: 'blue' },
  { id: 3, name: 'Event Champion', description: 'Attended 10+ OAU-SAN events', icon: 'Calendar', color: 'green' },
]

interface AlumniStore {
  // Data
  alumni: Alumni[]
  events: Event[]
  jobs: Job[]
  mentors: Mentor[]
  badges: Badge[]
  communications: Communication[]
  eventRegistrations: EventRegistration[]
  mentorRequests: MentorRequest[]
  savedJobs: (string | number)[]
  
  // Loading states
  isLoading: boolean
  
  // Auth
  currentUser: User | null
  
  // Actions
  setCurrentUser: (user: User | null) => void
  logout: () => void
  
  // Data fetching
  fetchAlumni: () => Promise<void>
  fetchEvents: () => Promise<void>
  fetchJobs: () => Promise<void>
  fetchBadges: () => Promise<void>
  seedDatabase: () => Promise<{ success: boolean; message: string }>
  
  // Alumni CRUD
  addAlumni: (alumni: Omit<Alumni, '_id' | 'id'>) => Promise<Alumni | null>
  updateAlumni: (id: string | number, data: Partial<Alumni>) => Promise<boolean>
  deleteAlumni: (id: string | number) => Promise<boolean>
  
  // Events CRUD
  addEvent: (event: Omit<Event, '_id' | 'id'>) => Promise<Event | null>
  updateEvent: (id: string | number, data: Partial<Event>) => Promise<boolean>
  deleteEvent: (id: string | number) => Promise<boolean>
  registerEvent: (eventId: string | number, userId: string | number | null) => void
  unregisterEvent: (eventId: string | number, userId: string | number | null) => void
  
  // Jobs CRUD
  addJob: (job: Omit<Job, '_id' | 'id'>) => Promise<Job | null>
  updateJob: (id: string | number, data: Partial<Job>) => Promise<boolean>
  deleteJob: (id: string | number) => Promise<boolean>
  toggleSaveJob: (jobId: string | number) => void
  
  // Mentors
  addMentor: (mentor: Omit<Mentor, '_id' | 'id'>) => void
  requestMentorship: (mentorId: string | number, userId: string | number | null) => void
  
  // Badges
  awardBadge: (badge: Omit<Badge, '_id' | 'id' | 'date'>) => void
  
  // Communications
  sendNewsletter: (comm: Omit<Communication, '_id' | 'id' | 'ts'>) => void
}

export const useAlumniStore = create<AlumniStore>()(
  persist(
    (set, get) => ({
      // Initial data (fallback)
      alumni: fallbackAlumni,
      events: fallbackEvents,
      jobs: fallbackJobs,
      mentors: [],
      badges: fallbackBadges,
      communications: [],
      eventRegistrations: [],
      mentorRequests: [],
      savedJobs: [],
      currentUser: null,
      isLoading: false,
      
      setCurrentUser: (user) => set({ currentUser: user }),
      
      logout: () => set({ currentUser: null }),
      
      // Fetch from API
      fetchAlumni: async () => {
        set({ isLoading: true })
        try {
          const res = await fetch('/api/alumni')
          if (res.ok) {
            const data = await res.json()
            if (data.length > 0) {
              set({ alumni: data })
            }
          }
        } catch (error) {
          console.error('Failed to fetch alumni:', error)
        } finally {
          set({ isLoading: false })
        }
      },
      
      fetchEvents: async () => {
        try {
          const res = await fetch('/api/events')
          if (res.ok) {
            const data = await res.json()
            if (data.length > 0) {
              set({ events: data })
            }
          }
        } catch (error) {
          console.error('Failed to fetch events:', error)
        }
      },
      
      fetchJobs: async () => {
        try {
          const res = await fetch('/api/jobs')
          if (res.ok) {
            const data = await res.json()
            if (data.length > 0) {
              set({ jobs: data })
            }
          }
        } catch (error) {
          console.error('Failed to fetch jobs:', error)
        }
      },
      
      fetchBadges: async () => {
        try {
          const res = await fetch('/api/badges')
          if (res.ok) {
            const data = await res.json()
            if (data.length > 0) {
              set({ badges: data })
            }
          }
        } catch (error) {
          console.error('Failed to fetch badges:', error)
        }
      },
      
      seedDatabase: async () => {
        try {
          const res = await fetch('/api/seed', { method: 'POST' })
          if (res.ok) {
            // Refetch all data after seeding
            await get().fetchAlumni()
            await get().fetchEvents()
            await get().fetchJobs()
            await get().fetchBadges()
            return { success: true, message: 'Database seeded successfully' }
          }
          return { success: false, message: 'Failed to seed database' }
        } catch (error) {
          console.error('Failed to seed database:', error)
          return { success: false, message: 'Failed to seed database' }
        }
      },
      
      // Alumni CRUD
      addAlumni: async (data) => {
        try {
          const res = await fetch('/api/alumni', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          if (res.ok) {
            const newAlumni = await res.json()
            set((state) => ({ alumni: [...state.alumni, newAlumni] }))
            return newAlumni
          }
        } catch (error) {
          console.error('Failed to add alumni:', error)
        }
        // Fallback to local
        const localAlumni = { ...data, id: Date.now(), role: 'alumni' as const }
        set((state) => ({ alumni: [...state.alumni, localAlumni] }))
        return localAlumni
      },
      
      updateAlumni: async (id, data) => {
        try {
          const res = await fetch(`/api/alumni/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          if (res.ok) {
            const updated = await res.json()
            set((state) => ({
              alumni: state.alumni.map((a) => 
                (a._id === id || a.id === id) ? { ...a, ...updated } : a
              )
            }))
            return true
          }
        } catch (error) {
          console.error('Failed to update alumni:', error)
        }
        // Fallback to local
        set((state) => ({
          alumni: state.alumni.map((a) => 
            (a._id === id || a.id === id) ? { ...a, ...data } : a
          )
        }))
        return true
      },
      
      deleteAlumni: async (id) => {
        try {
          const res = await fetch(`/api/alumni/${id}`, { method: 'DELETE' })
          if (res.ok) {
            set((state) => ({
              alumni: state.alumni.filter((a) => a._id !== id && a.id !== id)
            }))
            return true
          }
        } catch (error) {
          console.error('Failed to delete alumni:', error)
        }
        // Fallback to local
        set((state) => ({
          alumni: state.alumni.filter((a) => a._id !== id && a.id !== id)
        }))
        return true
      },
      
      // Events CRUD
      addEvent: async (data) => {
        try {
          const res = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          if (res.ok) {
            const newEvent = await res.json()
            set((state) => ({ events: [...state.events, newEvent] }))
            return newEvent
          }
        } catch (error) {
          console.error('Failed to add event:', error)
        }
        const localEvent = { ...data, id: Date.now() }
        set((state) => ({ events: [...state.events, localEvent] }))
        return localEvent
      },
      
      updateEvent: async (id, data) => {
        try {
          const res = await fetch(`/api/events/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          if (res.ok) {
            const updated = await res.json()
            set((state) => ({
              events: state.events.map((e) => 
                (e._id === id || e.id === id) ? { ...e, ...updated } : e
              )
            }))
            return true
          }
        } catch (error) {
          console.error('Failed to update event:', error)
        }
        set((state) => ({
          events: state.events.map((e) => 
            (e._id === id || e.id === id) ? { ...e, ...data } : e
          )
        }))
        return true
      },
      
      deleteEvent: async (id) => {
        try {
          const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
          if (res.ok) {
            set((state) => ({
              events: state.events.filter((e) => e._id !== id && e.id !== id),
              eventRegistrations: state.eventRegistrations.filter((r) => r.eventId !== id)
            }))
            return true
          }
        } catch (error) {
          console.error('Failed to delete event:', error)
        }
        set((state) => ({
          events: state.events.filter((e) => e._id !== id && e.id !== id),
          eventRegistrations: state.eventRegistrations.filter((r) => r.eventId !== id)
        }))
        return true
      },
      
      registerEvent: (eventId, userId) => set((state) => ({
        eventRegistrations: [...state.eventRegistrations, { eventId, userId, ts: new Date().toISOString() }]
      })),
      
      unregisterEvent: (eventId, userId) => set((state) => ({
        eventRegistrations: state.eventRegistrations.filter((r) => !(r.eventId === eventId && r.userId === userId))
      })),
      
      // Jobs CRUD
      addJob: async (data) => {
        try {
          const res = await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          if (res.ok) {
            const newJob = await res.json()
            set((state) => ({ jobs: [...state.jobs, newJob] }))
            return newJob
          }
        } catch (error) {
          console.error('Failed to add job:', error)
        }
        const localJob = { ...data, id: Date.now() }
        set((state) => ({ jobs: [...state.jobs, localJob] }))
        return localJob
      },
      
      updateJob: async (id, data) => {
        try {
          const res = await fetch(`/api/jobs/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          if (res.ok) {
            const updated = await res.json()
            set((state) => ({
              jobs: state.jobs.map((j) => 
                (j._id === id || j.id === id) ? { ...j, ...updated } : j
              )
            }))
            return true
          }
        } catch (error) {
          console.error('Failed to update job:', error)
        }
        set((state) => ({
          jobs: state.jobs.map((j) => 
            (j._id === id || j.id === id) ? { ...j, ...data } : j
          )
        }))
        return true
      },
      
      deleteJob: async (id) => {
        try {
          const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
          if (res.ok) {
            set((state) => ({
              jobs: state.jobs.filter((j) => j._id !== id && j.id !== id),
              savedJobs: state.savedJobs.filter((jid) => jid !== id)
            }))
            return true
          }
        } catch (error) {
          console.error('Failed to delete job:', error)
        }
        set((state) => ({
          jobs: state.jobs.filter((j) => j._id !== id && j.id !== id),
          savedJobs: state.savedJobs.filter((jid) => jid !== id)
        }))
        return true
      },
      
      toggleSaveJob: (jobId) => set((state) => ({
        savedJobs: state.savedJobs.includes(jobId) 
          ? state.savedJobs.filter((id) => id !== jobId)
          : [...state.savedJobs, jobId]
      })),
      
      // Mentors (local for now)
      addMentor: (data) => set((state) => ({
        mentors: [...state.mentors, { ...data, id: Date.now() }]
      })),
      
      requestMentorship: (mentorId, userId) => set((state) => ({
        mentorRequests: [...state.mentorRequests, { mentorId, userId, ts: new Date().toISOString() }]
      })),
      
      // Badges (local for now)
      awardBadge: (data) => set((state) => ({
        badges: [...state.badges, { ...data, id: Date.now(), date: new Date().toISOString() }]
      })),
      
      // Communications (local for now)
      sendNewsletter: (data) => set((state) => ({
        communications: [...state.communications, { ...data, id: Date.now(), ts: new Date().toISOString() }]
      })),
    }),
    {
      name: 'oau-san-store',
    }
  )
)
