import { z } from 'zod'

export const bettorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  profileUrl: z.string().url('Must be a valid URL'),
})

export const betSchema = z.object({
  placedAt: z.string().datetime(),
  description: z.string().min(1, 'Description is required'),
  sport: z.string().optional(),
  oddsAmerican: z.number().int('Odds must be an integer'),
  stakeUnits: z.number().positive('Stake must be positive'),
  result: z.enum(['PENDING', 'WIN', 'LOSS', 'PUSH', 'VOID']).default('PENDING'),
  notes: z.string().optional(),
})

export const betUpdateSchema = betSchema.partial().extend({
  id: z.string().uuid(),
})
