import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface Alumni {
  id: number
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
  id: number
  title: string
  date: string
  time: string
  location?: string
  description?: string
  maxAttendees?: number
  type: 'In-Person' | 'Virtual' | 'Hybrid'
}

export interface Job {
  id: number
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
  id: number
  alumniId: number
  expertise: string
  experience?: string
  availability: 'Weekly' | 'Bi-weekly' | 'Monthly'
  industry?: string
  bio?: string
}

export interface Badge {
  id: number
  alumniId: number
  type: string
  reason?: string
  date: string
}

export interface Communication {
  id: number
  subject: string
  body: string
  recipient: string
  recipientLabel: string
  count: number
  ts: string
}

export interface EventRegistration {
  eventId: number
  userId: number | null
  ts: string
}

export interface MentorRequest {
  mentorId: number
  userId: number | null
  ts: string
}

export interface User {
  email: string
  role: 'admin' | 'alumni'
  name: string
  id: number | null
}

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

// Initial seed data
const initialAlumni: Alumni[] = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'alumni@example.com', year: 2018, degree: "Bachelor's", major: 'Computer Science', company: 'Google', jobTitle: 'Senior Software Engineer', phone: '+1 415 555 0100', location: 'San Francisco, CA', linkedin: 'https://linkedin.com/in/johndoe', bio: 'Passionate about distributed systems and open-source contributions. Love hiking on weekends.', role: 'alumni' },
  { id: 2, firstName: 'Sarah', lastName: 'Chen', email: 's.chen@alumni.edu', year: 2019, degree: "Master's", major: 'Data Science', company: 'Meta', jobTitle: 'Data Scientist', phone: '+1 628 555 0200', location: 'Menlo Park, CA', bio: 'Building the future of AI-powered products. ML research enthusiast.', role: 'alumni' },
  { id: 3, firstName: 'Marcus', lastName: 'Williams', email: 'm.w@alumni.edu', year: 2016, degree: "PhD", major: 'Electrical Engineering', company: 'Tesla', jobTitle: 'Principal Engineer', phone: '+1 310 555 0300', location: 'Austin, TX', linkedin: 'https://linkedin.com/in/mwilliams', bio: 'EV propulsion and power systems expert. Filed 12 patents.', role: 'alumni' },
  { id: 4, firstName: 'Priya', lastName: 'Sharma', email: 'p.sharma@alumni.edu', year: 2021, degree: "Bachelor's", major: 'Finance', company: 'Goldman Sachs', jobTitle: 'Investment Analyst', phone: '+1 212 555 0400', location: 'New York, NY', bio: 'Early-career finance professional. CFA Level 2 candidate.', role: 'alumni' },
  { id: 5, firstName: 'Lucas', lastName: 'Müller', email: 'l.muller@alumni.edu', year: 2020, degree: "Master's", major: 'Marketing', company: 'Spotify', jobTitle: 'Growth Marketing Manager', phone: '+49 30 555 0500', location: 'Berlin, Germany', bio: 'Music & growth marketing. Obsessed with data-driven campaigns.', role: 'alumni' },
  { id: 6, firstName: 'Aisha', lastName: 'Okonkwo', email: 'a.ok@alumni.edu', year: 2017, degree: "PhD", major: 'Biomedical Engineering', company: 'Pfizer', jobTitle: 'Research Scientist', phone: '+1 212 555 0600', location: 'New York, NY', bio: 'Drug delivery and biotech research. Co-authored 8 publications.', role: 'alumni' },
  { id: 7, firstName: 'Tomás', lastName: 'Rivera', email: 't.r@alumni.edu', year: 2022, degree: "Bachelor's", major: 'Architecture', company: 'Foster + Partners', jobTitle: 'Junior Architect', phone: '+44 20 555 0700', location: 'London, UK', bio: 'Sustainable design and urban planning advocate.', role: 'alumni' },
  { id: 8, firstName: 'Emily', lastName: 'Park', email: 'e.park@alumni.edu', year: 2015, degree: "Master's", major: 'Psychology', company: 'McKinsey', jobTitle: 'Senior Consultant', phone: '+1 312 555 0800', location: 'Chicago, IL', bio: 'Helping organisations navigate complex change. Executive coach.', role: 'alumni' },
  { id: 9, firstName: 'Raj', lastName: 'Patel', email: 'r.patel@alumni.edu', year: 2023, degree: "Bachelor's", major: 'Economics', company: 'Stripe', jobTitle: 'Business Analyst', phone: '+1 415 555 0900', location: 'San Francisco, CA', bio: 'Fintech and economic modelling. Recent grad, loving it so far.', role: 'alumni' },
  { id: 10, firstName: 'Natasha', lastName: 'Ivanova', email: 'n.iv@alumni.edu', year: 2014, degree: "PhD", major: 'Mathematics', company: 'Jane Street', jobTitle: 'Quantitative Researcher', phone: '+1 212 555 1000', location: 'New York, NY', bio: 'Pure math meets financial markets. Former olympiad competitor.', role: 'alumni' },
  { id: 11, firstName: 'Omar', lastName: 'Hassan', email: 'o.h@alumni.edu', year: 2020, degree: "Bachelor's", major: 'Civil Engineering', company: 'AECOM', jobTitle: 'Infrastructure Engineer', phone: '+971 4 555 1100', location: 'Dubai, UAE', bio: 'Building infrastructure for growing cities across the Middle East.', role: 'alumni' },
  { id: 12, firstName: 'Yuki', lastName: 'Tanaka', email: 'y.t@alumni.edu', year: 2019, degree: "Master's", major: 'Robotics', company: 'Boston Dynamics', jobTitle: 'Robotics Engineer', phone: '+1 617 555 1200', location: 'Waltham, MA', bio: 'Legged locomotion and motion planning. Robot whisperer.', role: 'alumni' },
  { id: 13, firstName: 'Grace', lastName: 'Adeyemi', email: 'g.a@alumni.edu', year: 2021, degree: "Bachelor's", major: 'Journalism', company: 'BBC', jobTitle: 'Digital Journalist', phone: '+44 20 555 1300', location: 'London, UK', bio: 'Covering tech and society for the BBC Digital team.', role: 'alumni' },
  { id: 14, firstName: 'Henrik', lastName: 'Larsson', email: 'h.l@alumni.edu', year: 2016, degree: "PhD", major: 'Climate Science', company: 'NOAA', jobTitle: 'Climate Researcher', phone: '+1 301 555 1400', location: 'Washington, DC', bio: 'Ocean-atmosphere interactions and climate modelling.', role: 'alumni' },
  { id: 15, firstName: 'Maya', lastName: 'Johnson', email: 'm.j@alumni.edu', year: 2018, degree: "Master's", major: 'Graphic Design', company: 'Apple', jobTitle: 'Product Designer', phone: '+1 408 555 1500', location: 'Cupertino, CA', bio: 'Design systems and human-centred design at Apple. Former freelancer.', role: 'alumni' },
  { id: 16, firstName: 'Carlos', lastName: 'Mendoza', email: 'c.m@alumni.edu', year: 2017, degree: "Bachelor's", major: 'Business Administration', company: 'Amazon', jobTitle: 'Product Manager', phone: '+1 206 555 1600', location: 'Seattle, WA', bio: 'PM at Amazon Logistics. Passionate about last-mile delivery innovation.', role: 'alumni' },
  { id: 17, firstName: 'Sophie', lastName: 'Dubois', email: 's.d@alumni.edu', year: 2020, degree: "Master's", major: 'International Relations', company: 'UN', jobTitle: 'Policy Analyst', phone: '+41 22 555 1700', location: 'Geneva, Switzerland', bio: 'Working on global sustainability frameworks at the United Nations.', role: 'alumni' },
  { id: 18, firstName: 'Kwame', lastName: 'Asante', email: 'k.a@alumni.edu', year: 2019, degree: "PhD", major: 'Computer Vision', company: 'NVIDIA', jobTitle: 'Research Scientist', phone: '+1 408 555 1800', location: 'Santa Clara, CA', bio: 'GPU-accelerated computer vision and autonomous driving perception.', role: 'alumni' },
]

