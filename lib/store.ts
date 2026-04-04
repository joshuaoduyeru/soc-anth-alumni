import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Export types from models
import type { IUser } from '@/lib/models/accounts/User.model'
import type { IEvent } from '@/lib/models/events/Event.model'
import type { IJob } from '@/lib/models/jobs/Job.model'
import type { IBadge } from '@/lib/models/badges/Badge.model'
import { BADGE_TYPES } from '@/lib/models/badges/Badge.model'

// Re-export badge definitions for use in components
export { BADGE_TYPES as BADGE_DEFINITIONS }

// Export types for components
export type Alumni = any
export type Event = any
export type Job = any
export type Badge = any

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  role: 'admin' | 'alumni'
  isAdmin: boolean
  avatarUrl?: string
  company?: string
  jobTitle?: string
}

interface AlumniStore {
  // Data
  alumni: any[]
  events: any[]
  jobs: any[]
  badges: any[]
  mentors: any[]
  eventRegistrations: any[]

  // Loading states
  isLoading: boolean
  error: string | null

  // Auth
  currentUser: User | null

  // Actions
  setCurrentUser: (user: User | null) => void
  logout: () => void

  // Data fetching
  fetchAlumni: () => Promise<void>
  fetchEvents: (status?: string) => Promise<void>
  fetchJobs: (filters?: Record<string, string>) => Promise<void>
  fetchBadges: (userId?: string) => Promise<void>
  fetchMentors: () => Promise<void>
  seedDatabase: () => Promise<{ success: boolean; message: string }>

  // Alumni CRUD
  addAlumni: (data: any) => void
  updateAlumni: (id: string, data: any) => void
  deleteAlumni: (id: string) => void

  // Events CRUD
  addEvent: (data: any) => void
  updateEvent: (id: string, data: any) => void
  deleteEvent: (id: string) => void

  // Jobs CRUD
  addJob: (data: any) => void
  updateJob: (id: string, data: any) => void
  deleteJob: (id: string) => void

  // Admin actions
  promoteToAdmin: (userId: string) => Promise<boolean>
  removeAdminPrivileges: (userId: string) => Promise<boolean>
  fetchAdmins: () => Promise<void>

  // Event registration
  registerEvent: (eventId: string) => Promise<boolean>
  unregisterEvent: (eventId: string) => Promise<boolean>

  // Job save
  toggleSaveJob: (jobId: string) => Promise<boolean>
}

