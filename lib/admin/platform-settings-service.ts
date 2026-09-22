import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@/lib/supabase/server';

export * from './platform-settings-types';
import {
  PlatformSettings,
  DEFAULT_SETTINGS,
} from './platform-settings-types';

const JSON_STORE_DIR = path.join(process.cwd(), 'data');
const JSON_STORE_FILE = path.join(JSON_STORE_DIR, 'platform-settings.json');

/**
 * Read persistent settings from local JSON fallback file
 */
function readLocalSettings(): Partial<PlatformSettings> {
  try {
    if (fs.existsSync(JSON_STORE_FILE)) {
      const raw = fs.readFileSync(JSON_STORE_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[PlatformSettingsService] Failed to read local JSON settings:', err);
  }
  return {};
}

/**
 * Write persistent settings to local JSON fallback file
 */
function writeLocalSettings(data: PlatformSettings): void {
  try {
    if (!fs.existsSync(JSON_STORE_DIR)) {
      fs.mkdirSync(JSON_STORE_DIR, { recursive: true });
    }
    fs.writeFileSync(JSON_STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[PlatformSettingsService] Failed to persist local JSON settings:', err);
  }
}

/**
 * Fetch all platform settings with tiered fallback:
 * 1. Supabase platform_settings table
 * 2. Local JSON store file (data/platform-settings.json)
 * 3. DEFAULT_SETTINGS constants
 */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const localSettings = readLocalSettings();
  let dbSettings: Partial<PlatformSettings> = {};

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('platform_settings')
      .select('key, value');

    if (!error && data && Array.isArray(data)) {
      for (const row of data) {
        if (row.key in DEFAULT_SETTINGS) {
          (dbSettings as Record<string, unknown>)[row.key] = row.value;
        }
      }
    }
  } catch {
    // If Supabase table is not yet migrated, dbSettings remains empty
  }

  // Merge in order: Default -> Local JSON -> DB (DB has top priority)
  return {
    marketplace: {
      ...DEFAULT_SETTINGS.marketplace,
      ...(localSettings.marketplace || {}),
      ...(dbSettings.marketplace || {}),
    },
    browse: {
      ...DEFAULT_SETTINGS.browse,
      ...(localSettings.browse || {}),
      ...(dbSettings.browse || {}),
    },
    campaigns: {
      ...DEFAULT_SETTINGS.campaigns,
      ...(localSettings.campaigns || {}),
      ...(dbSettings.campaigns || {}),
    },
    users: {
      ...DEFAULT_SETTINGS.users,
      ...(localSettings.users || {}),
      ...(dbSettings.users || {}),
    },
  };
}

/**
 * Fetch a specific section of platform settings
 */
export async function getSettingSection<K extends keyof PlatformSettings>(
  key: K
): Promise<PlatformSettings[K]> {
  const all = await getPlatformSettings();
  return all[key];
}

/**
 * Update and persist a section of platform settings.
 * Saves to both Supabase platform_settings and local JSON cache.
 */
export async function saveSettingSection<K extends keyof PlatformSettings>(
  key: K,
  patch: Partial<PlatformSettings[K]>,
  updatedBy?: string
): Promise<PlatformSettings[K]> {
  const current = await getPlatformSettings();
  const updatedSection = {
    ...current[key],
    ...patch,
  };

  const updatedAll: PlatformSettings = {
    ...current,
    [key]: updatedSection,
  };

  // 1. Write to local JSON store
  writeLocalSettings(updatedAll);

  // 2. Upsert to Supabase platform_settings if table exists
  try {
    const supabase = createAdminClient();
    await supabase.from('platform_settings').upsert({
      key,
      value: updatedSection,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy || null,
    }, { onConflict: 'key' });
  } catch (err) {
    console.warn(`[PlatformSettingsService] Could not write to DB table for key "${key}":`, err);
  }

  return updatedSection;
}

/**
 * Reset a specific section back to factory defaults
 */
export async function resetSettingSection<K extends keyof PlatformSettings>(
  key: K,
  updatedBy?: string
): Promise<PlatformSettings[K]> {
  return saveSettingSection(key, DEFAULT_SETTINGS[key], updatedBy);
}

/**
 * Export complete snapshot of system config
 */
export async function exportPlatformSettingsSnapshot() {
  const settings = await getPlatformSettings();
  return {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    platform: 'Kpugi Influencer Operations Platform',
    settings,
  };
}
