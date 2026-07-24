export type SubmissionStatus =
  | 'pending'
  | 'verified_pass'
  | 'verified_fail'
  | 'forfeited'
  | 'paid';

export interface Submission {
  id: string;
  campaign_id: string;
  creator_id: string;
  social_account_id: string;
  post_url: string;
  screenshot_url: string;
  submitted_at: string;
  reserved_amount: number;
  status: SubmissionStatus;
  final_view_count?: number;
  verified_at?: string;
  failure_reason?: string;
  paid_at?: string;
  payout_amount?: number;
  commission_amount?: number;
}
