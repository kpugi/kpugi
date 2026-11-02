import { NextResponse } from 'next/server';
import { getOrCreateUserProfile, checkProfileSuspension } from '@/lib/clerk/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyIdentityWithGemini } from '@/lib/kyc/gemini-verifier';
import { normalizeAndMatchNames } from '@/lib/kyc/matcher';

export const maxDuration = 60; // Allow sufficient time for vision processing & upload

export async function POST(req: Request) {
  try {
    const userProfile = await getOrCreateUserProfile();

    if (!userProfile || !userProfile.creatorProfile) {
      return NextResponse.json(
        { error: 'Unauthorized. Creator profile required.' },
        { status: 401 }
      );
    }

    const { isSuspended, reason } = checkProfileSuspension(userProfile.profile);
    if (isSuspended) {
      return NextResponse.json(
        { error: `Account suspended (${reason || 'Read-Only Mode'}). Identity verification is currently disabled.` },
        { status: 403 }
      );
    }

    const creatorId = userProfile.profile.id;
    const supabase = createAdminClient();

    // 1. Fetch Creator's Linked Payout Bank Account
    const { data: bankAccounts, error: bankErr } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('profile_id', creatorId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (bankErr) {
      console.error('[KpugiSync] Failed to fetch bank account:', bankErr);
    }

    const primaryBank = bankAccounts && bankAccounts.length > 0 ? bankAccounts[0] : null;

    if (!primaryBank || !primaryBank.account_name) {
      return NextResponse.json(
        {
          error: 'Please link your Nigerian Payout Bank Account first so we can verify your legal name.',
          code: 'BANK_ACCOUNT_REQUIRED',
        },
        { status: 400 }
      );
    }

    const bankAccountName = primaryBank.account_name.trim();

    // 2. Parse Multipart Form Data
    const formData = await req.formData();
    const idImageFile = formData.get('id_image') as File | null;
    const selfieFile = formData.get('selfie') as File | null;
    const documentType = (formData.get('document_type') as string) || 'nin_slip';
    const idNumber = (formData.get('id_number') as string) || '';

    if (!idImageFile || !selfieFile) {
      return NextResponse.json(
        { error: 'Both Government ID photo and a live Selfie photo are required.' },
        { status: 400 }
      );
    }

    // Validate size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (idImageFile.size > MAX_SIZE || selfieFile.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Image size exceeds maximum limit of 10MB.' },
        { status: 400 }
      );
    }

    // 3. Read Files into Buffers & Base64
    const idBuffer = Buffer.from(await idImageFile.arrayBuffer());
    const selfieBuffer = Buffer.from(await selfieFile.arrayBuffer());

    const idExt = idImageFile.name.split('.').pop() || 'jpg';
    const selfieExt = selfieFile.name.split('.').pop() || 'jpg';

    const timestamp = Date.now();
    const idStoragePath = `${creatorId}/id_front_${timestamp}.${idExt}`;
    const selfieStoragePath = `${creatorId}/selfie_${timestamp}.${selfieExt}`;

    // 4. Upload Encrypted Documents to Private Supabase Storage
    const [idUpload, selfieUpload] = await Promise.all([
      supabase.storage.from('kyc-documents').upload(idStoragePath, idBuffer, {
        contentType: idImageFile.type || 'image/jpeg',
        upsert: true,
      }),
      supabase.storage.from('kyc-documents').upload(selfieStoragePath, selfieBuffer, {
        contentType: selfieFile.type || 'image/jpeg',
        upsert: true,
      }),
    ]);

    if (idUpload.error) {
      console.error('[KpugiSync Storage Error - ID]:', idUpload.error);
    }
    if (selfieUpload.error) {
      console.error('[KpugiSync Storage Error - Selfie]:', selfieUpload.error);
    }

    // 5. Call Multimodal Gemini Vision
    console.log(`[KpugiSync] Analyzing submission for creator ${creatorId} against bank name "${bankAccountName}"...`);
    const aiResult = await verifyIdentityWithGemini({
      idImageBase64: idBuffer.toString('base64'),
      idMimeType: idImageFile.type || 'image/jpeg',
      selfieBase64: selfieBuffer.toString('base64'),
      selfieMimeType: selfieFile.type || 'image/jpeg',
      bankAccountName,
      documentType,
    });

    // 6. Run Permutation-Invariant Name Matcher
    const extractedName = aiResult.extracted_name || '';
    const nameMatch = normalizeAndMatchNames(bankAccountName, extractedName);

    console.log('[KpugiSync Decision Metrics]:', {
      bankName: bankAccountName,
      extractedName,
      nameMatchScore: nameMatch.score,
      isNameMatch: nameMatch.isMatch,
      faceMatch: aiResult.is_face_matched,
      faceConfidence: aiResult.face_confidence,
      validId: aiResult.is_valid_id,
    });

    // 7. Decision Logic
    // If valid document, face matched, and name score >= 85%: Instant Auto-Approval!
    const isAutoApproved =
      aiResult.is_valid_id &&
      aiResult.is_face_matched &&
      nameMatch.isMatch;

    const decision = isAutoApproved ? 'auto_approved' : 'pending_admin';
    const newStatus = isAutoApproved ? 'verified' : 'pending';
    const verifiedAt = isAutoApproved ? new Date().toISOString() : null;
    const submissionId = `sync_${timestamp.toString(36)}`;

    // 8. Update Creator Profile in Supabase
    const profileUpdate: Record<string, any> = {
      kyc_status: newStatus,
      kyc_didit_session_id: submissionId, // Reuse existing column to track KpugiSync submission ID
      kyc_verified_at: verifiedAt,
    };

    // Store rich submission metadata in notification_preferences
    const existingNotifs = userProfile.creatorProfile.notification_preferences || {};
    profileUpdate.notification_preferences = {
      ...existingNotifs,
      kpugisync_submission: {
        id: submissionId,
        document_type: documentType,
        id_number: idNumber || aiResult.extracted_id_number,
        bank_account_name: bankAccountName,
        extracted_name: extractedName,
        match_score: nameMatch.score,
        face_confidence: aiResult.face_confidence,
        decision,
        id_path: idStoragePath,
        selfie_path: selfieStoragePath,
        submitted_at: new Date().toISOString(),
      },
    };

    await supabase
      .from('creator_profiles')
      .update(profileUpdate)
      .eq('profile_id', creatorId);

    // 9. Record in kyc_submissions table (gracefully handles if table pending migration)
    try {
      await supabase.from('kyc_submissions').insert({
        id: crypto.randomUUID(),
        creator_id: creatorId,
        document_type: documentType,
        id_number: idNumber || aiResult.extracted_id_number,
        id_front_path: idStoragePath,
        selfie_path: selfieStoragePath,
        bank_account_name: bankAccountName,
        ai_extracted_name: extractedName,
        ai_confidence_score: aiResult.face_confidence,
        ai_match_score: nameMatch.score,
        ai_face_score: aiResult.face_confidence,
        ai_reason: aiResult.summary_reason,
        ai_raw_response: aiResult.raw_analysis || {},
        decision,
      });
    } catch (e: any) {
      console.warn('[KpugiSync] kyc_submissions insert skipped (table pending):', e.message);
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      decision,
      matchScore: nameMatch.score,
      extractedName,
      bankAccountName,
      message: isAutoApproved
        ? 'Identity verified successfully! Instant earnings payouts are now enabled.'
        : 'Your documents have been submitted for quick verification review.',
      reason: aiResult.summary_reason || nameMatch.reason,
    });
  } catch (error: any) {
    console.error('[KpugiSync Submit Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Identity verification submission failed.' },
      { status: 500 }
    );
  }
}
