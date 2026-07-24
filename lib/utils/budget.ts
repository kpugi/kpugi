/**
 * Estimates budget reservation for a submission based on creator's follower count and campaign CPM.
 * Defaults to estimating 2x min follower view conversion or a fixed 2,000-view slot ceiling.
 */
export function calculateBudgetReservation(
  followerCount: number = 5000,
  cpmRate: number = 2000,
  remainingBudget: number
): number {
  // Estimate baseline expected views (minimum 1,000 views)
  const estimatedViews = Math.max(1000, Math.min(10000, Math.round(followerCount * 0.2)));
  const estimatedAmount = (estimatedViews / 1000) * cpmRate;

  // Cap reservation at the campaign's remaining unreserved budget
  return Math.min(estimatedAmount, remainingBudget);
}
