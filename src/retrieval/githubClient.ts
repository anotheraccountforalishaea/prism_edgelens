import axios from "axios";
import { Candidate } from "../schemas/types";

/**
 * Searches GitHub for relevant AI repositories based on a task.
 *
 * API: GET https://api.github.com/search/repositories
 * Free — no token needed (rate limit: 10 requests/min unauthenticated)
 */
export async function fetchGitHubRepos(task: string): Promise<Candidate[]> {
  try {
    const searchQuery = `${task} AI edge`;
    const url = "https://api.github.com/search/repositories";

    const response = await axios.get(url, {
      params: {
        q: searchQuery,
        sort: "stars",
        order: "desc",
        per_page: 10,
      },
      headers: {
        Accept: "application/vnd.github.v3+json",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
    });

    const repos: Candidate[] = response.data.items.map((repo: any) => {
      const pushedAt = new Date(repo.pushed_at).getTime();
      const now = Date.now();
      const daysSincePush = (now - pushedAt) / (1000 * 60 * 60 * 24);
      const recentActivity = Math.max(0, Math.round(100 - daysSincePush));

      return {
        id: repo.full_name,
        name: repo.full_name,
        source: "github" as const,
        url: repo.html_url,
        description: repo.description || "No description available",
        tags: repo.topics || [],
        stars: repo.stargazers_count || 0,
        recentActivity,
      };
    });

    console.log(`✅ GitHub: Fetched ${repos.length} repos for "${task}"`);
    return repos;
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.warn("⚠️ GitHub API rate limited — try again in a minute");
    } else {
      console.error(`❌ GitHub fetch failed: ${error.message}`);
    }
    return [];
  }
}
