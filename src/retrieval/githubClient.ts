import axios from "axios";
import { Candidate } from "../schemas/types";

/**
 * Searches GitHub for relevant AI repositories based on a task.
 * Uses OR logic to broaden discovery for complex multi-term technical queries.
 *
 * API: GET https://api.github.com/search/repositories
 */
export async function fetchGitHubRepos(task: string): Promise<Candidate[]> {
  try {
    const cleanTask = task.replace(/-/g, " ");
    const terms = cleanTask.split(/\s+/).filter(t => t.length > 2);
    
    // Broaden search: use OR logic for multi-word tasks
    // "agriculture disease" -> "agriculture OR disease"
    const searchQuery = terms.length > 1 
        ? `(${terms.join(" OR ")}) stars:>20`
        : `${cleanTask} stars:>20`;
        
    const url = "https://api.github.com/search/repositories";

    const response = await axios.get(url, {
      params: {
        q: searchQuery,
        sort: "stars",
        order: "desc",
        per_page: 100,
      },
      headers: {
        Accept: "application/vnd.github.v3+json",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
    });

    const repos: Candidate[] = (response.data.items || [])
      .map((repo: any) => {
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

    console.log(`✅ GitHub: Fetched ${repos.length} repos for "${searchQuery}"`);
    return repos;
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.warn("⚠️ GitHub API rate limited — using cached or empty results");
    } else {
      console.error(`❌ GitHub fetch failed: ${error.message}`);
    }
    return [];
  }
}
