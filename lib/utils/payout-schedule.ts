/**
 * Payout Schedule Utilities
 * Calculates weekly Friday batch clearance cycles according to platform policy:
 * Any withdrawal requested less than 7 full days before the upcoming Friday
 * rolls over to the following Friday's disbursement batch.
 */

export function calculateScheduledFridayBatch(inputDate: Date = new Date()): Date {
  const d = new Date(inputDate);
  const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat

  // Days until upcoming Friday (0 to 6)
  let daysUntilUpcomingFriday = (5 - dayOfWeek + 7) % 7;

  // If days until the upcoming Friday is less than 7, roll over to following Friday
  let daysToAdd = daysUntilUpcomingFriday;
  if (daysToAdd < 7) {
    daysToAdd += 7;
  }

  const targetFriday = new Date(d);
  targetFriday.setDate(d.getDate() + daysToAdd);
  targetFriday.setHours(12, 0, 0, 0); // 12:00 PM batch time
  return targetFriday;
}

export function formatScheduledFriday(date: string | Date | null | undefined): string {
  if (!date) return 'Next Friday Batch';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Next Friday Batch';
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
