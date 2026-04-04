import mongoose, { Connection } from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI environment variable')
}

let cached: { conn: Connection | null; promise: Promise<Connection> | null } = {
  conn: null,
  promise: null,
}

/**
 * Connect to MongoDB using Mongoose
 * Uses caching pattern to reuse connections between serverless function invocations
 * @returns Promise<Connection>
 */
export async function connectDB(): Promise<Connection> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 1,
    }).then((mongoose) => {
      return mongoose.connection
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

/**
 * Disconnect from MongoDB
 * Useful for testing or cleanup
 */
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await cached.conn.close()
    cached.conn = null
    cached.promise = null
  }
}
