import * as fs from 'fs';
import * as path from 'path';

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

async function main() {
  const supabase = createAdminClient();
  
  console.log('1. Checking storage buckets...');
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  if (bErr) {
    console.error('Error listing buckets:', bErr);
  } else {
    console.log('Existing buckets:', buckets.map(b => ({ name: b.name, public: b.public })));
  }

  const kycBucket = buckets?.find(b => b.name === 'kyc-documents');
  if (!kycBucket) {
    console.log('Creating private bucket "kyc-documents"...');
    const { data: createData, error: cErr } = await supabase.storage.createBucket('kyc-documents', {
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    });
    if (cErr) {
      console.error('Error creating bucket:', cErr);
    } else {
      console.log('Created bucket:', createData);
    }
  } else {
    console.log('Bucket "kyc-documents" already exists.');
  }
}

main().catch(console.error);

