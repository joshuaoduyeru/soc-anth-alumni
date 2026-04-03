import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import type { AlumniDoc } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    
    const db = await getDatabase()
    
    // All users are alumni (some can also be admin)
    const alumni = await db
      .collection<AlumniDoc>(COLLECTIONS.ALUMNI)
      .findOne({ email: email.toLowerCase() })
    
    if (!alumni) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 401 })
    }
    
    if (!alumni.password) {
      return NextResponse.json({ error: 'Account not set up for login. Please contact admin.' }, { status: 401 })
    }
    
    const validPassword = await bcrypt.compare(password, alumni.password)
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
    
    return NextResponse.json({
      _id: alumni._id!.toString(),
      email: alumni.email,
      firstName: alumni.firstName,
      lastName: alumni.lastName,
      isAdmin: alumni.isAdmin || false,
      year: alumni.year,
      degree: alumni.degree,
      major: alumni.major,
    })
  } catch (error) {
    console.error('Login failed:', error)
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 })
  }
}
