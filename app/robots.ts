import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/c/',
          '/b/',
          '/dashboard/',
          '/settings/',
          '/wallet/',
          '/submissions/',
          '/accounts/',
          '/earnings/',
          '/onboarding/',
          '/admin/',
        ],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-campaigns.xml`,
    ],
  };
}
