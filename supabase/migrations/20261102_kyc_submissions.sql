-- ==============================================================================
-- Migration: 20261102_kyc_submissions.sql
-- KpugiSync: Native Identity Verification Submissions & Audit Trail
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.kyc_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.creator_profiles(profile_id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- 'nin_slip', 'nin_card', 'voters_card', 'drivers_license', 'passport'
    id_number TEXT,
    id_front_path TEXT NOT NULL,
    selfie_path TEXT NOT NULL,
    bank_account_name TEXT NOT NULL,
    ai_extracted_name TEXT,
    ai_confidence_score NUMERIC(5,2),
    ai_match_score NUMERIC(5,2),
    ai_face_score NUMERIC(5,2),
    ai_reason TEXT,
    ai_raw_response JSONB,
    decision TEXT NOT NULL DEFAULT 'pending', -- 'auto_approved', 'pending_admin', 'admin_approved', 'admin_rejected'
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for swift queries
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_creator ON public.kyc_submissions(creator_id);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_decision ON public.kyc_submissions(decision);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_created_at ON public.kyc_submissions(created_at DESC);

-- Enable RLS for kyc_submissions
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

-- Creator can view their own submissions
CREATE POLICY "Creators can view their own KYC submissions"
    ON public.kyc_submissions FOR SELECT TO authenticated
    USING (
        creator_id = (SELECT id FROM public.profiles WHERE clerk_id = (auth.jwt() ->> 'sub'))
    );

-- Admins can read and update all KYC submissions
CREATE POLICY "Admins can manage all KYC submissions"
    ON public.kyc_submissions FOR ALL TO authenticated
    USING (
        COALESCE(
            (SELECT is_admin FROM public.profiles WHERE clerk_id = (auth.jwt() ->> 'sub')),
            false
        )
    );

-- Ensure rejection reason and verification audit fields exist on creator_profiles
ALTER TABLE public.creator_profiles
    ADD COLUMN IF NOT EXISTS kyc_rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS kyc_document_type TEXT,
    ADD COLUMN IF NOT EXISTS kyc_last_submission_id UUID;

