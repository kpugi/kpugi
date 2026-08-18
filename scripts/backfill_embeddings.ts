import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...rest] = trimmed.split('=');
        const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = val;
        }
      }
    }
  }
} catch (e) {
  console.warn('Could not load .env.local:', e);
}

import { createAdminClient } from '../lib/supabase/server';
import { 
  constructCampaignEmbeddingText, 
  constructCreatorEmbeddingText, 
  generateTextEmbedding 
} from '../lib/ai/embeddings';

async function backfill() {
  console.log('🚀 Starting AI Vector Embeddings Backfill...\n');
  const supabase = createAdminClient();

  // 1. Backfill Campaigns
  console.log('--- Step 1: Backfilling Campaigns ---');
  const { data: campaigns, error: campErr } = await supabase
    .from('campaigns')
    .select('id, title, description, ad_format, channels, requirements, embedding');

  if (campErr) {
    console.error('Error fetching campaigns:', campErr);
    return;
  }

  console.log(`Found ${campaigns?.length || 0} campaigns.`);

  let campSuccess = 0;
  for (const camp of campaigns || []) {
    try {
      const text = constructCampaignEmbeddingText(camp);
      const embedding = await generateTextEmbedding(text);
      if (embedding) {
        const { error: updateErr } = await supabase
          .from('campaigns')
          .update({ embedding: embedding as any })
          .eq('id', camp.id);

        if (updateErr) {
          console.error(`❌ Failed to update embedding for campaign "${camp.title}":`, updateErr.message);
        } else {
          campSuccess++;
          console.log(`✅ [${campSuccess}/${campaigns?.length}] Embedded campaign: "${camp.title}"`);
        }
      } else {
        console.warn(`⚠️ Could not generate embedding for: "${camp.title}"`);
      }
      // Small pause to prevent rate limiting
      await new Promise(r => setTimeout(r, 200));
    } catch (e: any) {
      console.error(`Error processing campaign ${camp.id}:`, e?.message || e);
    }
  }

  // 2. Backfill Creator Profiles
  console.log('\n--- Step 2: Backfilling Creator Profiles ---');
  const { data: creators, error: creatorErr } = await supabase
    .from('creator_profiles')
    .select('profile_id, display_name, bio, niche_categories, embedding');

  if (creatorErr) {
    console.error('Error fetching creators:', creatorErr);
    return;
  }

  console.log(`Found ${creators?.length || 0} creator profiles.`);

  let creatorSuccess = 0;
  for (const creator of creators || []) {
    try {
      const text = constructCreatorEmbeddingText(creator);
      const embedding = await generateTextEmbedding(text);
      if (embedding) {
        const { error: updateErr } = await supabase
          .from('creator_profiles')
          .update({ embedding: embedding as any })
          .eq('profile_id', creator.profile_id);

        if (updateErr) {
          console.error(`❌ Failed to update embedding for creator "${creator.display_name}":`, updateErr.message);
        } else {
          creatorSuccess++;
          console.log(`✅ [${creatorSuccess}/${creators?.length}] Embedded creator: "${creator.display_name || creator.profile_id}"`);
        }
      } else {
        console.warn(`⚠️ Could not generate embedding for creator: "${creator.display_name}"`);
      }
      await new Promise(r => setTimeout(r, 200));
    } catch (e: any) {
      console.error(`Error processing creator ${creator.profile_id}:`, e?.message || e);
    }
  }

  console.log(`\n🎉 Backfill Complete!`);
  console.log(`- Campaigns embedded: ${campSuccess}/${campaigns?.length || 0}`);
  console.log(`- Creators embedded: ${creatorSuccess}/${creators?.length || 0}`);
}

backfill().catch(console.error);
