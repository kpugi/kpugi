import { Knock } from '@knocklabs/node';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach((line) => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    if (key && !key.startsWith('#')) {
      envVars[key] = val;
    }
  }
});

const knockApiKey = envVars['KNOCK_API_KEY'];
const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!knockApiKey || !supabaseUrl || !supabaseServiceKey) {
  console.error('Missing configuration in .env.local');
  process.exit(1);
}

const knock = new Knock(knockApiKey);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function broadcastKycNotification() {
  console.log('Fetching users requiring KYC verification...');

  // 1. Get creator profiles requiring KYC
  const { data: creatorProfiles, error: creatorErr } = await supabase
    .from('creator_profiles')
    .select('profile_id, display_name, kyc_status');

  if (creatorErr) {
    console.error('Error fetching creator profiles:', creatorErr);
  }

  // 2. Fetch base profiles
  const { data: baseProfiles } = await supabase
    .from('profiles')
    .select('id, clerk_id, full_name, email, role');

  const targetUsersMap = new Map<string, any>();

  (baseProfiles || []).forEach((bp) => {
    // Check if creator profile is unverified or role is creator
    const creatorProf = (creatorProfiles || []).find(
      (cp) => cp.profile_id === bp.id
    );
    const kycStatus = creatorProf?.kyc_status || 'unverified';

    if (kycStatus !== 'verified') {
      targetUsersMap.set(bp.id, {
        profileId: bp.id,
        clerkId: bp.clerk_id,
        email: bp.email,
        name: creatorProf?.display_name || bp.full_name || 'Creator',
        kycStatus,
      });
    }
  });

  const targetUsers = Array.from(targetUsersMap.values());
  console.log(`Found ${targetUsers.length} users requiring KYC verification.`);

  for (const user of targetUsers) {
    console.log(`Sending KYC Broadcast to ${user.name} (${user.email})...`);

    // Identify user in Knock
    try {
      if (user.clerkId) {
        await knock.users.identify(user.clerkId, {
          name: user.name,
          email: user.email,
        });
      }
      await knock.users.identify(user.profileId, {
        name: user.name,
        email: user.email,
      });
    } catch (err) {
      console.warn(`[Knock Identify Warning for ${user.email}]:`, err);
    }

    // Insert into Supabase notifications table for live dashboard feed
    try {
      await supabase.from('notifications').insert({
        profile_id: user.profileId,
        knock_workflow_key: 'kyc-verification-required',
        channel: 'in_app',
        payload: {
          message: '🛡️ Action Required: Verify your government ID (NIN, Voter Card, or Passport) on the Settings page to unlock instant campaign earnings withdrawals.',
          title: 'Identity Verification Required',
          actionUrl: '/settings',
        },
      });
    } catch (dbErr) {
      console.warn('[Supabase Notification Log Error]:', dbErr);
    }

    // Trigger Knock workflow for In-App and Email
    try {
      const recipients = [user.clerkId, user.profileId].filter(Boolean);
      await knock.workflows.trigger('creator-welcome', {
        recipients,
        data: {
          name: user.name,
          message: '🛡️ Action Required: Please complete your quick government ID verification to unlock earnings payouts.',
          action_url: '/settings',
        },
      });
    } catch (knockErr) {
      console.warn('[Knock Trigger Error]:', knockErr);
    }
  }

  console.log('✅ KYC Broadcast completed successfully!');
}

broadcastKycNotification();
