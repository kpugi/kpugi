import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');

  const routes = [
    '',
    '/browse',
    '/about',
    '/pricing',
    '/creators',
    '/advertisers',
    '/faq',
    '/privacy',
    '/terms',
    '/sign-in',
    '/sign-up',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/browse' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : (route === '/browse' ? 0.9 : 0.8),
  }));
}
