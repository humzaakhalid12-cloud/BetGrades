import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { betSchema } from '@/lib/validations'
import { calculateProfit } from '@/lib/utils'
import { BetResult } from '@/lib/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify bettor exists
    const bettor = await prisma.bettor.findUnique({
      where: { id: params.id },
    })

    if (!bettor) {
      return NextResponse.json(
        { error: 'Bettor not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validated = betSchema.parse(body)

    const result = validated.result as BetResult
    const profitUnits = calculateProfit(
      validated.oddsAmerican,
      validated.stakeUnits,
      result
    )

    const bet = await prisma.bet.create({
      data: {
        bettorId: params.id,
        placedAt: new Date(validated.placedAt),
        description: validated.description,
        sport: validated.sport || null,
        oddsAmerican: validated.oddsAmerican,
        stakeUnits: validated.stakeUnits,
        result,
        profitUnits,
        notes: validated.notes || null,
      },
    })

    return NextResponse.json(bet, { status: 201 })
  } catch (error: any) {
    console.error('Error creating bet:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create bet' },
      { status: 500 }
    )
  }
}
