/**
 * Social Metric Scraper Dispatch & Types
 * Production metric extraction runs via the Python engine in .scraper/
 */

export * from './trigger';

export interface ScrapeResult {
  postReachable: boolean;
  viewCount: number | null;
  likeCount?: number | null;
  commentCount?: number | null;
  shareCount?: number | null;
  rawPayload?: Record<string, unknown>;
  notes?: string;
}
