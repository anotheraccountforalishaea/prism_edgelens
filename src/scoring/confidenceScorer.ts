import { Candidate } from "../schemas/types";

export function confidenceScore(c: Candidate, appearsInMultipleSources: boolean = false): number {
  let score = 0;

  // Popularity signal
  if ((c.downloads && c.downloads > 10000) || (c.stars && c.stars > 500)) {
    score += 40;
  } else if ((c.downloads && c.downloads > 1000) || (c.stars && c.stars > 100)) {
    score += 20; // Moderate popularity — partial credit
  }

  // Cross-source corroboration (e.g. appears on both HF and GitHub)
  if (appearsInMultipleSources) {
    score += 30;
  }

  // Recent activity signal
  if (c.recentActivity && c.recentActivity > 100) {
    score += 30;
  } else if (c.recentActivity && c.recentActivity > 10) {
    score += 15;
  }

  return Math.min(score, 100);
}