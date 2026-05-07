import { Candidate, ParsedInput, ScoredCandidate, CompatibilityLevel } from "../schemas/types";
import { matchScore } from "./matchScorer";
import { feasibilityScore } from "./feasibilityScorer";
import { confidenceScore } from "./confidenceScorer";
import { analyzeTrend } from "./trendAnalyzer";
import { passesHardConstraints } from "./hardConstraints";
import { computeSoftPenalties } from "./softConstraints";

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
  parsed: ParsedInput
): ScoredCandidate[] {
  if (candidates.length === 0) return [];

  const multiSourceNames = findDuplicateNames(candidates);
  const topResults: ScoredCandidate[] = [];

  for (const candidate of candidates) {
    // ── STEP 1: Hard check — remove if fails ─────────────
    const hardCheck = passesHardConstraints(candidate, parsed);
    if (!hardCheck.passes) {
      continue; // This candidate is gone (we don't have rejectedResults array returned here based on current API, just filtering them out for now)
    }

    const appearsInMultipleSources = multiSourceNames.has(candidate.name.toLowerCase());

    // ── STEP 2: Base scores ──────────────────────────────
    const baseMatch = matchScore(candidate, parsed);
    const baseFeasibility = feasibilityScore(candidate, parsed);
    const baseConfidence = confidenceScore(candidate, appearsInMultipleSources);
    const trendDirection = analyzeTrend(candidate, candidates);

    // ── STEP 3: Soft penalties — reduce scores ───────────
    const penalties = computeSoftPenalties(candidate, parsed);

    const finalMatch = Math.max(0, baseMatch - penalties.matchPenalty);
    const finalFeasibility = Math.max(0, baseFeasibility - penalties.feasibilityPenalty);
    const finalConfidence = Math.max(0, baseConfidence - penalties.confidencePenalty);

    // ── STEP 4: Combined score ───────────────────────────
    const combinedScore = Math.round(
      finalMatch * 0.40 +
      finalFeasibility * 0.40 +
      finalConfidence * 0.20
    );

    // ── STEP 5: Compatibility level from final feasibility
    const compatibility: CompatibilityLevel =
      finalFeasibility >= 70 ? "compatible" :
      finalFeasibility >= 40 ? "partial" : "incompatible";

    // ── STEP 6: Push to results with full check details ──
    topResults.push({
      ...candidate,
      matchScore: finalMatch,
      feasibilityScore: finalFeasibility,
      confidenceScore: finalConfidence,
      combinedScore,
      trendDirection,
      compatibility,
      passedChecks: penalties.passedSoftChecks,
      failedChecks: penalties.failedSoftChecks,
    });
  }

  topResults.sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0));
  return topResults;
}