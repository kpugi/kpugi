import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    if (!path || path.length === 0) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    const filePath = path.join('/');
    const supabase = createAdminClient();

    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get('download') === '1' || searchParams.has('download');
    const fileName = filePath.split('/').pop() || 'asset';

    // Stream file directly through proxy without exposing raw Supabase bucket URL
    const { data, error } = await supabase.storage
      .from('campaign-creatives')
      .download(filePath);

    if (error || !data) {
      console.error('[Media Proxy] File download error:', error);
      return new NextResponse('File Not Found', { status: 404 });
    }

    const arrayBuffer = await data.arrayBuffer();
    
    // Resolve content type based on extension or data.type
    let contentType = data.type;
    const lower = filePath.toLowerCase();
    if (lower.endsWith('.mp4')) contentType = 'video/mp4';
    else if (lower.endsWith('.mov')) contentType = 'video/quicktime';
    else if (lower.endsWith('.webm')) contentType = 'video/webm';
    else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (lower.endsWith('.png')) contentType = 'image/png';
    else if (lower.endsWith('.webp')) contentType = 'image/webp';
    else if (lower.endsWith('.pdf')) contentType = 'application/pdf';
    else if (!contentType) contentType = 'application/octet-stream';

    const disposition = isDownload ? `attachment; filename="${fileName}"` : `inline; filename="${fileName}"`;

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (err) {
    console.error('[Media Proxy Exception]:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
