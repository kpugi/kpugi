import { useState } from 'react';
import { Submission } from '@/types/submission';

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return { submissions, isLoading };
}
