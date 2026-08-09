/**
 * Constructs a safe prelander external redirect URL for all outbound third-party links
 */
export function getSafeExternalUrl(targetUrl: string): string {
  if (!targetUrl) return '#';

  let rawUrl = targetUrl.trim();

  // If already relative or internal, return as-is
  if (rawUrl.startsWith('/') || rawUrl.startsWith('mailto:') || rawUrl.startsWith('tel:')) {
    return rawUrl;
  }

  // Ensure scheme exists
  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = `https://${rawUrl}`;
  }

  try {
    const parsed = new URL(rawUrl);
    // If it's an internal domain, don't wrap in prelander
    if (parsed.hostname.endsWith('kpugi.com') || parsed.hostname === 'localhost') {
      return rawUrl;
    }
  } catch (e) {
    return rawUrl;
  }

  // Use go.kpugi.com subdomain in production or /go?url=... in dev
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    return `https://go.kpugi.com/?url=${encodeURIComponent(rawUrl)}`;
  }

  return `/go?url=${encodeURIComponent(rawUrl)}`;
}
