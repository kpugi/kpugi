import { z } from 'zod';

export const campaignSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  adFormat: z.enum(['text', 'image', 'video']),
  cpmRate: z.number().min(500, 'Minimum CPM rate is ₦500'),
  totalBudget: z.number().min(10000, 'Minimum campaign budget is ₦10,000'),
  requiredLiveDurationHours: z.number().min(24, 'Minimum duration is 24 hours'),
});

export const submissionSchema = z.object({
  campaignId: z.string().uuid(),
  socialAccountId: z.string().uuid(),
  postUrl: z.string().url('Must be a valid social post URL'),
  screenshotUrl: z.string().url('Must be a valid screenshot URL'),
});
