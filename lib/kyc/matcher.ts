/**
 * KpugiSync: Permutation-Invariant Legal Name Matcher
 * 
 * Accurately cross-checks extracted government ID names against Nigerian bank account names
 * (which commonly swap surname/firstname order, omit middle names, or include titles).
 */

const HONORIFICS = new Set([
  'MR', 'MRS', 'MS', 'MISS', 'DR', 'DOCTOR', 'PROF', 'PROFESSOR',
  'CHIEF', 'PASTOR', 'REVEREND', 'REV', 'ALHAJI', 'HAJIA', 'ENGR',
  'ENGINEER', 'BARR', 'BARRISTER', 'HON', 'HONORABLE'
]);

/**
 * Clean and tokenize a raw name string into uppercase distinct words.
 */
export function tokenizeName(name: string): string[] {
  if (!name) return [];
  
  // Replace non-alphanumeric chars with spaces
  const cleaned = name
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned
    .split(' ')
    .map(t => t.trim())
    .filter(t => t.length > 0 && !HONORIFICS.has(t));
}

/**
 * Compute similarity between two single words (handles 1-char OCR typos)
 */
function wordSimilarity(w1: string, w2: string): number {
  if (w1 === w2) return 1.0;
  if (Math.abs(w1.length - w2.length) > 2) return 0.0;

  // Simple Levenshtein distance for short words
  const m = w1.length;
  const n = w2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (w1[i - 1] === w2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  const distance = dp[m][n];
  const maxLen = Math.max(m, n);
  if (maxLen === 0) return 1.0;
  return Math.max(0, (maxLen - distance) / maxLen);
}

export interface NameMatchResult {
  score: number;          // 0 to 100
  isMatch: boolean;       // true if score >= 85
  matchedTokens: string[];
  missingTokens: string[];
  reason: string;
}

/**
 * Compares two names regardless of word order.
 * Example: "TUAZOR CLARK NABOM" vs "CLARK NABOM TUAZOR" -> 100% Match
 */
export function normalizeAndMatchNames(
  bankAccountName: string,
  idExtractedName: string
): NameMatchResult {
  const bankTokens = tokenizeName(bankAccountName);
  const idTokens = tokenizeName(idExtractedName);

  if (bankTokens.length === 0 || idTokens.length === 0) {
    return {
      score: 0,
      isMatch: false,
      matchedTokens: [],
      missingTokens: bankTokens,
      reason: 'Empty or unextractable name provided.'
    };
  }

  const matchedTokens: string[] = [];
  const missingTokens: string[] = [];

  // Match each bank token to the best available ID token
  const usedIdTokens = new Set<number>();
  let totalMatchWeight = 0;

  for (const bToken of bankTokens) {
    let bestScore = 0;
    let bestIdx = -1;

    for (let i = 0; i < idTokens.length; i++) {
      if (usedIdTokens.has(i)) continue;
      const sim = wordSimilarity(bToken, idTokens[i]);
      if (sim > bestScore) {
        bestScore = sim;
        bestIdx = i;
      }
    }

    // High threshold for word match (0.8 allows 1 typo in 5+ letter words)
    if (bestScore >= 0.8 && bestIdx !== -1) {
      usedIdTokens.add(bestIdx);
      matchedTokens.push(bToken);
      totalMatchWeight += bestScore;
    } else {
      missingTokens.push(bToken);
    }
  }

  // Calculate percentage of bank tokens accounted for
  const coverageRatio = totalMatchWeight / bankTokens.length;
  let finalScore = Math.round(coverageRatio * 100);

  // Bonus/Tolerance: If 2 of 3 names match (e.g. middle name missing on bank account or ID)
  // this is standard in Nigerian banking. We qualify this as an 85% match (Auto-Approve).
  if (bankTokens.length >= 2 && matchedTokens.length >= 2) {
    if (bankTokens.length === 3 && matchedTokens.length === 2) {
      finalScore = Math.max(finalScore, 85);
    }
  }

  const isMatch = finalScore >= 85;
  const reason = isMatch
    ? `Strong match: ${matchedTokens.length}/${bankTokens.length} names verified.`
    : `Name discrepancy: Missing [${missingTokens.join(', ')}] in ID document.`;

  return {
    score: finalScore,
    isMatch,
    matchedTokens,
    missingTokens,
    reason,
  };
}
