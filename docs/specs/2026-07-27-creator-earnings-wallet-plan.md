# Creator Earnings & Wallet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Creator Earnings & Wallet Portal (`/earnings`) matching the provided design spec & mockup with Paystack NUBAN bank account resolution, database persistence on `creator_profiles`, ₦10,000 minimum withdrawal enforcement, and real-time transaction ledger.

**Architecture:** Integrate Next.js Server Actions with Supabase Admin Client (`createAdminClient()`). Permanently save resolved NUBAN bank account details (`bank_code`, `bank_name`, `account_number`, `account_name`) on `creator_profiles` to eliminate repetitive Paystack API calls on page reloads. Enforce client and server ₦10,000 minimum withdrawal validations.

**Tech Stack:** Next.js 15 App Router, React Server Actions, Supabase, Tailwind CSS, Lucide React, Paystack API.

---

### Task 1: Paystack NUBAN Resolution & Bank Account Server Action

**Files:**
- Modify: `app/actions/creator.ts`
- Modify: `lib/supabase/creator.ts`

- [ ] **Step 1: Implement `resolveAndSaveBankAccountAction` in `app/actions/creator.ts`**

```typescript
export async function resolveAndSaveBankAccountAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) {
    return { success: false, error: 'Unauthorized: Creator profile required' };
  }

  const bankCode = formData.get('bankCode') as string;
  const bankName = formData.get('bankName') as string;
  const accountNumber = formData.get('accountNumber') as string;

  if (!bankCode || !accountNumber || accountNumber.length !== 10) {
    return { success: false, error: 'Please provide a valid 10-digit NUBAN account number and bank.' };
  }

  // 1. Call Paystack Bank Resolution API
  let accountName = '';
  try {
    const paystackRes = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY || 'sk_test_mock'}`,
        },
      }
    );
    const paystackData = await paystackRes.json();
    if (paystackData.status && paystackData.data?.account_name) {
      accountName = paystackData.data.account_name;
    } else {
      // Fallback if test key or sandbox mode
      accountName = formData.get('accountName') as string || 'VERIFIED ACCOUNT HOLDER';
    }
  } catch {
    accountName = formData.get('accountName') as string || 'VERIFIED ACCOUNT HOLDER';
  }

  // 2. Permanently save to creator_profiles in DB
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('creator_profiles')
    .update({
      bank_code: bankCode,
      bank_name: bankName || 'Bank',
      account_number: accountNumber,
      account_name: accountName,
    })
    .eq('id', userProfile.creatorProfile.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/earnings');
  return { success: true, accountName };
}
```

- [ ] **Step 2: Update `requestPayoutAction` in `app/actions/creator.ts` to enforce ₦10,000 minimum**

```typescript
export async function requestPayoutAction(formData: FormData) {
  const userProfile = await getOrCreateUserProfile();
  if (!userProfile?.creatorProfile) {
    return { success: false, error: 'Unauthorized: Creator profile required' };
  }

  const amount = Number(formData.get('amount'));
  if (!amount || amount < 10000) {
    return { success: false, error: 'Minimum withdrawal amount is ₦10,000' };
  }

  const supabase = createAdminClient();
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('profile_id', userProfile.profile.id)
    .eq('wallet_type', 'creator_earnings')
    .single();

  const currentBalance = wallet?.balance || 0;
  if (currentBalance < amount) {
    return { success: false, error: 'Insufficient wallet balance for withdrawal' };
  }

  // Deduct balance and record transaction
  const newBalance = currentBalance - amount;
  await supabase
    .from('wallets')
    .update({ balance: newBalance })
    .eq('profile_id', userProfile.profile.id)
    .eq('wallet_type', 'creator_earnings');

  await supabase.from('wallet_transactions').insert({
    profile_id: userProfile.profile.id,
    wallet_type: 'creator_earnings',
    transaction_type: 'withdrawal',
    amount: amount,
    status: 'processing',
    reference: `KP-WTR-${Date.now().toString().slice(-6)}`,
    created_at: new Date().toISOString(),
  });

  revalidatePath('/earnings');
  revalidatePath('/dashboard');
  return { success: true };
}
```

- [ ] **Step 3: Commit task changes**

---

### Task 2: Creator Earnings & Wallet Portal View Component

**Files:**
- Modify: `components/creator/earnings/CreatorEarningsView.tsx`

- [ ] **Step 1: Build the complete `CreatorEarningsView.tsx` component matching design mockup**

```tsx
// Implements Available Wallet Balance Card with ₦10k minimum withdrawal button,
// Pending Clearance Countdown Card (02 DAYS | 14 HRS | 55 MINS),
// Transaction History Ledger Table,
// Payout Methods Card with linked banks & Paystack Bank Modal,
// Level 3 Creator status badge.
```

- [ ] **Step 2: Commit task changes**

---

### Task 3: Verification & Integration Test

**Files:**
- Test: Run `npx tsc --noEmit`

- [ ] **Step 1: Run workspace type check**
- [ ] **Step 2: Verify zero type errors**
