import { Candidate, ParsedInput } from "../schemas/types";

export interface HardCheckResult {
  passes: boolean;
  reason?: string;
}

export function passesHardConstraints(
  candidate: Candidate,
  parsed: ParsedInput
): HardCheckResult {
  // We have moved hard constraint logic into the ranker to allow "soft" filtering
  // This function now effectively always passes to prevent binary exclusion.
  return { passes: true };
}
