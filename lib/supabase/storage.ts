import { createAdminClient } from '@/lib/supabase/server';

/**
 * Uploads a base64 or buffer image to Supabase Storage bucket 'campaign-creatives'
 * and returns a clean, domain-proxied URL (/api/media/covers/...) without exposing
 * raw Supabase bucket URLs to client.
 */
export async function uploadCampaignImageToStorage(
  base64Data: string,
  folder: string = 'covers'
): Promise<string | null> {
  try {
    if (!base64Data) return null;

    // If already a proxied URL or standard http/https link (not data URI), return as-is
    if (!base64Data.startsWith('data:image/')) {
      return base64Data;
    }

    const matches = base64Data.match(/^data:image\/([a-zA-Z0-9.+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const fileName = `${folder}/cmp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const supabase = createAdminClient();

    const { data, error } = await supabase.storage
      .from('campaign-creatives')
      .upload(fileName, buffer, {
        contentType: `image/${matches[1]}`,
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
