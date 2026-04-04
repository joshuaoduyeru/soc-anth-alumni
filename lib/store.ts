import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { BADGE_TYPES } from '@/lib/models/badges/Badge.model'

// Re-export badge definitions for use in components
export { BADGE_TYPES as BADGE_DEFINITIONS }

// ─── Shared types ────────────────────────────────────────────────────────────

export interface User {
  _id?: string
  email: string
  firstName: string
  lastName: string
  /** Computed full name — kept for convenience */
  name: string
  fullName: string
  role: 'admin' | 'alumni'
  isAdmin: boolean
  avatarUrl?: string
  company?: string
  jobTitle?: string
}

export type Alumni = {
  _id?: string
  firstName: string
  lastName: string
  email: string
  year: number
  degree: string
  major?: string
  company?: string
  jobTitle?: string
  phone?: string
  location?: string
  linkedin?: string
  bio?: string
  [key: string]: any
}

export type Event = {
  _id?: string
  title: string
  date: string
  time: string
  location?: string
  description?: string
  maxAttendees?: number | string
  type: string
  [key: string]: any
}

export type Job = {
  _id?: string
  title: string
  company: string
  location?: string
  type: string
  salary?: string
  industry?: string
  description?: string
  link?: string
  [key: string]: any
}

export type Badge = {
  _id?: string
  alumniId?: string
  type?: string
  badgeType?: string
  reason?: string
  date?: string
  awardedAt?: string
  [key: string]: any
}

export type Mentor = {
  _id?: string
  alumniId?: string
  expertise: string
  experience?: string | number
  availability: 'Weekly' | 'Bi-weekly' | 'Monthly'
  industry?: string
  bio?: string
  [key: string]: any
}

export type MentorRequest = {
  _id?: string
  mentorId?: string
  userId?: string
  menteeId?: string
  status?: string
  [key: string]: any
}

export type EventRegistration = {
  _id?: string
  eventId?: string
  userId?: string
  [key: string]: any
}

export type Communication = {
  _id?: string
  subject: string
  body: string
  recipient: string
  recipientLabel: string
  count: number
  ts: string
  [key: string]: any
}

// ─── Icon map (previously JOB_ICONS, kept for backwards compat) ──────────────

