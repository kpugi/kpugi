import { NextResponse } from 'next/server';
import { verifyBachsWebhookSignature } from '@/lib/bachs/webhook';
import { createAdminClient } from '@/lib/supabase/server';
import { notifyAdvertiserWalletFunded } from '@/lib/notifications/advertiser';
import { logAuditEvent, AUDIT_ACTIONS } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signatureHeader =
      req.headers.get('x-bachs-signature-v2') ||
      req.headers.get('x-bachs-signature') ||
      req.headers.get('x-signature');
    const timestampHeader =
      req.headers.get('x-bachs-timestamp') ||
      req.headers.get('x-timestamp');

    const verifyResult = verifyBachsWebhookSignature({
      rawBody,
      signatureHeader,
      timestampHeader,
    });

    if (!verifyResult.isValid) {
      console.warn('[Bachs Webhook] Signature verification failed:', verifyResult.error);
      return NextResponse.json({ error: verifyResult.error || 'Invalid signature' }, { status: 401 });
    }

    const payload = verifyResult.payload || {};
    const event = payload?.event || payload?.type || 'unknown';
    const data = payload?.data || payload?.object || payload;

    const reference =
      data?.reference ||
      data?.charge?.reference ||
      data?.checkout_id ||
      payload?.reference ||
      null;

    const sessionId = data?.checkout_id || data?.session_id || payload?.checkout_id || null;
    const metadata = data?.metadata || payload?.metadata || {};

    const supabase = createAdminClient();

    // Check if an existing transaction was pre-locked on Kpugi backend with exact inputted amount
    let existingTx: any = null;
    if (reference) {
      const { data: tx } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('paystack_reference', reference)
        .maybeSingle();
      existingTx = tx;
    }

    const rawAmount = data?.amount || data?.charge?.amount_paid || data?.charge?.amount || 0;
    const grossAmount = typeof rawAmount === 'string' ? parseFloat(rawAmount) : Number(rawAmount);

    // Lock strictly onto Kpugi user input amount (ignoring customer processing fees added by Bachs)
    const amountInNaira =
      (existingTx?.amount && Number(existingTx.amount) > 0 ? Number(existingTx.amount) : null) ??
      (metadata?.amount && Number(metadata.amount) > 0 ? Number(metadata.amount) : null) ??
      (data?.settlement_amount && Number(data.settlement_amount) > 0 ? Number(data.settlement_amount) : null) ??
      grossAmount;

    const customerEmail =
      data?.customer?.email ||
      data?.customer_details?.email ||
      data?.charge?.customer?.email ||
      data?.email ||
      null;

    // 1. Audit Log incoming Bachs webhook event
    try {
      await supabase.from('bachs_events').insert({
        event_type: event,
        reference: reference,
        session_id: sessionId,
        payload,
        processed: false,
      });
    } catch (dbErr: any) {
      try {
        await supabase.from('paystack_events').insert({
          event_type: `bachs:${event}`,
          reference: reference,
          payload,
        });
      } catch {}
    }

    // 2. Handle successful payment events
    const isSuccessEvent =
      event === 'collection.succeeded' ||
      event === 'checkout.completed' ||
      event === 'payment.succeeded' ||
      event === 'charge.success';

    if (isSuccessEvent && reference && amountInNaira > 0) {
      console.log(`[Bachs Webhook] Successful collection for reference: ${reference}, amount: ₦${amountInNaira}`);

      // Locate advertiser by customer email or metadata profileId
      let profileId: string | null = metadata?.profileId || metadata?.profile_id || null;
      let clerkId: string | null = metadata?.clerkId || null;
      let targetEmail: string | null = customerEmail;

      if (!profileId && customerEmail) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, clerk_id, email')
          .eq('email', customerEmail)
          .maybeSingle();

        if (profile) {
          profileId = profile.id;
          clerkId = profile.clerk_id;
          targetEmail = profile.email;
        }
      }

      if (profileId) {
        const campaignId = metadata?.campaignId || null;
        const receiptNumber = `KPG-BCH-${reference.replace(/^KPG-BCH-/, '').slice(0, 6).toUpperCase()}`;

        if (campaignId) {
          // Direct Campaign Payment flow
          const { data: campaign } = await supabase
            .from('campaigns')
            .select('id, title, total_budget, is_featured, requirements')
            .eq('id', campaignId)
            .maybeSingle();

          if (campaign) {
            await supabase
              .from('campaigns')
              .update({
                requirements: {
                  ...(campaign.requirements || {}),
                  paystack_reference: reference,
                  payment_method: 'bachs',
                },
              })
              .eq('id', campaign.id);

            const receiptUpsert = await supabase.from('payment_receipts').upsert(
              {
                receipt_number: receiptNumber,
                advertiser_id: profileId,
                campaign_id: campaign.id,
                campaign_title: campaign.title,
                total_amount: amountInNaira,
                escrow_budget: Number(campaign.total_budget || amountInNaira),
                featured_fee: campaign.is_featured ? 2500 : 0,
                is_featured: Boolean(campaign.is_featured),
                payment_method: 'bachs',
                paystack_reference: reference,
                status: 'paid',
                issued_at: new Date().toISOString(),
              },
              { onConflict: 'receipt_number' }
            );

            if (receiptUpsert.error && receiptUpsert.error.message.includes('check constraint')) {
              await supabase.from('payment_receipts').upsert(
                {
                  receipt_number: receiptNumber,
                  advertiser_id: profileId,
                  campaign_id: campaign.id,
                  campaign_title: campaign.title,
                  total_amount: amountInNaira,
                  escrow_budget: Number(campaign.total_budget || amountInNaira),
                  featured_fee: campaign.is_featured ? 2500 : 0,
                  is_featured: Boolean(campaign.is_featured),
                  payment_method: 'paystack',
                  paystack_reference: reference,
                  status: 'paid',
                  issued_at: new Date().toISOString(),
                  notes: 'Paid via Bachs.io Gateway',
                },
                { onConflict: 'receipt_number' }
              );
            }

            // Ensure dual ledger entries in wallet_transactions for campaign payment
            try {
              let { data: advWallet } = await supabase
                .from('wallets')
                .select('id')
                .eq('profile_id', profileId)
                .eq('wallet_type', 'advertiser_funding')
                .maybeSingle();

              if (!advWallet) {
                const { data: newW } = await supabase
                  .from('wallets')
                  .insert({ profile_id: profileId, wallet_type: 'advertiser_funding', balance: 0 })
                  .select('id')
                  .single();
                advWallet = newW;
              }

              if (advWallet) {
                const { data: existingTx } = await supabase
                  .from('wallet_transactions')
                  .select('id, type')
                  .eq('paystack_reference', reference);

                const hasDeposit = existingTx?.some((t) => t.type === 'deposit');
                const hasDebit = existingTx?.some((t) => t.type === 'campaign_funding');

                if (!hasDeposit) {
                  await supabase.from('wallet_transactions').insert({
                    wallet_id: advWallet.id,
                    type: 'deposit',
                    amount: amountInNaira,
                    paystack_reference: reference,
                    status: 'completed',
                    created_at: new Date(Date.now() - 1000).toISOString(),
                  });
                }

                if (!hasDebit) {
                  await supabase.from('wallet_transactions').insert({
                    wallet_id: advWallet.id,
                    type: 'campaign_funding',
                    amount: Number(campaign.total_budget || amountInNaira),
                    campaign_id: campaign.id,
                    paystack_reference: reference,
                    status: 'completed',
                    created_at: new Date().toISOString(),
                  });
                }
              }
            } catch (ledgerErr) {
              console.error('[Bachs Webhook] Error recording dual ledger entries:', ledgerErr);
            }

            logAuditEvent({
              profileId,
              actorRole: 'advertiser',
              action: AUDIT_ACTIONS.WALLET_FUNDED,
              actionCategory: 'finance',
              targetTable: 'campaigns',
              targetId: campaign.id,
              details: `Funded campaign "${campaign.title}" with ₦${amountInNaira.toLocaleString()} via Bachs.io checkout`,
              payload: { reference, amount: amountInNaira, processor: 'bachs', sessionId, receiptNumber },
            });
          }
        } else {
          // Standard Wallet Deposit flow
          if (existingTx && existingTx.status === 'pending') {
            await supabase
              .from('wallet_transactions')
              .delete()
              .eq('id', existingTx.id);
          }

          const { data: depositResult, error: depositErr } = await supabase.rpc(
            'atomic_deposit_advertiser_wallet',
            {
              p_profile_id: profileId,
              p_amount: amountInNaira,
              p_reference: reference,
              p_receipt_number: receiptNumber,
              p_advertiser_email: targetEmail,
              p_notes: 'Bachs.io webhook collection.succeeded deposit confirmed',
            }
          );

          if (depositErr) {
            console.error('[Bachs Webhook] Error depositing to wallet:', depositErr);
          } else if (!depositResult?.already_processed) {
            // Fire in-app and email notification
            if (clerkId && targetEmail) {
              await notifyAdvertiserWalletFunded({
                clerkId,
                email: targetEmail,
                amount: amountInNaira,
                reference,
                newBalance: Number(depositResult?.new_balance || 0),
                profileId,
              });
            }

            // Immutable Brand Audit Trail
            logAuditEvent({
              profileId,
              actorRole: 'advertiser',
              action: AUDIT_ACTIONS.WALLET_FUNDED,
              actionCategory: 'finance',
              targetTable: 'wallet_transactions',
              targetId: reference,
              details: `Funded platform escrow with ₦${amountInNaira.toLocaleString()} via Bachs.io checkout`,
              payload: {
                reference,
                amount: amountInNaira,
                processor: 'bachs',
                sessionId,
                receiptNumber,
              },
            });
          }
        }
      } else {
        console.warn('[Bachs Webhook] Could not locate profile for customer email:', customerEmail);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error('[Bachs Webhook] Server error handling webhook:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
