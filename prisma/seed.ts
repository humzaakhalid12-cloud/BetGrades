import { PrismaClient } from '@prisma/client'
import { BetResult } from '../lib/types'
import { calculateProfit } from '../lib/utils'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create sample bettor
  const bettor = await prisma.bettor.create({
    data: {
      name: 'Sample Bettor',
      profileUrl: 'https://example.com/profile',
    },
  })

  console.log('Created bettor:', bettor.name)

  // Create sample bets
  const betData = [
    {
      placedAt: new Date('2024-01-15'),
      description: 'Lakers ML',
      sport: 'NBA',
      oddsAmerican: -110,
      stakeUnits: 1.0,
      result: 'WIN' as BetResult,
    },
    {
      placedAt: new Date('2024-01-16'),
      description: 'Chiefs -7.5',
      sport: 'NFL',
      oddsAmerican: -120,
      stakeUnits: 1.5,
      result: 'LOSS' as BetResult,
    },
    {
      placedAt: new Date('2024-01-17'),
      description: 'Over 214.5',
      sport: 'NBA',
      oddsAmerican: +150,
      stakeUnits: 1.0,
      result: 'WIN' as BetResult,
    },
    {
      placedAt: new Date('2024-01-18'),
      description: 'Bruins ML',
      sport: 'NHL',
      oddsAmerican: -130,
      stakeUnits: 2.0,
      result: 'PENDING' as BetResult,
    },
    {
      placedAt: new Date('2024-01-19'),
      description: 'Dodgers ML',
      sport: 'MLB',
      oddsAmerican: +200,
      stakeUnits: 1.0,
      result: 'LOSS' as BetResult,
    },
  ]

  for (const bet of betData) {
    const profitUnits = calculateProfit(bet.oddsAmerican, bet.stakeUnits, bet.result)
    await prisma.bet.create({
      data: {
        bettorId: bettor.id,
        ...bet,
        profitUnits,
      },
    })
  }

  console.log(`Created ${betData.length} sample bets`)
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
