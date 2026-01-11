import { BetResult } from './types'

/**
 * Calculate profit units based on American odds, stake, and result
 */
export function calculateProfit(
  oddsAmerican: number,
  stakeUnits: number,
  result: BetResult
): number {
  if (result === 'WIN') {
    if (oddsAmerican > 0) {
      // Positive odds: profit = stake * (odds / 100)
      return stakeUnits * (oddsAmerican / 100)
    } else {
      // Negative odds: profit = stake * (100 / abs(odds))
      return stakeUnits * (100 / Math.abs(oddsAmerican))
    }
  } else if (result === 'LOSS') {
    return -stakeUnits
  } else {
    // PENDING, PUSH, VOID
    return 0
  }
}

/**
 * Format American odds as string (e.g., -110, +150)
 */
export function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`
}
