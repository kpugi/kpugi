export type CampaignAdFormat = 'text' | 'image' | 'video';

export type CampaignStatus =
  | 'draft'
  | 'funding_pending'
  | 'live'
  | 'budget_committed'
  | 'completed'
  | 'cancelled';

export interface Campaign {
  id: string;
  advertiser_id: string;
  title: string;
  description: string;
  ad_format: CampaignAdFormat;
  requirements: Record<string, unknown>;
  cpm_rate: number;
  total_budget: number;
  reserved_budget: number;
  spent_budget: number;
  min_view_threshold: number;
  required_live_duration_hours: number;
  verification_grace_hours: number;
  status: CampaignStatus;
  funded_at?: string;
  created_at: string;
  updated_at: string;
}
