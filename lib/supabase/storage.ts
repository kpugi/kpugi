import { createAdminClient } from '@/lib/supabase/server';

const STORAGE_BUCKET = 'campaign-creatives';

/**
 * Uploads a buffer directly to Supabase Storage bucket 'campaign-creatives'
 * with exponential backoff retry logic to guard against transient socket drops.
 */
export async function uploadBufferToStorage(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  maxRetries: number = 2
): Promise<string | null> {
  const supabase = createAdminClient();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, buffer, {
          contentType,
          upsert: true,
        });

      if (!error) {
        return `/api/media/${fileName}`;
      }

      console.warn(`[Supabase Storage] Upload attempt ${attempt + 1} failed:`, error.message || error);
      if (attempt < maxRetries) {
        // Wait with jittered backoff before retry (500ms, 1200ms)
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1) + Math.random() * 200));
      }
    } catch (err: any) {
      console.warn(`[Supabase Storage] Upload exception on attempt ${attempt + 1}:`, err?.message || err);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1) + Math.random() * 200));
      }
    }
  }

  console.error(`[Supabase Storage] All ${maxRetries + 1} upload attempts failed for ${fileName}`);
  return null;
}

/**
 * Uploads a base64 or buffer image/video to Supabase Storage bucket 'campaign-creatives'
 * and returns a clean, domain-proxied URL (/api/media/...) without exposing
 * raw Supabase bucket URLs to client.
 */
export async function uploadCampaignImageToStorage(
  base64Data: string,
  folder: string = 'covers'
): Promise<string | null> {
  try {
    if (!base64Data) return null;

    // If already a proxied URL or standard http/https link (not data URI), return as-is
    if (!base64Data.startsWith('data:')) {
      return base64Data;
    }

    const matches = base64Data.match(/^data:([a-zA-Z0-9.\-\/+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }

    const mimeType = matches[1];
    let ext = 'bin';
    if (mimeType.includes('jpeg')) ext = 'jpg';
    else if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('mp4')) ext = 'mp4';
    else if (mimeType.includes('webm')) ext = 'webm';
    else if (mimeType.includes('quicktime') || mimeType.includes('mov')) ext = 'mov';

    const buffer = Buffer.from(matches[2], 'base64');
    const fileName = `${folder}/cmp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    return await uploadBufferToStorage(buffer, fileName, mimeType);
  } catch (err) {
    console.error('[uploadCampaignImageToStorage] Error:', err);
    return null;
  }
}
