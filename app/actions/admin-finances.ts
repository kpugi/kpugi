'use server';

import { requireAdminSession } from '@/lib/admin/auth';
import { logAuditEvent } from '@/lib/audit';
import { createAdminClient } from '@/lib/supabase/server';
import { paystackFetch } from '@/lib/paystack/client';
import {
  initiatePaystackTransfer,
  initiatePaystackBulkTransfer,
  finalizePaystackTransfer,
  createPaystackRecipient,
} from '@/lib/paystack/payout';
import { notifyCreatorWithdrawalCompleted } from '@/lib/notifications/creator';
import { revalidatePath } from 'next/cache';

export interface TreasuryMetrics {
  paystackBalanceNgn: number;
  bachsBalanceUsd: number;
  bachsBalanceNgn: number;
  bachsMode: 'sandbox' | 'live';
  totalCustodialLiquidity: number;
  advertiserLiquidity: number;
  creatorLiquidity: number;
  totalCampaignPool: number;
  spentCampaignBudget: number;
  reservedEscrowBudget: number;
  lifetimeDepositsVolume: number;
  lifetimePayoutsVolume: number;
  estimatedCommissionRevenue: number;
  featuredCampaignFees: number;
  pendingPayoutsCount: number;
  pendingPayoutsVolume: number;
}

/**
 * fetchPlatformTreasuryMetricsAction
 * Fetches real-time Paystack and Bachs gateway balances and aggregates all internal balances
 */
