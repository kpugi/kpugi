import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Press & Media Kit — Brand Assets & Logos | Kpugi',
  description: 'Download official Kpugi vector logos, brand marks, and press media kit assets.',
  alternates: {
    canonical: '/press',
  },
  openGraph: {
    title: 'Press & Media Kit | Kpugi',
    description: 'Download official Kpugi brand assets, logos, and executive press materials.',
    url: `${siteUrl}/press`,
    siteName: 'Kpugi',
    type: 'website',
  },
};

export default function PressPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${siteUrl}/press#webpage`,
      url: `${siteUrl}/press`,
      name: 'Press & Media Kit | Kpugi',
      description: 'Download official Kpugi brand guidelines, vector logos, and media kit assets.',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Press & Brand Kit',
            item: `${siteUrl}/press`,
          },
        ],
      },
    },
  ];

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-slate-900 dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
        <span>Press & Brand Kit</span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold font-display leading-tight mb-4">
        Official Brand Assets & Media Kit.
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mb-10">
        Writing about Kpugi or running co-marketing campaigns? Download high-resolution PNG, SVG, and vector logos.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
          <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">Primary Wordmark & Logo</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">High-res PNG and SVG formats in light and dark variants.</p>
          <a href="/kpugi_logo.png" download className="inline-block text-xs font-bold font-mono text-blue-600 dark:text-blue-400 hover:underline">
            Download Logo Pack (PNG/SVG) →
          </a>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
          <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">Press Inquiries</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">For interview requests, market data, or executive quotes.</p>
          <a href="mailto:press@kpugi.com" className="inline-block text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 hover:underline">
            press@kpugi.com →
          </a>
        </div>
      </div>
    </div>
  );
}
