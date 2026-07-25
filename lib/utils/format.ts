/**
 * Formats a number to a compact string (e.g. 2,500,000 -> 2.5m, 1,500 -> 1.5k)
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    const formatted = (num / 1000000).toFixed(1);
    return formatted.endsWith('.0') ? `${formatted.slice(0, -2)}m` : `${formatted}m`;
  }
  if (num >= 1000) {
    const formatted = (num / 1000).toFixed(1);
    return formatted.endsWith('.0') ? `${formatted.slice(0, -2)}k` : `${formatted}k`;
  }
  return num.toString();
}

/**
 * Formats currency values in Naira using compact formatting (e.g. ₦2.5m, ₦1.5k)
 */
export function formatCompactCurrency(num: number): string {
  return `₦${formatCompactNumber(num)}`;
}
