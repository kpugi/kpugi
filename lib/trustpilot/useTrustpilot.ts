'use client';

import { useState, useEffect } from 'react';
import type { TrustpilotSummary } from './trustpilotService';
import {
  TRUSTPILOT_DOMAIN,
  TRUSTPILOT_EVALUATE_URL,
  TRUSTPILOT_REVIEWS_URL,
} from './trustpilotService';

const DEFAULT_SUMMARY: TrustpilotSummary = {
  domain: TRUSTPILOT_DOMAIN,
  evaluateUrl: TRUSTPILOT_EVALUATE_URL,
  reviewsUrl: TRUSTPILOT_REVIEWS_URL,
  reviewCount: 0,
  trustScore: null,
  stars: 0,
  hasReviews: false,
  statusLabel: 'Verified Profile',
  reviews: [],
};

// Global in-memory cache to prevent duplicate fetches across multiple mounted badges
let cachedSummary: TrustpilotSummary | null = null;
let fetchPromise: Promise<TrustpilotSummary> | null = null;

export function useTrustpilot(): {
  data: TrustpilotSummary;
  isLoading: boolean;
  evaluateUrl: string;
  reviewsUrl: string;
} {
  const [data, setData] = useState<TrustpilotSummary>(cachedSummary || DEFAULT_SUMMARY);
  const [isLoading, setIsLoading] = useState<boolean>(!cachedSummary);

  useEffect(() => {
    let isMounted = true;

    if (cachedSummary) {
      setData(cachedSummary);
      setIsLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = fetch('/api/trustpilot')
        .then((res) => {
          if (!res.ok) throw new Error('Network error');
          return res.json();
        })
        .then((json: TrustpilotSummary) => {
          cachedSummary = json;
          return json;
        })
        .catch((err) => {
          console.warn('[useTrustpilot] Falling back to default:', err);
          return DEFAULT_SUMMARY;
        })
        .finally(() => {
          fetchPromise = null;
        });
    }

    fetchPromise.then((result) => {
      if (isMounted) {
        setData(result);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    data,
    isLoading,
    evaluateUrl: data.evaluateUrl || TRUSTPILOT_EVALUATE_URL,
    reviewsUrl: data.reviewsUrl || TRUSTPILOT_REVIEWS_URL,
  };
}
