import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadBufferToStorage } from '@/lib/supabase/storage';

export const maxDuration = 60; // Allow sufficient duration for video uploads

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const requestedFolder = (formData.get('folder') as string) || 'creatives';
    const folder = requestedFolder === 'covers' ? 'covers' : 'creatives';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const mimeType = (file.type || '').toLowerCase();
    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type (${mimeType || 'unknown'}). Allowed: JPG, PNG, WEBP, MP4, WEBM, MOV.`,
        },
        { status: 400 }
      );
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      const maxMb = maxSize / (1024 * 1024);
      return NextResponse.json(
        { success: false, error: `File size exceeds the ${maxMb}MB limit.` },
        { status: 400 }
      );
    }

    let ext = 'bin';
    if (mimeType.includes('jpeg')) ext = 'jpg';
    else if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('mp4')) ext = 'mp4';
    else if (mimeType.includes('webm')) ext = 'webm';
    else if (mimeType.includes('quicktime') || mimeType.includes('mov')) ext = 'mov';
    else if (mimeType.includes('ogg')) ext = 'ogg';

    const fileName = `${folder}/cmp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadedUrl = await uploadBufferToStorage(buffer, fileName, mimeType);

    if (!uploadedUrl) {
      return NextResponse.json(
        { success: false, error: 'Storage upload failed. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrl,
      fileName,
      contentType: mimeType,
      size: file.size,
    });
  } catch (err: any) {
    console.error('[Campaign Creative Upload Exception]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal upload error' },
      { status: 500 }
    );
  }
}
