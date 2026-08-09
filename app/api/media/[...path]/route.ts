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

    const { data, error } = await supabase.storage
      .from('campaign-creatives')
      .download(filePath);

    if (error || !data) {
      console.error('[Media Proxy] File download error:', error);
      return new NextResponse('File Not Found', { status: 404 });
    }

    const arrayBuffer = await data.arrayBuffer();
    const contentType = data.type || 'image/jpeg';

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('[Media Proxy Exception]:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
