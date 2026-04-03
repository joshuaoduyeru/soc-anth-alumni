import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

const initialAlumni = [
  {
    _id: new ObjectId(),
    firstName: "Adebayo",
    lastName: "Okonkwo",
    email: "adebayo.okonkwo@example.com",
    password: bcrypt.hashSync("password123", 10),
    year: 2018,
    degree: "BSc",
    major: "Sociology",
    currentJob: "Social Research Analyst",
    company: "Nigerian Institute of Social Research",
    location: "Lagos, Nigeria",
    bio: "Passionate about using sociological research to drive social change in Nigeria.",
    linkedin: "linkedin.com/in/adebayo-okonkwo",
    phone: "+234 801 234 5678",
    skills: ["Qualitative Research", "SPSS", "Data Analysis", "Policy Analysis"],
    isVerified: true,
    isMentor: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: new ObjectId(),
    firstName: "Chidinma",
    lastName: "Eze",
    email: "chidinma.eze@example.com",
    password: bcrypt.hashSync("password123", 10),
    year: 2015,
    degree: "MSc",
    major: "Anthropology",
    currentJob: "Cultural Heritage Consultant",
    company: "UNESCO Nigeria",
    location: "Abuja, Nigeria",
    bio: "Dedicated to preserving Nigerian cultural heritage through anthropological research.",
    linkedin: "linkedin.com/in/chidinma-eze",
    phone: "+234 802 345 6789",
    skills: ["Ethnography", "Cultural Documentation", "Heritage Conservation", "Grant Writing"],
    isVerified: true,
    isMentor: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: new ObjectId(),
    firstName: "Oluwaseun",
    lastName: "Adeyemi",
    email: "alumni@example.com",
    password: bcrypt.hashSync("alumni123", 10),
    year: 2020,
    degree: "BSc",
    major: "Sociology",
    currentJob: "Community Development Officer",
    company: "ActionAid Nigeria",
    location: "Ile-Ife, Nigeria",
    bio: "Working to empower communities through participatory development approaches.",
    linkedin: "linkedin.com/in/oluwaseun-adeyemi",
    phone: "+234 803 456 7890",
    skills: ["Community Organizing", "Project Management", "Advocacy", "M&E"],
    isVerified: true,
    isMentor: false,
    createdAt: new Date().toISOString(),
  },
]

const initialEvents = [
  {
    _id: new ObjectId(),
    title: "OAU-SAN Annual Homecoming 2024",
    description: "Join us for the annual homecoming celebration at Obafemi Awolowo University. Reconnect with classmates, meet current students, and celebrate our shared heritage.",
    date: "2024-11-15",
    time: "10:00 AM",
    location: "OAU Campus, Ile-Ife",
    type: "Reunion",
    capacity: 500,
    registeredCount: 234,
    createdAt: new Date().toISOString(),
  },
  {
    _id: new ObjectId(),
    title: "Career Development Workshop",
    description: "A workshop focused on career advancement strategies for sociology and anthropology graduates in the modern job market.",
    date: "2024-10-20",
    time: "2:00 PM",
    location: "Virtual (Zoom)",
    type: "Workshop",
    capacity: 100,
    registeredCount: 67,
    createdAt: new Date().toISOString(),
  },
  {
    _id: new ObjectId(),
    title: "Research Symposium: Social Change in Nigeria",
    description: "Present and discuss ongoing research on social transformation in contemporary Nigerian society.",
    date: "2024-12-05",
    time: "9:00 AM",
    location: "Conference Center, Lagos",
    type: "Conference",
    capacity: 200,
    registeredCount: 89,
    createdAt: new Date().toISOString(),
  },
]

const initialJobs = [
  {
    _id: new ObjectId(),
    title: "Senior Research Analyst",
    company: "Nigerian Bureau of Statistics",
    location: "Abuja, Nigeria",
    type: "Full-time",
    description: "Lead research projects on demographic and social statistics. Requires strong quantitative and qualitative research skills.",
    requirements: ["MSc in Sociology or related field", "5+ years experience", "SPSS/Stata proficiency"],
    salary: "N450,000 - N600,000/month",
    postedBy: "HR Department",
    createdAt: new Date().toISOString(),
    deadline: "2024-11-30",
    isActive: true,
  },
  {
    _id: new ObjectId(),
    title: "Community Engagement Coordinator",
    company: "World Bank Nigeria",
    location: "Lagos, Nigeria",
    type: "Full-time",
    description: "Coordinate community engagement activities for development projects across Nigeria.",
    requirements: ["BSc in Sociology/Anthropology", "3+ years in community development", "Fluent in Yoruba and/or Hausa"],
    salary: "N350,000 - N500,000/month",
    postedBy: "Recruitment Team",
    createdAt: new Date().toISOString(),
    deadline: "2024-12-15",
    isActive: true,
  },
  {
    _id: new ObjectId(),
    title: "Cultural Program Officer",
    company: "British Council Nigeria",
    location: "Lagos, Nigeria",
    type: "Full-time",
    description: "Develop and implement cultural exchange programs promoting Nigerian arts and heritage.",
    requirements: ["Degree in Anthropology or Cultural Studies", "2+ years in program management", "Strong communication skills"],
    salary: "N400,000 - N550,000/month",
    postedBy: "HR Team",
    createdAt: new Date().toISOString(),
    deadline: "2024-11-25",
    isActive: true,
  },
]

const initialBadges = [
  {
    _id: new ObjectId(),
    name: "Pioneer Member",
    description: "One of the first 100 members to join OAU-SAN",
    icon: "Award",
    color: "gold",
    createdAt: new Date().toISOString(),
  },
  {
    _id: new ObjectId(),
    name: "Active Mentor",
    description: "Mentored 5+ alumni members",
    icon: "Users",
    color: "blue",
    createdAt: new Date().toISOString(),
  },
  {
    _id: new ObjectId(),
    name: "Event Champion",
    description: "Attended 10+ OAU-SAN events",
    icon: "Calendar",
    color: "green",
    createdAt: new Date().toISOString(),
  },
  {
    _id: new ObjectId(),
    name: "Community Builder",
    description: "Referred 5+ new members to the network",
    icon: "Heart",
    color: "red",
    createdAt: new Date().toISOString(),
  },
]

const adminUser = {
  _id: new ObjectId(),
  firstName: "Admin",
  lastName: "User",
  email: "admin@example.com",
  password: bcrypt.hashSync("admin123", 10),
  role: "admin",
  createdAt: new Date().toISOString(),
}

export async function POST() {
  try {
    const client = await clientPromise
    const db = client.db("oau-san")
    
    // Clear existing data
    await db.collection("alumni").deleteMany({})
    await db.collection("events").deleteMany({})
    await db.collection("jobs").deleteMany({})
    await db.collection("badges").deleteMany({})
    await db.collection("admins").deleteMany({})
    
    // Insert seed data
    await db.collection("alumni").insertMany(initialAlumni)
    await db.collection("events").insertMany(initialEvents)
    await db.collection("jobs").insertMany(initialJobs)
    await db.collection("badges").insertMany(initialBadges)
    await db.collection("admins").insertOne(adminUser)
    
    return NextResponse.json({ 
      message: "Database seeded successfully",
      counts: {
        alumni: initialAlumni.length,
        events: initialEvents.length,
        jobs: initialJobs.length,
        badges: initialBadges.length,
        admins: 1,
      }
    })
  } catch (error) {
    console.error("Failed to seed database:", error)
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "POST to this endpoint to seed the database with initial data" 
  })
}
