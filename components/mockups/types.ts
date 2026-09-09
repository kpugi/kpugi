export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'x' | 'twitter' | 'facebook' | 'linkedin';

export interface SubmissionMockupData {
  id: string;
  creatorHandle: string;
  creatorName?: string;
  creatorAvatarUrl?: string | null;
  platform: string;
  postUrl?: string | null;
  mediaUrl?: string | null;
  caption?: string | null;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  watchTimeSeconds?: number;
  submittedAt?: string | null;
  status: string;
  payoutAmount?: number | null;
  isCapReached?: boolean;
  rank?: number;
  brandName?: string;
}
