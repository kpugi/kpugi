export type SocialPlatform = 'instagram' | 'tiktok' | 'x' | 'facebook' | 'youtube';

export interface SocialAccount {
  id: string;
  creator_id: string;
  platform: SocialPlatform;
  handle: string;
  platform_user_id: string;
  follower_count?: number;
  connected_at: string;
  revoked_at?: string;
  last_synced_at?: string;
}
