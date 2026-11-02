# Native In-House Identity Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 100% in-house, zero-cost identity verification system in Kpugi that replaces Didit with a native modal, private Supabase storage, Gemini 1.5 Flash Vision name & biometrics matching, and a 1-click Admin review queue.

**Architecture:** A native 4-step client modal uploads ID and selfie images to a private Supabase bucket (`kyc-documents`). A server API route calls Gemini 1.5 Flash Vision to extract the legal name, check document validity and face presence, and cross-reference against the creator's Paystack payout bank account name (`account_name`). Submissions with $\ge 85\%$ token match auto-approve instantly, while edge cases are routed to a 1-click review queue in `/admin/users`.

**Tech Stack:** Next.js 15 (App Router), Supabase Storage & Database, Google Gemini 1.5 Flash Multimodal Vision API, Lucide icons, Canvas Confetti, Tailwind CSS.

---

### Task 1: Supabase Storage Bucket & Database Schema

**Files:**
- Create: `supabase/migrations/20261102_kyc_submissions.sql`
- Create: `scripts/setup-kyc-storage.ts`

- [ ] **Step 1: Create SQL migration for `kyc_submissions`**
  Write migration defining `kyc_submissions` table with columns: `id`, `creator_id`, `document_type`, `id_number`, `id_front_path`, `selfie_path`, `bank_account_name`, `ai_extracted_name`, `ai_confidence_score`, `ai_match_score`, `ai_reason`, `ai_raw_response`, `decision`, `rejection_reason`, `reviewed_by`, `reviewed_at`, `created_at`, `updated_at`. Include indexes on `creator_id` and `decision`.

- [ ] **Step 2: Create Storage bucket helper script**
  Create `scripts/setup-kyc-storage.ts` using `createAdminClient()` from `@/lib/supabase/server` to ensure the private bucket `kyc-documents` exists with `public: false` and allowed MIME types (`image/jpeg`, `image/png`, `image/webp`).

- [ ] **Step 3: Execute migration and bucket setup**
  Run the script and apply migration via Supabase client, verifying bucket and table creation.

- [ ] **Step 4: Commit**
  ```bash
  git add supabase/migrations/ scripts/setup-kyc-storage.ts
  git commit -m "feat(kyc): add kyc_submissions table migration and storage bucket script"
  ```

---

### Task 2: Gemini Vision & Name-Matching Utility Engine

**Files:**
- Create: `lib/kyc/matcher.ts`
- Create: `lib/kyc/gemini-verifier.ts`
- Create: `scratch/test_kyc_engine.ts`

- [ ] **Step 1: Write unit tests for the token name matcher**
  In `scratch/test_kyc_engine.ts`, test:
  - Exact match: `"NABOM TUAZOR CLARK"` vs `"NABOM TUAZOR CLARK"` (100)
  - Permutation: `"CLARK NABOM TUAZOR"` vs `"NABOM TUAZOR CLARK"` (100)
  - Prefix stripping: `"MR. NABOM CLARK"` vs `"NABOM CLARK"` (100)
  - Partial/Middle Name omitted: `"NABOM CLARK"` vs `"NABOM TUAZOR CLARK"` (85)
  - Discrepancy: `"JOHN DOE"` vs `"NABOM TUAZOR CLARK"` (0)

- [ ] **Step 2: Implement `lib/kyc/matcher.ts`**
  Implement `normalizeAndMatchNames(targetName: string, extractedName: string): { score: number; isMatch: boolean; details: string }`.

- [ ] **Step 3: Implement `lib/kyc/gemini-verifier.ts`**
  Implement `verifyIdentityWithGemini({ idBuffer, idMime, selfieBuffer, selfieMime, bankAccountName })`:
  - Use `process.env.GOOGLE_GENERATIVE_AI_API_KEY` with Gemini 1.5 Flash.
  - Pass the ID image and selfie with structured prompt requesting strict JSON response.
  - Parse and validate JSON structure.

- [ ] **Step 4: Run `scratch/test_kyc_engine.ts` to verify**
  Ensure tests pass for name variations.

- [ ] **Step 5: Commit**
  ```bash
  git add lib/kyc/
  git commit -m "feat(kyc): add Gemini 1.5 Flash vision engine and token name matcher"
  ```

---

### Task 3: Backend Verification API Route

**Files:**
- Create: `app/api/kyc/native/submit/route.ts`

- [ ] **Step 1: Implement `POST /api/kyc/native/submit`**
  - Authenticate creator using `getOrCreateUserProfile()`.
  - Validate profile suspension check (`checkProfileSuspension`).
  - Extract creator's linked primary bank details from `creator_profiles` / earnings data. If no bank account linked, return `400` with descriptive error.
  - Parse `multipart/form-data`: `id_image`, `selfie`, `document_type`, `id_number`.
  - Validate file sizes ($\le 10\text{MB}$) and MIME types.

- [ ] **Step 2: Upload to `kyc-documents` Supabase Storage**
  - Generate safe file paths: `${creatorId}/id_front_${Date.now()}.${ext}` and `${creatorId}/selfie_${Date.now()}.${ext}`.
  - Upload via Supabase admin client.

