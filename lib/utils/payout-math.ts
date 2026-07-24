export const DEFAULT_CPM_RATE = 2000; // ₦2,000 / 1,000 views
export const PLATFORM_COMMISSION_RATE = 0.10; // 10%
export const MIN_VIEW_THRESHOLD = 1000;

export interface PayoutCalculation {
  grossAmount: number;
  creatorPayout: number;
  commissionAmount: number;
  isEligible: boolean;
}

/**
 * Calculates creator payout and platform commission based on verified views and CPM rate.
 * Hard cliff: Returns ₦0 if verified views < 1,000.
 */
export function calculatePayout(
  verifiedViews: number,
  cpmRate: number = DEFAULT_CPM_RATE
): PayoutCalculation {
  if (verifiedViews < MIN_VIEW_THRESHOLD) {
    return {
      grossAmount: 0,
      creatorPayout: 0,
      commissionAmount: 0,
      isEligible: false,
    };
  }

  const grossAmount = (verifiedViews / 1000) * cpmRate;
  const commissionAmount = grossAmount * PLATFORM_COMMISSION_RATE;
  const creatorPayout = grossAmount - commissionAmount;

  return {
    grossAmount,
    creatorPayout,
    commissionAmount,
    isEligible: true,
  };
}