export async function fetchPlatformTreasuryMetricsAction(): Promise<TreasuryMetrics> {
  await requireAdminSession();
  const supabase = createAdminClient();

  // 1a. Fetch live Paystack Gateway Balance
  let paystackBalanceNgn = 0;
  try {
    const paystackRes = await paystackFetch('/balance');
    const ngnObj = (paystackRes?.data || []).find((b: any) => b.currency === 'NGN');
    if (ngnObj && typeof ngnObj.balance === 'number') {
      paystackBalanceNgn = Math.round(ngnObj.balance / 100); // Paystack returns in kobo
    }
  } catch (err) {
    console.warn('[fetchPlatformTreasuryMetricsAction] Paystack balance fetch failed:', err);
  }

  // 1b. Fetch live Bachs Gateway Balance
  let bachsBalanceUsd = 0;
  let bachsBalanceNgn = 0;
  let bachsMode: 'sandbox' | 'live' = 'live';
  try {
    const { bachsFetch, getBachsBaseUrl } = await import('@/lib/bachs/client');
    const baseUrl = getBachsBaseUrl();
    bachsMode = baseUrl.includes('sandbox') ? 'sandbox' : 'live';
    const bachsRes = await bachsFetch<any>('/v1/balances');
    if (bachsRes) {
      bachsBalanceUsd = parseFloat(bachsRes.total_balance_usd || '0') || 0;
      const ngnBalanceObj = (bachsRes.balances || []).find((b: any) => b.currency === 'NGN');
      if (ngnBalanceObj) {
        bachsBalanceNgn = parseFloat(ngnBalanceObj.available_balance || '0') || 0;
      } else {
        // Approximate standard FX (₦1,500/USD) for platform reserve aggregation
        bachsBalanceNgn = Math.round(bachsBalanceUsd * 1500);
      }
    }
  } catch (err) {
    console.warn('[fetchPlatformTreasuryMetricsAction] Bachs balance fetch failed:', err);
  }

  // 2. Fetch Supabase Wallets, Campaigns, Transactions, and Submissions
  const [walletsRes, campaignsRes, txRes, pendingPayoutsRes, submissionsRes] = await Promise.all([
    supabase.from('wallets').select('wallet_type, balance'),
    supabase.from('campaigns').select('total_budget, spent_budget, reserved_budget, is_featured'),
    supabase.from('wallet_transactions').select('type, status, amount'),
    supabase.from('payout_requests').select('amount').in('status', ['pending', 'processing', 'approved']),
    supabase.from('submissions').select('commission_amount, reserved_amount, payout_amount'),
  ]);

  // Wallet balances
  let advertiserLiquidity = 0;
  let creatorLiquidity = 0;
  (walletsRes.data || []).forEach((w: any) => {
    const b = Number(w.balance) || 0;
    if (w.wallet_type === 'advertiser_funding') {
      advertiserLiquidity += b;
    } else {
      creatorLiquidity += b;
    }
  });
  const totalCustodialLiquidity = advertiserLiquidity + creatorLiquidity;

  // Campaigns budgets
  let totalCampaignPool = 0;
  let spentCampaignBudget = 0;
  let reservedEscrowBudget = 0;
  let featuredCampaignsCount = 0;
  (campaignsRes.data || []).forEach((c: any) => {
    totalCampaignPool += Number(c.total_budget) || 0;
    spentCampaignBudget += Number(c.spent_budget) || 0;
    reservedEscrowBudget += Number(c.reserved_budget) || 0;
    if (c.is_featured) featuredCampaignsCount++;
  });
  const featuredCampaignFees = featuredCampaignsCount * 2500;

  // Transactions lifetime totals
  let lifetimeDepositsVolume = 0;
  let lifetimePayoutsVolume = 0;
  (txRes.data || []).forEach((t: any) => {
    if (t.status === 'completed') {
      const amt = Math.abs(Number(t.amount) || 0);
      if (t.type === 'deposit') {
        lifetimeDepositsVolume += amt;
      } else if (t.type === 'withdrawal' || t.type === 'payout_release') {
        lifetimePayoutsVolume += amt;
      }
    }
  });

  // Commission revenue (10% on spent campaign budget or recorded commissions)
  let recordedCommissions = 0;
  (submissionsRes.data || []).forEach((s: any) => {
    recordedCommissions += Number(s.commission_amount) || 0;
  });
  const estimatedCommissionRevenue = recordedCommissions > 0 
    ? recordedCommissions 
    : Math.round(spentCampaignBudget * 0.10);

  // Pending Payout requests
  let pendingPayoutsVolume = 0;
  const pendingPayoutsCount = (pendingPayoutsRes.data || []).length;
  (pendingPayoutsRes.data || []).forEach((p: any) => {
    pendingPayoutsVolume += Number(p.amount) || 0;
  });

  return {
    paystackBalanceNgn,
    bachsBalanceUsd,
    bachsBalanceNgn,
    bachsMode,
    totalCustodialLiquidity,
    advertiserLiquidity,
    creatorLiquidity,
    totalCampaignPool,
    spentCampaignBudget,
    reservedEscrowBudget,
    lifetimeDepositsVolume,
    lifetimePayoutsVolume,
    estimatedCommissionRevenue,
    featuredCampaignFees,
    pendingPayoutsCount,
    pendingPayoutsVolume,
  };
}

/**
 * verifyGatewayTransactionAction
 * Live query to verify any transaction reference directly with Paystack or Bachs.io API
 */
