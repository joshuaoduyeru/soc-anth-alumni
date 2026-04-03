import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/soc-anth-alumni'

if (!process.env.MONGODB_URI && process.env.NODE_ENV === 'production') {
  throw new Error('Please add MONGODB_URI to your environment variables')
}
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function createClientPromise(): Promise<MongoClient> {
  const mongoClient = new MongoClient(uri, options)
  return mongoClient.connect()
}

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable so that the value
  // is preserved across module reloads caused by HMR
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production, create the promise lazily
  clientPromise = createClientPromise()
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
