import { CompatibilityLevel, ScoredCandidate, ParsedInput } from "../schemas/types";

export function checkCompatibility(c: ScoredCandidate, input: ParsedInput): CompatibilityLevel {
  // Hard memory fail already caught by feasibilityScorer (score = 0)
  // This adds nuance based on offline requirement
  if (input.offline && c.source === "arxiv") {
    // Papers aren't runnable — incompatible for offline deployment
    return "incompatible";
  }

  if (c.feasibilityScore >= 70) return "compatible";
  if (c.feasibilityScore >= 40) return "partial";
  return "incompatible";
}