- [ ] **Step 3: Run AI Verification & Decision Logic**
  - Call `verifyIdentityWithGemini`.
  - Run `normalizeAndMatchNames` on `ai_extracted_name` and `bank_account_name`.
  - If `is_valid_id` is true, face matches, and match score $\ge 85\%$:
    - Decision: `'auto_approved'`
    - Update `creator_profiles`: `kyc_status = 'verified'`, `kyc_verified_at = now()`.
  - Else:
    - Decision: `'pending_admin'`
    - Update `creator_profiles`: `kyc_status = 'pending'`.
  - Insert record into `kyc_submissions`.

- [ ] **Step 4: Return JSON response**
  Return `{ success: true, status: 'verified' | 'pending', message: string, matchScore: number }`.

- [ ] **Step 5: Commit**
  ```bash
  git add app/api/kyc/native/submit/route.ts
  git commit -m "feat(kyc): add native identity submission API route"
  ```

---

### Task 4: Native Verification Modal & Settings View Integration

**Files:**
- Create: `components/creator/settings/modals/NativeKycModal.tsx`
- Modify: `components/creator/settings/CreatorSettingsView.tsx`

- [ ] **Step 1: Build `NativeKycModal.tsx`**
  - Modern modal dialog with dark/light mode support.
  - Step 1: Select ID type (`nin_slip`, `nin_card`, `voters_card`, `drivers_license`, `passport`) and optional ID number.
  - Step 2: Upload ID front with camera capture trigger on mobile (`capture="environment"`), image preview, and replace button.
  - Step 3: Snap selfie with front camera capture (`capture="user"`), preview, and oval guide framing.
  - Step 4: Submission with animated step indicator ("Encrypting documents...", "Analyzing with AI...", "Cross-referencing bank account...").
  - On Auto-Approve: Trigger `canvas-confetti`, display success checkmark, close modal and update parent state.
  - On Review Queued: Display friendly amber notice that review is underway.

- [ ] **Step 2: Update `CreatorSettingsView.tsx`**
  - Remove old Didit redirect/polling code (`createDiditKycSession`, `handleCheckKycStatus`).
  - Wire up `NativeKycModal` opening on `Verify Identity 🛡️`.
  - Check if primary bank exists; if not, show alert and scroll to the Payout Bank Account card.
  - Support all 4 states (`unverified`, `pending`, `verified`, `rejected` with rejection reason display).

- [ ] **Step 3: Commit**
  ```bash
  git add components/creator/settings/modals/NativeKycModal.tsx components/creator/settings/CreatorSettingsView.tsx
  git commit -m "feat(kyc): implement native KYC verification modal and update settings view"
  ```

---

### Task 5: Admin Review Queue & 1-Click Approval

**Files:**
- Create: `app/actions/admin-kyc.ts`
- Modify: `components/admin/users/UserDetailAdminView.tsx`

- [ ] **Step 1: Implement `app/actions/admin-kyc.ts`**
  - `getPendingKycSubmissions()`: returns pending submissions with signed Supabase Storage URLs (15-min expiry) for images.
  - `approveKycSubmission(submissionId, creatorId)`: updates submission to `admin_approved`, updates `creator_profiles` to `kyc_status = 'verified'`.
  - `rejectKycSubmission(submissionId, creatorId, reason)`: updates submission to `admin_rejected`, updates `creator_profiles` to `kyc_status = 'rejected'`, records `rejection_reason`.

- [ ] **Step 2: Update `UserDetailAdminView.tsx`**
  - Add an **Identity Verification** panel inside creator admin profile:
  - Displays submitted document type, ID number, and linked bank account name.
  - Side-by-side expandable thumbnail preview of ID document and selfie.
  - Displays AI confidence score and reasoning summary.
  - 1-click **[Approve Verification]** and **[Reject Verification]** buttons.

- [ ] **Step 3: Commit**
  ```bash
  git add app/actions/admin-kyc.ts components/admin/users/UserDetailAdminView.tsx
  git commit -m "feat(admin): add 1-click KYC review and approval drawer"
  ```

---

### Task 6: Deprecate Didit & Final Build Verification

**Files:**
- Modify: `lib/supabase/creator.ts`
- Remove / Archive: `lib/didit/client.ts`, `app/api/kyc/didit/session/route.ts`, `app/api/webhooks/didit/route.ts`

- [ ] **Step 1: Clean up checklist label in `lib/supabase/creator.ts`**
  Change line 1174 from `'Identity Verification (Didit KYC)'` to `'Identity Verification (Official Government ID)'`.

- [ ] **Step 2: Remove Didit session routes**
  Remove unused Didit API routes now superseded by `/api/kyc/native/submit`.

- [ ] **Step 3: Run full TypeScript and Next.js build**
  Run: `npm run build`
  Expected: Clean build with zero TypeScript or route compilation errors.

- [ ] **Step 4: Commit and Push**
  ```bash
  git add -A
  git commit -m "refactor(kyc): decommission Didit in favor of native in-house verification"
  ```