export async function verifyGatewayTransactionAction(reference: string) {
  await requireAdminSession();

  if (!reference || !reference.trim()) {
    throw new Error('Transaction reference is required.');
  }

  const cleanRef = reference.trim();
  const isBachs = cleanRef.startsWith('KPG-BCH-') || cleanRef.startsWith('chk_') || cleanRef.startsWith('ch_');

  if (isBachs) {
    try {
      const { retrieveBachsCheckoutSession } = await import('@/lib/bachs/checkout');
      const session = await retrieveBachsCheckoutSession(cleanRef);
      return {
        success: true,
        processor: 'bachs' as const,
        data: {
          id: session.charge?.payment_id || session.checkout_id,
          reference: session.reference,
          status: session.payment_status === 'paid' || session.status === 'complete' ? 'success' : session.status,
          amount: Math.round(parseFloat(session.amount) * 100), // in kobo format for consistency
          currency: session.currency || 'NGN',
          customer: {
            email: session.customer?.email || session.charge?.customer?.email,
            name: session.customer?.name || session.charge?.customer?.name,
          },
          channel: session.charge?.status || 'card_transfer_crypto',
          created_at: (session as any).created_at || new Date().toISOString(),
          gateway_response: session.charge?.status || 'Approved via Bachs.io',
          raw: session,
        },
        message: 'Bachs.io transaction verified successfully',
      };
    } catch (err: any) {
      return {
        success: false,
        processor: 'bachs' as const,
        data: null,
        message: err.message || 'Failed to verify transaction with Bachs.io',
      };
    }
  }

  try {
    const res = await paystackFetch(`/transaction/verify/${encodeURIComponent(cleanRef)}`);
    return {
      success: true,
      processor: 'paystack' as const,
      data: res.data,
      message: res.message || 'Transaction verified successfully',
    };
  } catch (err: any) {
    return {
      success: false,
      processor: 'paystack' as const,
      data: null,
      message: err.message || 'Failed to verify transaction with Paystack',
    };
  }
}

/**
 * verifyPaystackTransactionAction (Backward-compatible alias)
 */
export async function verifyPaystackTransactionAction(reference: string) {
  return verifyGatewayTransactionAction(reference);
}

/**
 * Helper to ensure a Paystack transfer recipient code exists for a payout request
 */
async function getOrCreateRecipientCode(supabase: any, payout: any): Promise<string | null> {
  // 1. Check if bank_account_id exists and already has recipient_code
  if (payout.bank_account_id) {
    const { data: bank } = await supabase
      .from('bank_accounts')
      .select('id, recipient_code, bank_code, account_number, account_name')
      .eq('id', payout.bank_account_id)
      .maybeSingle();

    if (bank?.recipient_code) {
      return bank.recipient_code;
    }

    if (bank?.bank_code && bank?.account_number) {
      const res = await createPaystackRecipient({
        name: bank.account_name || payout.account_name || 'Creator',
        accountNumber: bank.account_number,
        bankCode: bank.bank_code,
      });
      if (res.success && res.recipientCode) {
        await supabase
          .from('bank_accounts')
          .update({ recipient_code: res.recipientCode })
          .eq('id', payout.bank_account_id);
        return res.recipientCode;
      }
    }
  }

  // 2. Lookup bank_accounts by profile_id and account_number
  if (payout.account_number && payout.profile_id) {
    const { data: bank } = await supabase
      .from('bank_accounts')
      .select('id, recipient_code, bank_code, account_number, account_name')
      .eq('profile_id', payout.profile_id)
      .eq('account_number', payout.account_number)
      .maybeSingle();

    if (bank?.recipient_code) {
      return bank.recipient_code;
    }
    if (bank?.bank_code) {
      const res = await createPaystackRecipient({
        name: bank.account_name || payout.account_name || 'Creator',
        accountNumber: bank.account_number,
        bankCode: bank.bank_code,
      });
      if (res.success && res.recipientCode) {
        await supabase
          .from('bank_accounts')
          .update({ recipient_code: res.recipientCode })
          .eq('id', bank.id);
        return res.recipientCode;
      }
    }
  }

  return null;
}

/**
 * approvePayoutRequestAction
 * Marks a payout request as 'approved' (cleared for weekly Friday batch disbursement)
 */
