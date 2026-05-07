import { Candidate, ParsedInput, ScoredCandidate } from "../schemas/types";
import { matchScore } from "./matchScorer";
import { feasibilityScore } from "./feasibilityScorer";
import { confidenceScore } from "./confidenceScorer";
import { analyzeTrend } from "./trendAnalyzer";
import { checkCompatibility } from "./compatibilityChecker";

function findDuplicateNames(candidates: Candidate[]): Set<string> {
  const nameCounts = new Map<string, number>();
  for (const c of candidates) {
    const key = c.name.toLowerCase();
    nameCounts.set(key, (nameCounts.get(key) ?? 0) + 1);
  }
  return new Set([...nameCounts.entries()].filter(([, v]) => v > 1).map(([k]) => k));
}

export function rankCandidates(
  candidates: Candidate[],
  input: ParsedInput
): ScoredCandidate[] {
  if (candidates.length === 0) return [];

  const multiSourceNames = findDuplicateNames(candidates);

  const scored: ScoredCandidate[] = candidates.map(c => {
    const appearsInMultipleSources = multiSourceNames.has(c.name.toLowerCase());
    const m = matchScore(c, input);
    const f = feasibilityScore(c, input);
    const conf = confidenceScore(c, appearsInMultipleSources);

    const sc: ScoredCandidate = {
      ...c,
      matchScore: m,
      feasibilityScore: f,
      confidenceScore: conf,
      trendDirection: "stable", // placeholder — set below after full batch is scored
      compatibility: "compatible", // placeholder
    };

    return sc;
  });

  // Trend analysis needs the full batch for relative percentile calculation
  for (const sc of scored) {
    sc.trendDirection = analyzeTrend(sc, scored);
    sc.compatibility = checkCompatibility(sc, input);
  }

  // Filter hard fails (memory exceeded → feasibility = 0)
  const viable = scored.filter(c => c.feasibilityScore > 0);

  // Weighted sort: feasibility-heavy since memory/latency constraints are hard requirements
  return viable.sort((a, b) => {
    const scoreOf = (x: ScoredCandidate) =>
      x.matchScore * 0.35 + x.feasibilityScore * 0.45 + x.confidenceScore * 0.20;
    return scoreOf(b) - scoreOf(a);
  });
}