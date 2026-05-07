// src/scoring/index.ts
import { Candidate, ParsedInput, ScoredCandidate } from "../schemas/types";
import { rankCandidates } from "./ranker";

export function scoreAndRank(
  candidates: Candidate[],
  input: ParsedInput
): ScoredCandidate[] {
  return rankCandidates(candidates, input);
}

export { matchScore } from "./matchScorer";
export { feasibilityScore } from "./feasibilityScorer";
export { confidenceScore } from "./confidenceScorer";
export { analyzeTrend } from "./trendAnalyzer";
export { checkCompatibility } from "./compatibilityChecker";
export { rankCandidates } from "./ranker";