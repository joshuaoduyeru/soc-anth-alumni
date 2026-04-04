import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongoose'
import { Job } from '@/models'

/**
 * GET /api/jobs/[id]
 * Get a single job posting
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params

    const job = await Job.findById(id)
      .populate('postedBy', 'firstName lastName email')
      .lean()

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({
      _id: job._id.toString(),
      title: job.title,
      company: job.company,
      description: job.description,
      type: job.type,
      remote: job.remote,
      location: job.location,
      salaryRange: job.salaryRange,
      industry: job.industry,
      tags: job.tags,
      postedBy: job.postedBy,
      expiresAt: job.expiresAt,
      createdAt: job.createdAt,
    })
  } catch (error) {
    console.error('Failed to fetch job:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/jobs/[id]
 * Update job posting (admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id: id } = await params
    const body = await req.json()

    const job = await Job.findByIdAndUpdate(id, body, { new: true })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      job: {
        _id: job._id.toString(),
        title: job.title,
        company: job.company,
      },
    })
  } catch (error) {
    console.error('Failed to update job:', error)
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/jobs/[id]
 * Delete job posting (admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id: id } = await params

    const job = await Job.findByIdAndDelete(id)

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete job:', error)
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    )
  }
}
