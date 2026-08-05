import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};

envContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const parts = trimmed.split('=');
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    if (key && val) env[key] = val;
  }
});

const url = env['NEXT_PUBLIC_SUPABASE_URL'];
const key = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

console.log('Supabase URL:', url);

async function checkDatabase() {
  const supabase = createClient(url, key);

  console.log('\n--- SOCIAL ACCOUNTS TABLE ---');
  const { data: social, error: sErr } = await supabase.from('social_accounts').select('*');
  console.log('Social Accounts error:', sErr);
  console.log('Social Accounts rows count:', social?.length || 0);
  console.log('Social Accounts data:', JSON.stringify(social, null, 2));

  console.log('\n--- CREATOR PROFILES TABLE ---');
  const { data: creators, error: cErr } = await supabase.from('creator_profiles').select('id, profile_id, display_name, social_links');
  console.log('Creators error:', cErr);
  console.log('Creators data:', JSON.stringify(creators, null, 2));

  console.log('\n--- PROFILES TABLE ---');
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('id, email, full_name');
  console.log('Profiles error:', pErr);
  console.log('Profiles data:', JSON.stringify(profiles, null, 2));
}

checkDatabase().catch(console.error);
