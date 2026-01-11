import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bettorSchema } from '@/lib/validations'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Validate DATABASE_URL before using Prisma
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set')
      return NextResponse.json(
        { error: 'MISSING_DATABASE_URL', detail: 'Database connection is not configured' },
        { status: 500 }
      )
    }

    const bettors = await prisma.bettor.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(bettors)
  } catch (error: any) {
    console.error('Error fetching bettors:', error)
    const errorMessage = error?.message || 'Unknown database error'
    const safeMessage = errorMessage.includes('DATABASE_URL') 
      ? 'Database connection error'
      : 'Failed to fetch bettors'
    
    return NextResponse.json(
      { error: 'DB_ERROR', detail: safeMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate DATABASE_URL before using Prisma
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set')
      return NextResponse.json(
        { error: 'MISSING_DATABASE_URL', detail: 'Database connection is not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const validated = bettorSchema.parse(body)

    const bettor = await prisma.bettor.create({
      data: {
        name: validated.name,
        profileUrl: validated.profileUrl,
      },
    })

    return NextResponse.json(bettor, { status: 201 })
  } catch (error: any) {
    console.error('Error creating bettor:', error)
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', detail: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    // Handle database errors
    const errorMessage = error?.message || 'Unknown database error'
    const safeMessage = errorMessage.includes('DATABASE_URL')
      ? 'Database connection error'
      : 'Failed to create bettor'
    
    return NextResponse.json(
      { error: 'DB_ERROR', detail: safeMessage },
      { status: 500 }
    )
  }
}
