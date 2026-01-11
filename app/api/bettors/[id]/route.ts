import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bettor = await prisma.bettor.findUnique({
      where: { id: params.id },
      include: {
        bets: {
          orderBy: { placedAt: 'desc' },
        },
      },
    })

    if (!bettor) {
      return NextResponse.json(
        { error: 'Bettor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(bettor)
  } catch (error) {
    console.error('Error fetching bettor:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bettor' },
      { status: 500 }
    )
  }
}
