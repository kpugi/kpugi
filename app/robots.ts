import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/settings/',
          '/wallet/',
          '/submissions/',
          '/accounts/',
          '/onboarding/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
