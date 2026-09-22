import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@/lib/supabase/server';
export * from './platform-broadcasts-types';
import {
  BroadcastItem,
  BroadcastStatus,
  DEFAULT_SEED_BROADCASTS,
} from './platform-broadcasts-types';
import { sendEmail, renderReusableEmailTemplate } from '@/lib/resend/send-email';
import { triggerNotification } from '@/lib/knock/notify';

const JSON_STORE_DIR = path.join(process.cwd(), 'data');
const JSON_STORE_FILE = path.join(JSON_STORE_DIR, 'platform-broadcasts.json');

/**
 * Read local JSON fallback broadcasts
 */
function readLocalBroadcasts(): BroadcastItem[] {
  try {
    if (fs.existsSync(JSON_STORE_FILE)) {
      const raw = fs.readFileSync(JSON_STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[PlatformBroadcastsService] Failed to read local JSON broadcasts:', err);
  }
  return DEFAULT_SEED_BROADCASTS;
}

/**
 * Write local JSON fallback broadcasts
 */
function writeLocalBroadcasts(items: BroadcastItem[]): void {
  try {
    if (!fs.existsSync(JSON_STORE_DIR)) {
      fs.mkdirSync(JSON_STORE_DIR, { recursive: true });
    }
    fs.writeFileSync(JSON_STORE_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[PlatformBroadcastsService] Failed to write local JSON broadcasts:', err);
  }
}

/**
 * Fetch all broadcasts with tiered fallback:
 * 1. Supabase platform_broadcasts table
 * 2. Local JSON store file
 * 3. Seed broadcasts
 */
export async function getAllBroadcasts(): Promise<BroadcastItem[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('platform_broadcasts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && Array.isArray(data) && data.length > 0) {
      return data.map((row: any) => ({
        id: row.id,
        title: row.title,
        message: row.message,
        tag: row.tag || 'update',
        target_audience: row.target_audience || 'all',
        channels: row.channels || ['dashboard_banner'],
        has_cta: Boolean(row.has_cta),
        cta_label: row.cta_label,
        cta_url: row.cta_url,
        cta_style: row.cta_style || 'primary',
        status: row.status || 'active',
        email_subject: row.email_subject,
        email_preview_text: row.email_preview_text,
        sent_count: row.sent_count || 0,
        click_count: row.click_count || 0,
        created_by: row.created_by,
        created_at: row.created_at,
        updated_at: row.updated_at,
        expires_at: row.expires_at,
      }));
    }
  } catch {
    // Supabase table not migrated yet, fallback to local store
  }

  return readLocalBroadcasts();
}

/**
 * Fetch active dashboard banners targeted for a specific role
 */
export async function getActiveDashboardBanners(
  role: 'creator' | 'advertiser'
): Promise<BroadcastItem[]> {
  const all = await getAllBroadcasts();
  const targetTag = role === 'creator' ? 'creators' : 'brands';

  return all.filter((item) => {
    if (item.status !== 'active') return false;
    if (!item.channels.includes('dashboard_banner')) return false;
    if (item.target_audience === 'all') return true;
    return item.target_audience === targetTag;
  });
}

/**
 * Save (create or update) a broadcast
 */
export async function saveBroadcast(
  item: Partial<BroadcastItem> & { title: string; message: string },
  adminId?: string
): Promise<BroadcastItem> {
  const existingList = await getAllBroadcasts();
  const now = new Date().toISOString();

  let savedItem: BroadcastItem;

  if (item.id) {
    // Update existing
    savedItem = {
      ...existingList.find((b) => b.id === item.id)!,
      ...item,
      updated_at: now,
    } as BroadcastItem;
  } else {
    // Create new
    savedItem = {
      id: `broadcast-${Date.now().toString(36)}`,
      title: item.title,
      message: item.message,
      tag: item.tag || 'update',
      target_audience: item.target_audience || 'all',
      channels: item.channels || ['dashboard_banner'],
      has_cta: Boolean(item.has_cta),
      cta_label: item.cta_label || null,
      cta_url: item.cta_url || null,
      cta_style: item.cta_style || 'primary',
      status: item.status || 'active',
      email_subject: item.email_subject || item.title,
      email_preview_text: item.email_preview_text || item.message.slice(0, 100),
      sent_count: 0,
      click_count: 0,
      created_by: adminId || null,
      created_at: now,
      updated_at: now,
      expires_at: item.expires_at || null,
    };
  }

  // 1. Update local JSON store
  const updatedList = item.id
    ? existingList.map((b) => (b.id === item.id ? savedItem : b))
    : [savedItem, ...existingList];
  writeLocalBroadcasts(updatedList);

  // 2. Try DB upsert
  try {
    const supabase = createAdminClient();
    await supabase.from('platform_broadcasts').upsert({
      id: savedItem.id,
      title: savedItem.title,
      message: savedItem.message,
      tag: savedItem.tag,
      target_audience: savedItem.target_audience,
      channels: savedItem.channels,
      has_cta: savedItem.has_cta,
      cta_label: savedItem.cta_label,
      cta_url: savedItem.cta_url,
      cta_style: savedItem.cta_style,
      status: savedItem.status,
      email_subject: savedItem.email_subject,
      email_preview_text: savedItem.email_preview_text,
      sent_count: savedItem.sent_count,
      click_count: savedItem.click_count,
      created_by: savedItem.created_by,
      created_at: savedItem.created_at,
      updated_at: savedItem.updated_at,
      expires_at: savedItem.expires_at,
    });
  } catch (err) {
    console.warn('[PlatformBroadcastsService] Could not write to DB table:', err);
  }

  return savedItem;
}

/**
 * Toggle status of a broadcast (active, paused, archived)
 */
export async function updateBroadcastStatus(
  id: string,
  newStatus: BroadcastStatus
): Promise<void> {
  const existingList = await getAllBroadcasts();
  const updatedList = existingList.map((b) =>
    b.id === id ? { ...b, status: newStatus, updated_at: new Date().toISOString() } : b
  );
  writeLocalBroadcasts(updatedList);

  try {
    const supabase = createAdminClient();
    await supabase
      .from('platform_broadcasts')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);
  } catch (err) {
    console.warn('[PlatformBroadcastsService] DB status update note:', err);
  }
}

/**
 * Delete a broadcast
 */
export async function deleteBroadcast(id: string): Promise<void> {
  const existingList = await getAllBroadcasts();
  const updatedList = existingList.filter((b) => b.id !== id);
  writeLocalBroadcasts(updatedList);

  try {
    const supabase = createAdminClient();
    await supabase.from('platform_broadcasts').delete().eq('id', id);
  } catch (err) {
    console.warn('[PlatformBroadcastsService] DB delete note:', err);
  }
}

/**
 * Increment click counter for a broadcast CTA
 */
export async function recordBroadcastClick(id: string): Promise<void> {
  const existingList = await getAllBroadcasts();
  const updatedList = existingList.map((b) =>
    b.id === id ? { ...b, click_count: (b.click_count || 0) + 1 } : b
  );
  writeLocalBroadcasts(updatedList);

  try {
    const supabase = createAdminClient();
    const item = existingList.find((b) => b.id === id);
    if (item) {
      await supabase
        .from('platform_broadcasts')
        .update({ click_count: (item.click_count || 0) + 1 })
        .eq('id', id);
    }
  } catch {
    // Ignore
  }
}

/**
 * Dispatch broadcast to external channels (Knock In-App Feed and Resend Email)
 */
export async function dispatchBroadcastExternal(
  broadcast: BroadcastItem
): Promise<{
  knockSentCount: number;
  emailSentCount: number;
}> {
  let knockSentCount = 0;
  let emailSentCount = 0;

  try {
    const supabase = createAdminClient();

    // Query target recipient profiles
    let profilesQuery = supabase.from('profiles').select('id, clerk_id, email, full_name, role');
    if (broadcast.target_audience === 'creators') {
      profilesQuery = profilesQuery.eq('role', 'creator');
    } else if (broadcast.target_audience === 'brands') {
      profilesQuery = profilesQuery.eq('role', 'advertiser');
    }

    const { data: recipientProfiles } = await profilesQuery.limit(500);
    const recipients = recipientProfiles || [];

    // 1. Knock In-App Feed Dispatch
    if (broadcast.channels.includes('in_app') && recipients.length > 0) {
      for (const user of recipients) {
        try {
          await triggerNotification({
            workflowKey: 'platform-announcement',
            recipients: [user.id],
            profileId: user.id,
            data: {
              title: broadcast.title,
              message: broadcast.message,
              tag: broadcast.tag,
              ctaLabel: broadcast.cta_label,
              ctaUrl: broadcast.cta_url,
            },
          });
          knockSentCount++;
        } catch (err) {
          console.warn('[Knock Broadcast Dispatch Error]:', err);
        }
      }
    }

    // 2. Resend Email Dispatch
    if (broadcast.channels.includes('email') && recipients.length > 0) {
      const subject = broadcast.email_subject || `📢 ${broadcast.title}`;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kpugi.com';

      for (const user of recipients) {
        if (!user.email) continue;
        try {
          const emailHtml = renderReusableEmailTemplate({
            to: user.email,
            subject,
            previewText: broadcast.email_preview_text || broadcast.message.slice(0, 100),
            headline: broadcast.title,
            subtitle: `Hello ${user.full_name || 'Kpugi User'}, here is an important update from the Kpugi team:`,
            bodyHtml: `<p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">${broadcast.message}</p>`,
            cta: broadcast.has_cta && broadcast.cta_url ? {
              label: broadcast.cta_label || 'View Announcement',
              url: broadcast.cta_url.startsWith('http') ? broadcast.cta_url : `${appUrl}${broadcast.cta_url}`,
            } : undefined,
          });

          await sendEmail({
            to: user.email,
            subject,
            html: emailHtml,
          });
          emailSentCount++;
        } catch (err) {
          console.warn(`[Resend Broadcast Error for ${user.email}]:`, err);
        }
      }
    }

    // Update sent count
    const totalSent = Math.max(knockSentCount, emailSentCount, recipients.length);
    const updated = {
      ...broadcast,
      sent_count: (broadcast.sent_count || 0) + totalSent,
      status: 'active' as BroadcastStatus,
    };
    await saveBroadcast(updated);
  } catch (err) {
    console.error('[dispatchBroadcastExternal] Error:', err);
  }

  return { knockSentCount, emailSentCount };
}