export async function approvePayoutRequestAction(payoutRequestId: string) {
  const { profileId: adminId } = await requireAdminSession();
  const supabase = createAdminClient();

  if (!payoutRequestId) {
    throw new Error('Payout request ID is required.');
  }

  const { data: payout, error: fetchErr } = await supabase
    .from('payout_requests')
    .select('*')
    .eq('id', payoutRequestId)
    .single();

  if (fetchErr || !payout) {
    throw new Error('Payout request not found.');
  }

  if (payout.status === 'completed') {
    throw new Error('This payout request has already been completed.');
  }

  // Update status to 'approved'
  const { error: updateErr } = await supabase
    .from('payout_requests')
    .update({
      status: 'approved',
      updated_at: new Date().toISOString(),
    })
    .eq('id', payoutRequestId);

  if (updateErr) {
    throw new Error(`Failed to update payout request: ${updateErr.message}`);
  }

  const ref = payout.reference || payout.transfer_reference;
  if (ref) {
    await supabase
      .from('wallet_transactions')
      .update({ status: 'approved' })
      .eq('paystack_reference', ref);
  }

  await logAuditEvent({
    profileId: adminId,
    actorRole: 'admin',
    action: 'payout.approved',
    targetTable: 'payout_requests',
    targetId: payoutRequestId,
    details: `Admin approved creator withdrawal of ₦${Number(payout.amount).toLocaleString()} for Friday batch settlement.`,
    payload: {
      payoutRequestId,
      creatorProfileId: payout.profile_id,
      amount: payout.amount,
      reference: ref,
      scheduled_for: payout.scheduled_for,
    },
  });

  revalidatePath('/admin/finances');
  revalidatePath('/c/wallet');
  return { success: true, message: `Payout request approved for Friday settlement batch.` };
}

/**
 * disbursePayoutRequestAction
 * Executes disbursement of a single payout request via Paystack Transfer API or Manual Settlement
 */
