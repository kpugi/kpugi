import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';

export interface ClientAuditLocation {
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  flag?: string;
  latitude?: string;
  longitude?: string;
  formatted: string;
}

export interface ClientAuditInfo {
  ip: string;
  userAgent: string;
  browser: string;       // e.g. "Chrome 128"
  os: string;            // e.g. "Windows 11" or "iOS 17"
  device: string;        // "desktop" | "mobile" | "tablet" | "server"
  deviceModel?: string;  // e.g. "iPhone 15 Pro", "Samsung SM-G998B"
  location: ClientAuditLocation;
  isInternal: boolean;
}

// Common ISO 3166-1 alpha-2 country names mapping
const COMMON_COUNTRY_NAMES: Record<string, string> = {
  NG: 'Nigeria',
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  GH: 'Ghana',
  KE: 'Kenya',
  ZA: 'South Africa',
  DE: 'Germany',
  FR: 'France',
  AE: 'United Arab Emirates',
  IN: 'India',
  BR: 'Brazil',
  AU: 'Australia',
  NL: 'Netherlands',
  IE: 'Ireland',
};

/**
 * Generate Unicode Flag Emoji from 2-letter Country Code (e.g. 'NG' -> '🇳🇬')
 */
export function getCountryFlag(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const clean = countryCode.toUpperCase();
  if (!/^[A-Z]{2}$/.test(clean)) return '🌐';
  const codePoints = clean.split('').map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Check if IP is private / local / loopback
 */
export function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  const clean = ip.replace(/^::ffff:/, '').trim();
  if (clean === '127.0.0.1' || clean === '::1' || clean === 'localhost') return true;
  if (clean.startsWith('fe80:') || clean.startsWith('fc00:')) return true;
  if (clean.startsWith('10.') || clean.startsWith('192.168.')) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(clean)) return true;
  return false;
}

/**
 * getClientAuditInfo()
 * Automatically extracts the client IP address, Browser, OS, Device,
 * and Geolocation from incoming Next.js request headers.
 * Safely fails without throwing in non-request environments (cron, background tasks).
 */
export async function getClientAuditInfo(): Promise<ClientAuditInfo> {
  let headerList: Headers | null = null;
  try {
    headerList = await headers();
  } catch {
    // Non-request context (e.g., background cron, CLI script, worker)
    return {
      ip: '127.0.0.1',
      userAgent: 'Internal System Engine',
      browser: 'System Process',
      os: 'Server OS',
      device: 'server',
      location: {
        country: 'System',
        countryCode: 'SYS',
        city: 'Internal',
        flag: '🖥️',
        formatted: '🖥️ System Engine (Internal Origin)',
      },
      isInternal: true,
    };
  }

  // 1. IP Address Resolution
  const forwardedFor = headerList.get('x-forwarded-for');
  const cfConnectingIp = headerList.get('cf-connecting-ip');
  const realIp = headerList.get('x-real-ip');
  const trueClientIp = headerList.get('true-client-ip');
  const clientIp = headerList.get('x-client-ip');

  let rawIp =
    (forwardedFor ? forwardedFor.split(',')[0].trim() : null) ||
    cfConnectingIp ||
    realIp ||
    trueClientIp ||
    clientIp ||
    '127.0.0.1';

  // Normalize IPv6 mapped IPv4 localhost
  if (rawIp.startsWith('::ffff:')) {
    rawIp = rawIp.replace('::ffff:', '');
  }
  if (rawIp === '::1') {
    rawIp = '127.0.0.1';
  }

  // 2. User-Agent Parsing (Browser, OS, Device)
  const userAgent = headerList.get('user-agent') || 'Unknown User-Agent';
  const parser = new UAParser(userAgent);
  const browserData = parser.getBrowser();
  const osData = parser.getOS();
  const deviceData = parser.getDevice();

  const browserName = browserData.name || 'Browser';
  const browserVersion = browserData.major || browserData.version?.split('.')[0] || '';
  const formattedBrowser = browserVersion ? `${browserName} ${browserVersion}` : browserName;

  const osName = osData.name || 'OS';
  const osVersion = osData.version || '';
  const formattedOs = osVersion ? `${osName} ${osVersion}` : osName;

  const deviceType = (deviceData.type || 'desktop').toLowerCase();
  const deviceModel =
    deviceData.model && deviceData.vendor
      ? `${deviceData.vendor} ${deviceData.model}`
      : deviceData.model || undefined;

  // 3. Geolocation Resolution
  // Check standard CDN & Edge headers (Vercel & Cloudflare inject these natively)
  const countryCode = (
    headerList.get('x-vercel-ip-country') ||
    headerList.get('cf-ipcountry') ||
    headerList.get('x-country-code') ||
    ''
  ).toUpperCase();

  const city =
    headerList.get('x-vercel-ip-city') ||
    headerList.get('cf-ipcity') ||
    headerList.get('x-city') ||
    undefined;

  const region =
    headerList.get('x-vercel-ip-country-region') ||
    headerList.get('cf-region') ||
    headerList.get('x-region') ||
    undefined;

  const latitude = headerList.get('x-vercel-ip-latitude') || undefined;
  const longitude = headerList.get('x-vercel-ip-longitude') || undefined;

  const isLocal = isPrivateIp(rawIp);
  const flag = isLocal ? '💻' : getCountryFlag(countryCode);
  const countryName = countryCode ? COMMON_COUNTRY_NAMES[countryCode] || countryCode : undefined;

  let formattedLocation = 'Unknown Location';
  if (isLocal) {
    formattedLocation = '💻 Localhost (Dev Environment)';
  } else if (city && countryName) {
    formattedLocation = `${flag} ${decodeURIComponent(city)}, ${countryName}`;
  } else if (countryName) {
    formattedLocation = `${flag} ${countryName}`;
  } else if (countryCode) {
    formattedLocation = `${flag} ${countryCode}`;
  }

  const location: ClientAuditLocation = {
    city: city ? decodeURIComponent(city) : undefined,
    region: region ? decodeURIComponent(region) : undefined,
    country: countryName,
    countryCode: countryCode || undefined,
    flag,
    latitude,
    longitude,
    formatted: formattedLocation,
  };

  return {
    ip: rawIp,
    userAgent,
    browser: formattedBrowser,
    os: formattedOs,
    device: deviceType,
    deviceModel,
    location,
    isInternal: isLocal,
  };
}