export const JOB_ICONS: Record<string, string> = {
  Technology: '💻',
  Finance: '📈',
  Healthcare: '❤️',
  Design: '🎨',
  Marketing: '📣',
  Engineering: '🔧',
  Education: '📚',
  Legal: '⚖️',
  Science: '🔬',
  Media: '📻',
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface AlumniStore {
  // ── Data ───────────────────────────────────────────────────────────────────
  alumni: Alumni[]
  events: Event[]
  jobs: Job[]
  badges: Badge[]
  mentors: Mentor[]
  mentorRequests: MentorRequest[]
  eventRegistrations: EventRegistration[]
  communications: Communication[]
  savedJobs: string[]

  // ── Loading / error ────────────────────────────────────────────────────────
  isLoading: boolean
  error: string | null

  // ── Auth ───────────────────────────────────────────────────────────────────
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  logout: () => void

  // ── Data fetching ──────────────────────────────────────────────────────────
  fetchAlumni: () => Promise<void>
  fetchEvents: (status?: string) => Promise<void>
  fetchJobs: (filters?: Record<string, string>) => Promise<void>
  fetchBadges: (userId?: string) => Promise<void>
  fetchMentors: () => Promise<void>
  seedDatabase: () => Promise<{ success: boolean; message: string }>

  // ── Alumni CRUD ────────────────────────────────────────────────────────────
  addAlumni: (data: any) => Promise<Alumni | null>
  updateAlumni: (id: string | number, data: any) => Promise<void>
  deleteAlumni: (id: string | number) => Promise<void>

  // ── Events CRUD ────────────────────────────────────────────────────────────
  addEvent: (data: any) => Promise<void>
  updateEvent: (id: string | number, data: any) => Promise<void>
  deleteEvent: (id: string | number) => Promise<void>

  // ── Jobs CRUD ──────────────────────────────────────────────────────────────
  addJob: (data: any) => Promise<void>
  updateJob: (id: string | number, data: any) => Promise<void>
  deleteJob: (id: string | number) => Promise<void>

  // ── Badges ─────────────────────────────────────────────────────────────────
  awardBadge: (data: { alumniId: string | number; type: string; reason?: string }) => Promise<boolean>

  // ── Mentors ────────────────────────────────────────────────────────────────
  addMentor: (data: Omit<Mentor, '_id'>) => void
  requestMentorship: (mentorId: string | number, userId: string | number | null) => void

  // ── Event registration ─────────────────────────────────────────────────────
  registerEvent: (eventId: string | number, userId: string | null) => void
  unregisterEvent: (eventId: string | number, userId: string | null) => void

  // ── Communications ─────────────────────────────────────────────────────────
  sendNewsletter: (data: {
    subject: string
    body: string
    recipient: string
    recipientLabel: string
    count: number
  }) => Promise<boolean>

  // ── Job save ───────────────────────────────────────────────────────────────
  toggleSaveJob: (jobId: string) => Promise<boolean>

  // ── Admin ──────────────────────────────────────────────────────────────────
  promoteToAdmin: (userId: string) => Promise<boolean>
  removeAdminPrivileges: (userId: string) => Promise<boolean>
  fetchAdmins: () => Promise<void>
}

// ─── Store implementation ─────────────────────────────────────────────────────

export const useAlumniStore = create<AlumniStore>()(
  persist(
    (set, get) => ({
      // ── Initial state ───────────────────────────────────────────────────────
      alumni: [],
      events: [],
      jobs: [],
      badges: [],
      mentors: [],
      mentorRequests: [],
      eventRegistrations: [],
      communications: [],
      savedJobs: [],
      currentUser: null,
      isLoading: false,
      error: null,

      // ── Auth ────────────────────────────────────────────────────────────────
      setCurrentUser: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),

      // ── Alumni fetch ────────────────────────────────────────────────────────
      fetchAlumni: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/alumni')
          if (res.ok) {
            const data = await res.json()
            set({ alumni: data })
          } else {
            throw new Error('Failed to fetch alumni')
          }
        } catch (error: any) {
          set({ error: error.message })
        } finally {
          set({ isLoading: false })
        }
      },

      // ── Events fetch ────────────────────────────────────────────────────────
      fetchEvents: async (status) => {
        set({ isLoading: true, error: null })
        try {
          const url = new URL('/api/events', window.location.origin)
          if (status) url.searchParams.set('status', status)
          const res = await fetch(url.toString())
          if (res.ok) {
            const data = await res.json()
            // Normalise API shape → local shape expected by components
            set({
              events: data.map((e: any) => ({
                ...e,
                // components read e.date / e.time — map from startDate
                date: e.startDate ?? e.date,
                time: e.startDate
                  ? new Date(e.startDate).toTimeString().slice(0, 5)
                  : e.time ?? '',
              })),
            })
          } else {
            throw new Error('Failed to fetch events')
          }
        } catch (error: any) {
          set({ error: error.message })
        } finally {
          set({ isLoading: false })
        }
      },

      // ── Jobs fetch ──────────────────────────────────────────────────────────
      fetchJobs: async (filters) => {
        set({ isLoading: true, error: null })
        try {
          const url = new URL('/api/jobs', window.location.origin)
          if (filters) {
            Object.entries(filters).forEach(([k, v]) => url.searchParams.set(k, v))
          }
          const res = await fetch(url.toString())
          if (res.ok) {
            const data = await res.json()
            set({
              jobs: data.map((j: any) => ({
                ...j,
                // components read j.salary — map from salaryRange
                salary: j.salaryRange ?? j.salary,
                link: j.applicationUrl ?? j.link,
              })),
            })
          } else {
            throw new Error('Failed to fetch jobs')
          }
        } catch (error: any) {
          set({ error: error.message })
        } finally {
          set({ isLoading: false })
        }
      },

      // ── Badges fetch ────────────────────────────────────────────────────────
      fetchBadges: async (userId) => {
        set({ isLoading: true, error: null })
        try {
          const url = new URL('/api/badges', window.location.origin)
          if (userId) url.searchParams.set('userId', userId)
          const res = await fetch(url.toString())
          if (res.ok) {
            const data = await res.json()
            const badges = Array.isArray(data) ? data : []
            set({
              badges: badges.map((b: any) => ({
                ...b,
                // components use b.type — map from badgeType
                type: b.badgeType ?? b.type,
                // components use b.alumniId — map from recipient
                alumniId: b.recipient ?? b.alumniId,
                // components use b.date — map from awardedAt
                date: b.awardedAt ?? b.date,
              })),
            })
          }
        } catch (error: any) {
          console.error('Failed to fetch badges:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      // ── Mentors fetch ────────────────────────────────────────────────────────
      fetchMentors: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/mentorship')
          if (res.ok) {
            const data = await res.json()
            set({ mentors: Array.isArray(data) ? data : [] })
          } else {
            throw new Error('Failed to fetch mentors')
          }
        } catch (error: any) {
          set({ error: error.message })
        } finally {
          set({ isLoading: false })
        }
      },

      // ── Seed ────────────────────────────────────────────────────────────────
      seedDatabase: async () => {
        try {
          const res = await fetch('/api/seed', { method: 'POST' })
          if (res.ok) {
            await Promise.all([
              get().fetchAlumni(),
              get().fetchEvents(),
              get().fetchJobs(),
              get().fetchBadges(),
              get().fetchMentors(),
            ])
            return { success: true, message: 'Database seeded successfully' }
          }
          return { success: false, message: 'Failed to seed database' }
        } catch (error: any) {
          return { success: false, message: error.message }
        }
      },

      // ── Alumni CRUD ─────────────────────────────────────────────────────────
      addAlumni: async (data) => {
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          if (res.ok) {
            const newAlumni = await res.json()
            // Refresh list
            await get().fetchAlumni()
            return newAlumni
          }
          return null
        } catch (error) {
          console.error('Failed to add alumni:', error)
          return null
        }
      },

      updateAlumni: async (id, data) => {
        try {
          await fetch(`/api/alumni/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          await get().fetchAlumni()
        } catch (error) {
          console.error('Failed to update alumni:', error)
        }
      },

      deleteAlumni: async (id) => {
        try {
          await fetch(`/api/alumni/${id}`, { method: 'DELETE' })
          set((state) => ({
            alumni: state.alumni.filter((a) => a._id !== id),
          }))
        } catch (error) {
          console.error('Failed to delete alumni:', error)
        }
      },

      // ── Events CRUD ─────────────────────────────────────────────────────────
      addEvent: async (data) => {
        try {
          const res = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...data,
              startDate: data.date,
              endDate: data.date,
              createdBy: get().currentUser?.id,
            }),
          })
          if (res.ok) await get().fetchEvents()
        } catch (error) {
          console.error('Failed to add event:', error)
        }
      },

      updateEvent: async (id, data) => {
        try {
          await fetch(`/api/events/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          await get().fetchEvents()
        } catch (error) {
          console.error('Failed to update event:', error)
        }
      },

      deleteEvent: async (id) => {
        try {
          await fetch(`/api/events/${id}`, { method: 'DELETE' })
          set((state) => ({
            events: state.events.filter((e) => e._id !== id),
          }))
        } catch (error) {
          console.error('Failed to delete event:', error)
        }
      },

      // ── Jobs CRUD ────────────────────────────────────────────────────────────
      addJob: async (data) => {
        try {
          const res = await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...data,
              salaryRange: data.salary,
              applicationUrl: data.link,
              postedBy: get().currentUser?.id,
            }),
          })
          if (res.ok) await get().fetchJobs()
        } catch (error) {
          console.error('Failed to add job:', error)
        }
      },

      updateJob: async (id, data) => {
        try {
          await fetch(`/api/jobs/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          await get().fetchJobs()
        } catch (error) {
          console.error('Failed to update job:', error)
        }
      },

      deleteJob: async (id) => {
        try {
          await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
          set((state) => ({
            jobs: state.jobs.filter((j) => j._id !== id),
          }))
        } catch (error) {
          console.error('Failed to delete job:', error)
        }
      },

      // ── Badges ───────────────────────────────────────────────────────────────
      awardBadge: async (data) => {
        try {
          const res = await fetch('/api/badges', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientId: data.alumniId,
              badgeType: data.type,
              reason: data.reason ?? null,
              awardedBy: get().currentUser?.id,
            }),
          })
          if (res.ok) {
            await get().fetchBadges()
            return true
          }
          return false
        } catch (error) {
          console.error('Failed to award badge:', error)
          return false
        }
      },

      // ── Mentors ──────────────────────────────────────────────────────────────
      addMentor: (data) => {
        // Optimistic local add (API integration can be wired later)
        const newMentor = { ...data } as Mentor
        set((state) => ({ mentors: [...state.mentors, newMentor] }))
      },

      requestMentorship: (mentorId, userId) => {
        const newReq: MentorRequest = {
          mentorId,
          userId: userId ?? undefined,
          status: 'pending',
        }
        set((state) => ({ mentorRequests: [...state.mentorRequests, newReq] }))
      },

      // ── Event registration ────────────────────────────────────────────────────
      registerEvent: (eventId, userId) => {
        const newReg: EventRegistration = {
          eventId,
          userId: userId ?? undefined,
        }
        set((state) => ({ eventRegistrations: [...state.eventRegistrations, newReg] }))
      },

      unregisterEvent: (eventId, userId) => {
        set((state) => ({
          eventRegistrations: state.eventRegistrations.filter(
            (r) => !(r.eventId === eventId && r.userId === userId)
          ),
        }))
      },

      // ── Communications ────────────────────────────────────────────────────────
      sendNewsletter: async (data) => {
        try {
          const res = await fetch('/api/communications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subject: data.subject,
              body: data.body,
              recipientType: data.recipient,
              sentBy: get().currentUser?.id,
            }),
          })
          // Optimistic update so history shows immediately
          const comm: Communication = {
            ...data,
            ts: new Date().toISOString(),
          }
          set((state) => ({ communications: [...state.communications, comm] }))
          return res.ok
        } catch (error) {
          console.error('Failed to send newsletter:', error)
          return false
        }
      },

      // ── Job save ──────────────────────────────────────────────────────────────
      toggleSaveJob: async (jobId) => {
        // Optimistic toggle
        const isSaved = get().savedJobs.includes(jobId)
        set((state) => ({
          savedJobs: isSaved
            ? state.savedJobs.filter((id) => id !== jobId)
            : [...state.savedJobs, jobId],
        }))
        try {
          await fetch('/api/jobs/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId, userId: get().currentUser?.id }),
          })
          return true
        } catch (error) {
          // Revert on failure
          set((state) => ({
            savedJobs: isSaved
              ? [...state.savedJobs, jobId]
              : state.savedJobs.filter((id) => id !== jobId),
          }))
          return false
        }
      },

      // ── Admin ─────────────────────────────────────────────────────────────────
      promoteToAdmin: async (userId) => {
        try {
          const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, adminId: get().currentUser?.id }),
          })
          return res.ok
        } catch (error) {
          console.error('Failed to promote to admin:', error)
          return false
        }
      },

      removeAdminPrivileges: async (userId) => {
        try {
          const url = new URL('/api/admin', window.location.origin)
          url.searchParams.set('userId', userId)
          url.searchParams.set('adminId', get().currentUser?.id ?? '')
          const res = await fetch(url.toString(), { method: 'DELETE' })
          return res.ok
        } catch (error) {
          console.error('Failed to remove admin privileges:', error)
          return false
        }
      },

      fetchAdmins: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/admin')
          if (res.ok) {
            const data = await res.json()
            set({ alumni: data })
          }
        } catch (error: any) {
          set({ error: error.message })
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'oau-san-store',
      // Only persist auth — all data is re-fetched on load
      partialize: (state) => ({
        currentUser: state.currentUser,
        savedJobs: state.savedJobs,
        communications: state.communications,
        eventRegistrations: state.eventRegistrations,
        mentorRequests: state.mentorRequests,
        mentors: state.mentors,
      }),
    }
  )
)
