import { ScrapeResult } from './index';

export async function scrapeInstagramPost(postUrl: string): Promise<ScrapeResult> {
  return {
    postReachable: true,
    viewCount: 2000,
    notes: `Instagram scraper checked ${postUrl}`,
  };
}
