import { Candidate } from "../schemas/types";

export function confidenceScore(c: Candidate, appearsInMultipleSources: boolean = false): number {
  let score = 0;

  // Popularity signal (weighted more heavily for "famous" results)
  if ((c.downloads && c.downloads > 50000) || (c.stars && c.stars > 2000)) {
    score += 50;
  } else if ((c.downloads && c.downloads > 5000) || (c.stars && c.stars > 200)) {
    score += 25; // Moderate popularity — partial credit
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