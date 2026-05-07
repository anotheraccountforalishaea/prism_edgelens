import { Candidate, TrendDirection } from "../schemas/types";

const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

export function analyzeTrend(c: Candidate, allCandidates: Candidate[]): TrendDirection {
  const activities = allCandidates
    .map(x => x.recentActivity ?? 0)
    .filter(a => a > 0)
    .sort((a, b) => a - b);

  const p75 = activities[Math.floor(activities.length * 0.75)] ?? 0;
  const p25 = activities[Math.floor(activities.length * 0.25)] ?? 0;
  const activity = c.recentActivity ?? 0;

  // Check staleness — no update in 6+ months is a red flag
  const isStale =
    c.recentActivity === 0 ||
    (c.recentActivity !== undefined && c.recentActivity < 5);

  if (isStale) return "declining";
  if (activity >= p75 && activities.length > 1) return "rising";
  if (activity <= p25 && activities.length > 1) return "declining";
  return "stable";
}