const initialBadges: Badge[] = [
  { id: 101, alumniId: 1, type: 'pioneer', reason: 'First registered alumni.', date: '2024-01-10T10:00:00Z' },
  { id: 102, alumniId: 1, type: 'mentor', reason: 'Led 6 mentorship sessions in Q1 2024.', date: '2024-03-05T10:00:00Z' },
  { id: 103, alumniId: 2, type: 'speaker', reason: 'Keynoted AI in Industry webinar.', date: '2024-06-20T10:00:00Z' },
  { id: 104, alumniId: 3, type: 'career', reason: 'Promoted to Principal Engineer at Tesla.', date: '2024-09-01T10:00:00Z' },
  { id: 105, alumniId: 10, type: 'alumni_year', reason: 'Outstanding contributions in 2024.', date: '2024-12-31T10:00:00Z' },
  { id: 106, alumniId: 8, type: 'networker', reason: 'Connected 40+ alumni to new opportunities.', date: '2025-01-15T10:00:00Z' },
  { id: 107, alumniId: 6, type: 'volunteer', reason: 'Organised 3 campus recruitment events.', date: '2025-02-10T10:00:00Z' },
  { id: 108, alumniId: 15, type: 'recruiter', reason: 'Posted 5 design roles, 3 filled by alumni.', date: '2025-03-01T10:00:00Z' },
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
  savedJobs: number[]
  
  // Auth
  currentUser: User | null
  
  // Actions
  setCurrentUser: (user: User | null) => void
  
  // Alumni CRUD
  addAlumni: (alumni: Omit<Alumni, 'id' | 'role'>) => void
  updateAlumni: (id: number, data: Partial<Alumni>) => void
  deleteAlumni: (id: number) => void
  
  // Events CRUD
  addEvent: (event: Omit<Event, 'id'>) => void
  updateEvent: (id: number, data: Partial<Event>) => void
  deleteEvent: (id: number) => void
  registerEvent: (eventId: number, userId: number | null) => void
  unregisterEvent: (eventId: number, userId: number | null) => void
  
  // Jobs CRUD
  addJob: (job: Omit<Job, 'id'>) => void
  updateJob: (id: number, data: Partial<Job>) => void
  deleteJob: (id: number) => void
  toggleSaveJob: (jobId: number) => void
  
  // Mentors
  addMentor: (mentor: Omit<Mentor, 'id'>) => void
  requestMentorship: (mentorId: number, userId: number | null) => void
  
  // Badges
  awardBadge: (badge: Omit<Badge, 'id' | 'date'>) => void
  
  // Communications
  sendNewsletter: (comm: Omit<Communication, 'id' | 'ts'>) => void
}

