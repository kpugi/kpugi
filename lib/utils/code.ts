/**
 * Generates a random 5-character alphanumeric uppercase code prefixed with KPG-
 * Excludes ambiguous characters: I, O, 0, 1
 */
export function generateCampaignCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KPG-${result}`;
}
