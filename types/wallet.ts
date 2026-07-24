export type WalletType = 'advertiser_funding' | 'creator_earnings';

export type WalletTransactionType =
  | 'campaign_funding'
  | 'budget_reservation'
  | 'budget_release_refund'
  | 'payout_release'
  | 'commission_deduction'
  | 'withdrawal';

export interface Wallet {
  id: string;
  profile_id: string;
  wallet_type: WalletType;
  balance: number;
  created_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: WalletTransactionType;
  amount: number;
  campaign_id?: string;
  submission_id?: string;
  paystack_reference?: string;
  created_at: string;
}
