import { useState, useEffect } from 'react';
import { Campaign } from '@/types/campaign';

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return { campaigns, isLoading };
}
