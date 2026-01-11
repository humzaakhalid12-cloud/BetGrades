import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Lazy Prisma client creation - only instantiated when actually used
// This prevents build-time errors when DATABASE_URL is not available during static analysis
function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  // Only validate at runtime, not during build
  // During build, Next.js may not have access to environment variables
  if (typeof window === 'undefined' && process.env.DATABASE_URL) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    })
    return globalForPrisma.prisma
  }

  // If DATABASE_URL is missing at runtime, throw error
  if (typeof window === 'undefined' && !process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL environment variable is not set. Please add it to your .env file or Vercel environment variables.'
    )
  }

  // Fallback for build time - create client without validation
  // This will fail at runtime if DATABASE_URL is missing, but allows build to succeed
  globalForPrisma.prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
  return globalForPrisma.prisma
}

// Export a getter that creates the client lazily
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient()
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})