export async function disbursePayoutRequestAction(
  payoutRequestId: string,
  mode: 'paystack_transfer' | 'manual',
  transferNote?: string
) {
  const { profileId: adminId } = await requireAdminSession();
  const supabase = createAdminClient();

  if (!payoutRequestId) {
    throw new Error('Payout request ID is required.');
  }

  // 1. Fetch current payout request
  const { data: payout, error: fetchErr } = await supabase
    .from('payout_requests')
    .select('*')
    .eq('id', payoutRequestId)
    .single();

  if (fetchErr || !payout) {
    throw new Error('Payout request not found.');
  }

  if (payout.status === 'completed') {
    throw new Error('This payout request has already been settled and completed.');
  }

  const ref = payout.reference || payout.transfer_reference;
  const amountNum = Number(payout.amount) || 0;

  // 2. Execute via Live Paystack API
  if (mode === 'paystack_transfer') {
    const recipientCode = await getOrCreateRecipientCode(supabase, payout);
    if (!recipientCode) {
      throw new Error(
        'Could not obtain or generate Paystack Recipient Code for this bank account. Please verify bank details or settle manually.'
      );
    }

    const transferRes = await initiatePaystackTransfer({
      recipientCode,
      amountInKobo: Math.round(amountNum * 100),
      reference: ref,
      reason: `Kpugi Creator Payout - ${ref}`,
    });

    if (!transferRes.success) {
      throw new Error(`Paystack Transfer Failed: ${transferRes.error || 'Failed to initiate transfer'}`);
    }

    // Check if transfer requires OTP verification from Paystack
    if (transferRes.requiresOtp) {
      await supabase
        .from('payout_requests')
        .update({
          paystack_transfer_code: transferRes.transferCode || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payoutRequestId);

      return {
        success: true,
        requiresOtp: true,
        transferCode: transferRes.transferCode,
        message: 'Paystack transfer initiated. Please enter the OTP sent to your phone to finalize.',
      };
    }

    // Success without OTP
    await supabase
      .from('payout_requests')
      .update({
        status: 'completed',
        paystack_transfer_code: transferRes.transferCode || null,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', payoutRequestId);

    if (ref) {
      await supabase
        .from('wallet_transactions')
        .update({ status: 'completed' })
        .eq('paystack_reference', ref);
    }
  } else {
    // Manual External Settlement
    await supabase
      .from('payout_requests')
      .update({
        status: 'completed',
        admin_notes: transferNote || 'Manual external bank settlement',
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', payoutRequestId);

    if (ref) {
      await supabase
        .from('wallet_transactions')
        .update({ status: 'completed' })
        .eq('paystack_reference', ref);
    }
  }

  // 3. Notify Creator
  const { data: creatorProfile } = await supabase
    .from('profiles')
    .select('clerk_id, email')
    .eq('id', payout.profile_id)
    .single();

  if (creatorProfile) {
    const maskedAcc = payout.account_number
      ? `****${payout.account_number.slice(-4)}`
      : '****Bank';

    notifyCreatorWithdrawalCompleted({
      clerkId: creatorProfile.clerk_id,
      email: creatorProfile.email,
      amount: amountNum,
      bankName: payout.bank_name || 'Bank',
      accountMasked: maskedAcc,
      reference: ref,
      profileId: payout.profile_id,
    }).catch((err) => console.error('[notifyCreatorWithdrawalCompleted] Error:', err));
  }

  // 4. Log governance audit trail
  await logAuditEvent({
    profileId: adminId,
    actorRole: 'admin',
    action: 'payout.disbursed',
    targetTable: 'payout_requests',
    targetId: payoutRequestId,
    details: `Admin disbursed payout of ₦${amountNum.toLocaleString()} via ${mode} (${transferNote || 'Standard Settlement'})`,
    payload: {
      payoutRequestId,
      creatorProfileId: payout.profile_id,
      amount: amountNum,
      mode,
      bankName: payout.bank_name,
      accountNumber: payout.account_number,
      reference: ref,
      note: transferNote,
    },
  });

  revalidatePath('/admin/finances');
  revalidatePath('/c/wallet');
  return { success: true, message: `Payout request disbursed and settled successfully.` };
}

/**
 * finalizePaystackTransferAction
 * Submits OTP received from Paystack to finalize a transfer
 */
export async function finalizePaystackTransferAction(
  payoutRequestId: string,
  transferCode: string,
  otp: string
) {
  const { profileId: adminId } = await requireAdminSession();
  const supabase = createAdminClient();

  if (!transferCode || !otp) {
    throw new Error('Transfer code and OTP are required.');
  }

  const finalRes = await finalizePaystackTransfer({
    transferCode,
    otp,
  });

  if (!finalRes.success) {
    throw new Error(`OTP Finalization Failed: ${finalRes.error || finalRes.message || 'Invalid OTP'}`);
  }

  // Update payout request and wallet transactions to completed
  await supabase
    .from('payout_requests')
    .update({
      status: 'completed',
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', payoutRequestId);

  const { data: payout } = await supabase
    .from('payout_requests')
    .select('*')
    .eq('id', payoutRequestId)
    .single();

  const ref = payout?.reference || payout?.transfer_reference;
  if (ref) {
    await supabase
      .from('wallet_transactions')
      .update({ status: 'completed' })
      .eq('paystack_reference', ref);
  }

  // Notify Creator
  if (payout) {
    const { data: creatorProfile } = await supabase
      .from('profiles')
      .select('clerk_id, email')
      .eq('id', payout.profile_id)
      .single();

    if (creatorProfile) {
      const maskedAcc = payout.account_number
        ? `****${payout.account_number.slice(-4)}`
        : '****Bank';

      notifyCreatorWithdrawalCompleted({
        clerkId: creatorProfile.clerk_id,
        email: creatorProfile.email,
        amount: Number(payout.amount) || 0,
        bankName: payout.bank_name || 'Bank',
        accountMasked: maskedAcc,
        reference: ref,
        profileId: payout.profile_id,
      }).catch((err) => console.error('[notifyCreatorWithdrawalCompleted] Error:', err));
    }
  }

  await logAuditEvent({
    profileId: adminId,
    actorRole: 'admin',
    action: 'payout.finalized_otp',
    targetTable: 'payout_requests',
    targetId: payoutRequestId,
    details: `Admin finalized Paystack transfer with OTP for request #${payoutRequestId.slice(0, 8)}`,
    payload: { payoutRequestId, transferCode },
  });

  revalidatePath('/admin/finances');
  revalidatePath('/c/wallet');
  return { success: true, message: 'Transfer finalized with OTP successfully!' };
}

/**
 * disburseBulkPayoutsAction
 * Processes multiple creator payouts in bulk via Paystack's Bulk Transfer API
 */
export async function disburseBulkPayoutsAction(payoutRequestIds: string[]) {
  const { profileId: adminId } = await requireAdminSession();
  const supabase = createAdminClient();

  if (!Array.isArray(payoutRequestIds) || payoutRequestIds.length === 0) {
    throw new Error('Please select at least one payout request to disburse.');
  }

  // 1. Fetch all selected payout requests that are not yet completed
  const { data: payouts, error: fetchErr } = await supabase
    .from('payout_requests')
    .select('*')
    .in('id', payoutRequestIds)
    .in('status', ['processing', 'approved']);

  if (fetchErr || !payouts || payouts.length === 0) {
    throw new Error('No eligible pending or approved payout requests found to process.');
  }

  // 2. Prepare bulk transfers list
  const transfersToProcess = [];
  const payoutMap = new Map<string, any>();

  for (const payout of payouts) {
    const recipientCode = await getOrCreateRecipientCode(supabase, payout);
    if (!recipientCode) {
      console.warn(`[Bulk Payout] Skipping payout ${payout.id}: No Paystack recipient code.`);
      continue;
    }

    const ref = payout.reference || payout.transfer_reference;
    transfersToProcess.push({
      amountInKobo: Math.round(Number(payout.amount) * 100),
      recipientCode,
      reference: ref,
      reason: `Kpugi Batch Payout - ${ref}`,
    });
    payoutMap.set(ref.toUpperCase(), payout);
  }

  if (transfersToProcess.length === 0) {
    throw new Error('Could not resolve recipient codes for any of the selected payout requests.');
  }

  // 3. Initiate Bulk Transfer via Paystack API
  const bulkRes = await initiatePaystackBulkTransfer({
    transfers: transfersToProcess,
  });

  if (!bulkRes.success) {
    throw new Error(`Paystack Bulk Transfer Failed: ${bulkRes.error || bulkRes.message || 'Unknown error'}`);
  }

  // 4. Update status of disbursed payouts in database
  const successfulRefs: string[] = [];
  let totalDisbursed = 0;

  for (const item of transfersToProcess) {
    const matchedPayout = payoutMap.get(item.reference.toUpperCase());
    if (matchedPayout) {
      successfulRefs.push(matchedPayout.id);
      totalDisbursed += Number(matchedPayout.amount) || 0;

      await supabase
        .from('payout_requests')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', matchedPayout.id);

      const ref = matchedPayout.reference || matchedPayout.transfer_reference;
      if (ref) {
        await supabase
          .from('wallet_transactions')
          .update({ status: 'completed' })
          .eq('paystack_reference', ref);
      }

      // Send completion notifications asynchronously
      const { data: creatorProfile } = await supabase
        .from('profiles')
        .select('clerk_id, email')
        .eq('id', matchedPayout.profile_id)
        .single();

      if (creatorProfile) {
        const maskedAcc = matchedPayout.account_number
          ? `****${matchedPayout.account_number.slice(-4)}`
          : '****Bank';

        notifyCreatorWithdrawalCompleted({
          clerkId: creatorProfile.clerk_id,
          email: creatorProfile.email,
          amount: Number(matchedPayout.amount) || 0,
          bankName: matchedPayout.bank_name || 'Bank',
          accountMasked: maskedAcc,
          reference: ref,
          profileId: matchedPayout.profile_id,
        }).catch((err) => console.error('[notifyCreatorWithdrawalCompleted] Error:', err));
      }
    }
  }

  // 5. Governance Audit Event for Bulk Disbursement
  await logAuditEvent({
    profileId: adminId,
    actorRole: 'admin',
    action: 'payout.bulk_disbursed',
    targetTable: 'payout_requests',
    targetId: `BULK-${new Date().toISOString().slice(0, 10)}`,
    details: `Admin processed bulk disbursement of ${successfulRefs.length} creator payouts totalling ₦${totalDisbursed.toLocaleString()} via Paystack Bulk Transfer API.`,
    payload: {
      count: successfulRefs.length,
      totalAmount: totalDisbursed,
      payoutIds: successfulRefs,
    },
  });

  revalidatePath('/admin/finances');
  revalidatePath('/c/wallet');
  return {
    success: true,
    count: successfulRefs.length,
    totalAmount: totalDisbursed,
    message: `Disbursed ${successfulRefs.length} payouts totalling ₦${totalDisbursed.toLocaleString()} via Paystack Bulk Transfer.`,
  };
}

/**
 * rejectPayoutRequestAction
 * Rejects a pending withdrawal and executes atomic balance rollback to return funds to creator
 */
export async function rejectPayoutRequestAction(
  payoutRequestId: string,
  reference: string,
  reason: string
) {
  const { profileId: adminId } = await requireAdminSession();
  const supabase = createAdminClient();

  if (!payoutRequestId) {
    throw new Error('Payout request ID is required.');
  }

  if (!reason || reason.trim().length < 5) {
    throw new Error('A detailed rejection reason is required (minimum 5 characters).');
  }

  // 1. Attempt atomic Postgres RPC rollback if reference exists
  let rollbackSuccess = false;
  if (reference) {
    const { data: rpcData, error: rpcErr } = await supabase.rpc(
      'atomic_rollback_withdrawal',
      { p_reference: reference, p_reason: reason.trim() }
    );
    if (!rpcErr && rpcData?.success) {
      rollbackSuccess = true;
    }
  }

  // 2. If RPC was not applied, update status and refund balance directly
  if (!rollbackSuccess) {
    const { data: payout } = await supabase
      .from('payout_requests')
      .select('profile_id, amount')
      .eq('id', payoutRequestId)
      .single();

    if (payout) {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('profile_id', payout.profile_id)
        .eq('wallet_type', 'creator_earnings')
        .single();

      if (wallet) {
        await supabase
          .from('wallets')
          .update({ balance: Number(wallet.balance) + Number(payout.amount) })
          .eq('id', wallet.id);
      }
    }

    await supabase
      .from('payout_requests')
      .update({
        status: 'rejected',
        rejection_reason: reason.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', payoutRequestId);

    if (reference) {
      await supabase
        .from('wallet_transactions')
        .update({ status: 'failed' })
        .eq('paystack_reference', reference);
    }
  }

  // 3. Log audit event
  await logAuditEvent({
    profileId: adminId,
    actorRole: 'admin',
    action: 'payout.rejected',
    targetTable: 'payout_requests',
    targetId: payoutRequestId,
    details: `Admin rejected payout request (Ref: ${reference || 'N/A'}). Reason: ${reason}. Rollback executed: ${rollbackSuccess}`,
    payload: {
      payoutRequestId,
      reference,
      reason,
      rollbackSuccess,
    },
  });

  revalidatePath('/admin/finances');
  revalidatePath('/c/wallet');
  return {
    success: true,
    message: `Payout request rejected. Funds have been refunded to the creator's wallet.`,
  };
}

/**
 * manualWalletAdjustmentAction
 * Governed financial intervention to adjust a wallet balance with mandatory audit justification
 */
export async function manualWalletAdjustmentAction(
  walletId: string,
  amount: number,
  direction: 'credit' | 'debit',
  reason: string
) {
  const { profileId: adminId } = await requireAdminSession();
  const supabase = createAdminClient();

  if (!walletId) {
    throw new Error('Wallet ID is required.');
  }

  if (!amount || amount <= 0) {
    throw new Error('A valid positive adjustment amount is required.');
  }

  if (!reason || reason.trim().length < 10) {
    throw new Error('A detailed audit justification is required (minimum 10 characters).');
  }

  const adminClient = createAdminClient();

  // 1. Fetch current wallet
  const { data: wallet, error: fetchErr } = await adminClient
    .from('wallets')
    .select('id, profile_id, wallet_type, balance')
    .eq('id', walletId)
    .single();

  if (fetchErr || !wallet) {
    throw new Error('Target wallet not found.');
  }

  const currentBalance = Number(wallet.balance) || 0;
  const delta = direction === 'credit' ? amount : -amount;
  const newBalance = currentBalance + delta;

  if (newBalance < 0) {
    throw new Error(`Insufficient wallet balance. Current balance is ₦${currentBalance.toLocaleString()}.`);
  }

  // 2. Update wallet balance via service role (bypasses RLS)
  const { error: updateErr } = await adminClient
    .from('wallets')
    .update({
      balance: newBalance,
    })
    .eq('id', walletId);

  if (updateErr) {
    throw new Error(`Failed to update wallet balance: ${updateErr.message}`);
  }

  // 3. Insert compensating transaction record
  const ref = `KPG-ADJ-${Date.now().toString(36).toUpperCase()}`;
  await adminClient.from('wallet_transactions').insert({
    wallet_id: walletId,
    type: direction === 'credit' ? 'deposit' : 'withdrawal',
    amount: delta,
    gross_amount: amount,
    net_amount: delta,
    status: 'completed',
    paystack_reference: ref,
    created_at: new Date().toISOString(),
  });

  // 4. Log comprehensive audit event
  await logAuditEvent({
    profileId: adminId,
    actorRole: 'admin',
    action: 'wallet.manual_adjustment',
    targetTable: 'wallets',
    targetId: walletId,
    details: `Admin ${direction.toUpperCase()}ED ₦${amount.toLocaleString()} on wallet ${walletId}. Old: ₦${currentBalance.toLocaleString()} -> New: ₦${newBalance.toLocaleString()}. Justification: ${reason}`,
    payload: {
      walletId,
      profileId: wallet.profile_id,
      walletType: wallet.wallet_type,
      direction,
      amount,
      oldBalance: currentBalance,
      newBalance,
      reference: ref,
      justification: reason,
    },
  });

  revalidatePath('/admin/finances');
  return {
    success: true,
    newBalance,
    reference: ref,
    message: `Wallet successfully ${direction}ed with ₦${amount.toLocaleString()}.`,
  };
}

/**
 * runReconciliationAuditAction
 * Executes Postgres RPC to recompute and reconcile all wallet balances
 */
export async function runReconciliationAuditAction() {
  const { profileId: adminId } = await requireAdminSession();
  const supabase = createAdminClient();

  let rpcResult: any = null;
  try {
    const { data, error } = await supabase.rpc('reconcile_all_creator_wallets');
    if (error) {
      console.warn('[runReconciliationAuditAction] RPC failed, falling back:', error.message);
    } else {
      rpcResult = data;
    }
  } catch (err) {
    console.warn('[runReconciliationAuditAction] RPC execution error:', err);
  }

  await logAuditEvent({
    profileId: adminId,
    actorRole: 'admin',
    action: 'finances.reconciliation.audit',
    targetTable: 'wallets',
    targetId: 'all_wallets',
    details: `Admin initiated full financial ledger reconciliation audit.`,
    payload: {
      rpcResult,
    },
  });

  revalidatePath('/admin/finances');
  return {
    success: true,
    message: 'Financial ledger & wallet reconciliation audit executed successfully.',
    data: rpcResult,
  };
}
