import { useState } from 'react';
import { Wallet } from '@/types/wallet';

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return { wallet, isLoading };
}
