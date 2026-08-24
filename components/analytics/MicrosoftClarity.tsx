'use client';

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';

interface MicrosoftClarityProps {
  projectId?: string;
}

export function MicrosoftClarity({ projectId }: MicrosoftClarityProps) {
  const clarityId = projectId || process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  useEffect(() => {
    if (clarityId && typeof window !== 'undefined') {
      try {
        Clarity.init(clarityId);
      } catch (err) {
        console.error('Failed to initialize Microsoft Clarity:', err);
      }
    }
  }, [clarityId]);

  return null;
}
