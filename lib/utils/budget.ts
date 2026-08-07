/**
 * Estimates budget reservation for a submission based on creator's follower count and campaign CPM.
 * Defaults to estimating 2x min follower view conversion or a fixed 2,000-view slot ceiling.
 */
export function calculateBudgetReservation(
  followerCount: number = 5000,
  cpmRate: number = 2000,
  remainingBudget: number = 100000,
  minViewThreshold: number = 1000
): number {
  // Base reservation for first-joiners is the minimum view threshold payout insurance
  const baseReservation = Math.max(cpmRate, Math.round((minViewThreshold / 1000) * cpmRate));

  // Cap reservation at the campaign's remaining unreserved budget
  return Math.min(baseReservation, remainingBudget);
}
