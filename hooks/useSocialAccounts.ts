import { useState } from 'react';
import { SocialAccount } from '@/types/social-account';

export function useSocialAccounts() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return { accounts, isLoading };
}
