import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateProfit } from '@/lib/utils'
import { BetResult } from '@/lib/types'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const betUpdateSchema = z.object({
  description: z.string().optional(),
  sport: z.string().optional().nullable(),
  oddsAmerican: z.number().int().optional(),
  stakeUnits: z.number().positive().optional(),
  result: z.enum(['PENDING', 'WIN', 'LOSS', 'PUSH', 'VOID']).optional(),
  placedAt: z.string().datetime().optional(),
  notes: z.string().optional().nullable(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const validated = betUpdateSchema.parse(body)

    // Get existing bet to calculate new profit
    const existingBet = await prisma.bet.findUnique({
      where: { id },
    })

    if (!existingBet) {
      return NextResponse.json(
        { error: 'Bet not found' },
        { status: 404 }
      )
    }

    const odds = validated.oddsAmerican ?? existingBet.oddsAmerican
    const stake = validated.stakeUnits ?? existingBet.stakeUnits
    const result = (validated.result as BetResult) ?? existingBet.result

    const profitUnits = calculateProfit(odds, stake, result)

    const updateData: any = {
      ...validated,
      profitUnits,
    }

    if (validated.placedAt) {
      updateData.placedAt = new Date(validated.placedAt)
    }

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    )

    const bet = await prisma.bet.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(bet)
  } catch (error: any) {
    console.error('Error updating bet:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update bet' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.bet.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bet:', error)
    return NextResponse.json(
      { error: 'Failed to delete bet' },
      { status: 500 }
    )
  }
}