export const useAlumniStore = create<AlumniStore>()(
  persist(
    (set, get) => ({
      // Initial data
      alumni: initialAlumni,
      events: [],
      jobs: [],
      mentors: [],
      badges: initialBadges,
      communications: [],
      eventRegistrations: [],
      mentorRequests: [],
      savedJobs: [],
      currentUser: null,
      
      setCurrentUser: (user) => set({ currentUser: user }),
      
      // Alumni
      addAlumni: (data) => set((state) => ({
        alumni: [...state.alumni, { ...data, id: Date.now(), role: 'alumni' as const }]
      })),
      updateAlumni: (id, data) => set((state) => ({
        alumni: state.alumni.map((a) => a.id === id ? { ...a, ...data } : a)
      })),
      deleteAlumni: (id) => set((state) => ({
        alumni: state.alumni.filter((a) => a.id !== id)
      })),
      
      // Events
      addEvent: (data) => set((state) => ({
        events: [...state.events, { ...data, id: Date.now() }]
      })),
      updateEvent: (id, data) => set((state) => ({
        events: state.events.map((e) => e.id === id ? { ...e, ...data } : e)
      })),
      deleteEvent: (id) => set((state) => ({
        events: state.events.filter((e) => e.id !== id),
        eventRegistrations: state.eventRegistrations.filter((r) => r.eventId !== id)
      })),
      registerEvent: (eventId, userId) => set((state) => ({
        eventRegistrations: [...state.eventRegistrations, { eventId, userId, ts: new Date().toISOString() }]
      })),
      unregisterEvent: (eventId, userId) => set((state) => ({
        eventRegistrations: state.eventRegistrations.filter((r) => !(r.eventId === eventId && r.userId === userId))
      })),
      
      // Jobs
      addJob: (data) => set((state) => ({
        jobs: [...state.jobs, { ...data, id: Date.now() }]
      })),
      updateJob: (id, data) => set((state) => ({
        jobs: state.jobs.map((j) => j.id === id ? { ...j, ...data } : j)
      })),
      deleteJob: (id) => set((state) => ({
        jobs: state.jobs.filter((j) => j.id !== id),
        savedJobs: state.savedJobs.filter((jid) => jid !== id)
      })),
      toggleSaveJob: (jobId) => set((state) => ({
        savedJobs: state.savedJobs.includes(jobId) 
          ? state.savedJobs.filter((id) => id !== jobId)
          : [...state.savedJobs, jobId]
      })),
      
      // Mentors
      addMentor: (data) => set((state) => ({
        mentors: [...state.mentors, { ...data, id: Date.now() }]
      })),
      requestMentorship: (mentorId, userId) => set((state) => ({
        mentorRequests: [...state.mentorRequests, { mentorId, userId, ts: new Date().toISOString() }]
      })),
      
      // Badges
      awardBadge: (data) => set((state) => ({
        badges: [...state.badges, { ...data, id: Date.now(), date: new Date().toISOString() }]
      })),
      
      // Communications
      sendNewsletter: (data) => set((state) => ({
        communications: [...state.communications, { ...data, id: Date.now(), ts: new Date().toISOString() }]
      })),
    }),
    {
      name: 'alumni-store',
    }
  )
)
