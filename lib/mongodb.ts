import { MongoClient, Db } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add MONGODB_URI to your environment variables')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable so that the value
  // is preserved across module reloads caused by HMR
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production, don't use a global variable
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db('oausan')
}

// Collection names
export const COLLECTIONS = {
  ALUMNI: 'alumni',
  EVENTS: 'events',
  JOBS: 'jobs',
  MENTORS: 'mentors',
  BADGES: 'badges',
  COMMUNICATIONS: 'communications',
  EVENT_REGISTRATIONS: 'event_registrations',
  MENTOR_REQUESTS: 'mentor_requests',
  USERS: 'users',
} as const
