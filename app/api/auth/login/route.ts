import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import type { AlumniDoc, UserDoc } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const db = await getDatabase()
    
    // Check for admin user
    const adminUser = await db
      .collection<UserDoc>(COLLECTIONS.USERS)
      .findOne({ email: email.toLowerCase(), role: 'admin' })
    
    if (adminUser) {
      const validPassword = await bcrypt.compare(password, adminUser.password)
      if (validPassword) {
        return NextResponse.json({
          email: adminUser.email,
          role: 'admin',
          name: adminUser.name,
          id: adminUser._id!.toString()
        })
      }
    }
    
    // Check alumni
    const alumni = await db
      .collection<AlumniDoc>(COLLECTIONS.ALUMNI)
      .findOne({ email: email.toLowerCase() })
    
    if (alumni && alumni.password) {
      const validPassword = await bcrypt.compare(password, alumni.password)
      if (validPassword) {
        return NextResponse.json({
          email: alumni.email,
          role: 'alumni',
          name: `${alumni.firstName} ${alumni.lastName}`,
          id: alumni._id!.toString()
        })
      }
    }
    
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch (error) {
    console.error('Login failed:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
