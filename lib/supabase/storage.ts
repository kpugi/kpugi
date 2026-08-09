import { createAdminClient } from '@/lib/supabase/server';

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

    const buffer = Buffer.from(matches[2], 'base64');
    const fileName = `${folder}/cmp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const supabase = createAdminClient();

    const { error } = await supabase.storage
      .from('campaign-creatives')
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error('[Supabase Storage Upload Error]:', error);
      return null;
    }

    // Return clean internal proxy URL without exposing raw Supabase bucket project reference
    return `/api/media/${fileName}`;
  } catch (err) {
    console.error('[uploadCampaignImageToStorage] Error:', err);
    return null;
  }
}
