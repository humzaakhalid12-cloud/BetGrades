import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bettorSchema } from '@/lib/validations'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const bettors = await prisma.bettor.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(bettors)
  } catch (error) {
    console.error('Error fetching bettors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bettors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create bettor' },
      { status: 500 }
    )
  }
}
