import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache on edge/CDN for 1 hour

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com').replace(/\/$/, '');

  try {
    const supabase = createAdminClient();

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('id, updated_at, created_at')
      .in('status', ['live', 'completed'])
      .eq('deleted', false)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[sitemap-campaigns.xml] Database error fetching campaigns:', error);
      throw error;
    }

    const campaignUrls = (campaigns || []).map((c) => {
      const lastModDate = c.updated_at || c.created_at;
      const lastMod = lastModDate ? new Date(lastModDate).toISOString() : new Date().toISOString();
      const loc = escapeXml(`${baseUrl}/browse/${c.id}`);

      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${campaignUrls.join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    console.error('[sitemap-campaigns.xml] Error generating campaign sitemap:', err);

    // Return empty valid XML fallback so crawlers do not crash
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

    return new NextResponse(fallbackXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}
