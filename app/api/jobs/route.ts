import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Job, AuditLog } from '@/models'
import { Types } from 'mongoose'

/**
 * GET /api/jobs
 * Fetch all active jobs with optional filters
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { industry, type, remote, status } = Object.fromEntries(
      new URL(req.url).searchParams
    )

    const query: any = {
      status: status || 'active',
      expiresAt: { $gte: new Date() },
    }

    if (industry) query.industry = industry
    if (type) query.type = type
    if (remote) query.remote = remote

    const jobs = await Job.find(query)
      .populate('postedBy', 'firstName lastName company')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(
      jobs.map((job: any) => ({
        id: job._id.toString(),
        title: job.title,
        company: job.company,
        description: job.description,
        type: job.type,
        remote: job.remote,
        location: job.location,
        salaryRange: job.salaryRange,
        industry: job.industry,
        tags: job.tags,
        applicationDeadline: job.applicationDeadline,
        expiresAt: job.expiresAt,
        postedBy: job.postedBy,
        viewCount: job.viewCount,
        createdAt: job.createdAt,
      }))
    )
  } catch (error) {
    console.error('Failed to fetch jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/jobs
 * Create a new job posting (admin/employer only)
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const {
      title,
      company,
      description,
      type,
      remote,
      location,
      salaryRange,
      industry,
      tags,
      applicationUrl,
      applicationEmail,
      applicationDeadline,
      expiresAt,
      postedBy,
    } = await req.json()

    // Validate required fields
    if (!title || !company || !description || !type || !location || !industry || !postedBy) {
      return NextResponse.json(
        {
          error: 'Missing required fields: title, company, description, type, location, industry, postedBy',
        },
        { status: 400 }
      )
    }

    // Create job
    const job = await Job.create({
      title,
      company,
      description,
      type,
      remote: remote || 'Hybrid',
      location,
      salaryRange: salaryRange || null,
      currency: 'USD',
      industry,
      tags: tags || [],
      applicationUrl: applicationUrl || null,
      applicationEmail: applicationEmail || null,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      status: 'active',
      expiresAt: new Date(expiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      postedBy: new Types.ObjectId(postedBy),
      viewCount: 0,
    })

    // Log audit
    await AuditLog.create({
      actor: new Types.ObjectId(postedBy),
      actorRole: 'admin',
      action: 'job.created',
      targetModel: 'Job',
      targetId: job._id,
      newState: {
        title: job.title,
        company: job.company,
        industry: job.industry,
      },
    }).catch(console.error)

    return NextResponse.json(
      {
        id: job._id.toString(),
        title: job.title,
        company: job.company,
        status: job.status,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Failed to create job:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}
