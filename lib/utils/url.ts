/**
 * Constructs a safe prelander external redirect URL for all outbound third-party links
 */
export function getSafeExternalUrl(targetUrl: string): string {
  if (!targetUrl) return '#';

  // If already relative or internal, return as-is
  if (targetUrl.startsWith('/') || targetUrl.startsWith('mailto:') || targetUrl.startsWith('tel:')) {
    return targetUrl;
  }

  try {
    const parsed = new URL(targetUrl);
    // If it's an internal domain, don't wrap in prelander
    if (parsed.hostname.endsWith('kpugi.com') || parsed.hostname === 'localhost') {
      return targetUrl;
    }
  } catch (e) {
    // If invalid URL structure, fallback
    return targetUrl;
  }

  // Use go.kpugi.com subdomain in production or /go?url=... in dev
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    return `https://go.kpugi.com/?url=${encodeURIComponent(targetUrl)}`;
  }

  return `/go?url=${encodeURIComponent(targetUrl)}`;
}
