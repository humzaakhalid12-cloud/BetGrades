import { PrismaClient } from '@prisma/client'

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set. Please add it to your .env file or Vercel environment variables.'
  )
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if using Prisma Accelerate (prisma+postgres://)
const isAccelerate = process.env.DATABASE_URL?.startsWith('prisma+')

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    // Prisma Accelerate handles connection pooling automatically
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
