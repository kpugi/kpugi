import { Knock } from '@knocklabs/node';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
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

const knock = new Knock(knockApiKey);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function triggerForUsers() {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, clerk_id, full_name, email');

  if (!profiles) return;

  for (const user of profiles) {
    console.log(`Triggering notifications for Clerk ID: ${user.clerk_id} and Profile ID: ${user.id}`);
    
    // Identify user in Knock first
    await knock.users.identify(user.clerk_id, {
      name: user.full_name || 'Creator',
      email: user.email,
    });
    await knock.users.identify(user.id, {
      name: user.full_name || 'Creator',
      email: user.email,
    });

    // Trigger Campaign Joined
    await knock.workflows.trigger('campaign-joined', {
      recipients: [user.clerk_id, user.id],
      data: {
        campaignTitle: 'Infinix Hot 50 Pro Review',
        reservedAmount: '₦2,000',
      },
    });

    // Trigger Creator Welcome
    await knock.workflows.trigger('creator-welcome', {
      recipients: [user.clerk_id, user.id],
      data: {
        name: user.full_name || 'Creator',
      },
    });
  }

  console.log('Finished triggering notifications.');
}

triggerForUsers();