export const useAlumniStore = create<AlumniStore>()(
  persist(
    (set, get) => ({
      // Initial data
      alumni: [],
      events: [],
      jobs: [],
      badges: [],
      mentors: [],
      eventRegistrations: [],
      currentUser: null,
      isLoading: false,
      error: null,

      setCurrentUser: (user) => set({ currentUser: user }),

      logout: () => set({ currentUser: null }),

      // Fetch alumni
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
          console.error('Failed to fetch alumni:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      // Fetch events
      fetchEvents: async (status) => {
        set({ isLoading: true, error: null })
        try {
          const url = new URL('/api/events', typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
          if (status) url.searchParams.set('status', status)
          const res = await fetch(url.toString())
          if (res.ok) {
            const data = await res.json()
            set({ events: data })
          } else {
            throw new Error('Failed to fetch events')
          }
        } catch (error: any) {
          set({ error: error.message })
          console.error('Failed to fetch events:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      // Fetch jobs
      fetchJobs: async (filters) => {
        set({ isLoading: true, error: null })
        try {
          const url = new URL('/api/jobs', typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
          if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
              url.searchParams.set(key, value)
            })
          }
          const res = await fetch(url.toString())
          if (res.ok) {
            const data = await res.json()
            set({ jobs: data })
          } else {
            throw new Error('Failed to fetch jobs')
          }
        } catch (error: any) {
          set({ error: error.message })
          console.error('Failed to fetch jobs:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      // Fetch badges
      fetchBadges: async (userId) => {
        set({ isLoading: true, error: null })
        try {
          const url = new URL('/api/badges', typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
          if (userId) url.searchParams.set('userId', userId)
          const res = await fetch(url.toString())
          if (res.ok) {
            const data = Array.isArray(res.json) ? await res.json() : []
            set({ badges: data })
          }
        } catch (error: any) {
          console.error('Failed to fetch badges:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      // Fetch mentors
      fetchMentors: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/mentorship')
          if (res.ok) {
            const data = await res.json()
            set({ mentors: data })
          } else {
            throw new Error('Failed to fetch mentors')
          }
        } catch (error: any) {
          set({ error: error.message })
          console.error('Failed to fetch mentors:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      // Seed database
      seedDatabase: async () => {
        try {
          const res = await fetch('/api/seed', { method: 'POST' })
          if (res.ok) {
            const data = await res.json()
            // Refetch all data after seeding
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
          console.error('Failed to seed database:', error)
          return { success: false, message: error.message }
        }
      },

      // Admin - Promote to admin
      promoteToAdmin: async (userId) => {
        try {
          const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              adminId: get().currentUser?.id,
            }),
          })
          if (res.ok) {
            return true
          }
          throw new Error('Failed to promote user')
        } catch (error) {
          console.error('Failed to promote to admin:', error)
          return false
        }
      },

      // Admin - Remove admin privileges
      removeAdminPrivileges: async (userId) => {
        try {
          const url = new URL('/api/admin', typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
          url.searchParams.set('userId', userId)
          url.searchParams.set('adminId', get().currentUser?.id || '')
          const res = await fetch(url.toString(), { method: 'DELETE' })
          if (res.ok) {
            return true
          }
          throw new Error('Failed to remove admin privileges')
        } catch (error) {
          console.error('Failed to remove admin privileges:', error)
          return false
        }
      },

      // Fetch admins
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

      // Event registration
      registerEvent: async (eventId) => {
        try {
          const res = await fetch('/api/events/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventId,
              userId: get().currentUser?.id,
            }),
          })
          return res.ok
        } catch (error) {
          console.error('Failed to register for event:', error)
          return false
        }
      },

      // Save/unsave job
      toggleSaveJob: async (jobId) => {
        try {
          const res = await fetch('/api/jobs/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jobId,
              userId: get().currentUser?.id,
            }),
          })
          return res.ok
        } catch (error) {
          console.error('Failed to toggle save job:', error)
          return false
        }
      },

      // Alumni CRUD stub functions
      addAlumni: (data) => {
        console.log('Add alumni stub:', data)
        // TODO: Implement API call to add alumni
      },

      updateAlumni: (id, data) => {
        console.log('Update alumni stub:', id, data)
        // TODO: Implement API call to update alumni
      },

      deleteAlumni: (id) => {
        console.log('Delete alumni stub:', id)
        // TODO: Implement API call to delete alumni
      },

      // Events CRUD stub functions
      addEvent: (data) => {
        console.log('Add event stub:', data)
        // TODO: Implement API call to add event
      },

      updateEvent: (id, data) => {
        console.log('Update event stub:', id, data)
        // TODO: Implement API call to update event
      },

      deleteEvent: (id) => {
        console.log('Delete event stub:', id)
        // TODO: Implement API call to delete event
      },

      // Jobs CRUD stub functions
      addJob: (data) => {
        console.log('Add job stub:', data)
        // TODO: Implement API call to add job
      },

      updateJob: (id, data) => {
        console.log('Update job stub:', id, data)
        // TODO: Implement API call to update job
      },

      deleteJob: (id) => {
        console.log('Delete job stub:', id)
        // TODO: Implement API call to delete job
      },

      // Unregister from event
      unregisterEvent: async (eventId) => {
        try {
          const res = await fetch('/api/events/unregister', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventId,
              userId: get().currentUser?.id,
            }),
          })
          return res.ok
        } catch (error) {
          console.error('Failed to unregister from event:', error)
          return false
        }
      },
    }),
    {
      name: 'oau-san-store',
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
)
