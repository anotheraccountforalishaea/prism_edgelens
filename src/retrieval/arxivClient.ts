import axios from "axios";
import { Candidate } from "../parser/schemas/types";

/**
 * Fetches recent research papers from ArXiv based on a task.
 *
 * API: GET http://export.arxiv.org/api/query
 * 100% Free — no token, no signup needed
 * Best-effort: returns [] on failure, never breaks the pipeline.
 */
export async function fetchArxivPapers(task: string): Promise<Candidate[]> {
  try {
    const formattedTask = task.replace(/\s+/g, "+");

    const url = "http://export.arxiv.org/api/query";
    const response = await axios.get(url, {
      params: {
        search_query: `ti:${formattedTask}+AND+cat:cs.LG`,
        sortBy: "submittedDate",
        sortOrder: "descending",
        max_results: 5,
      },
      timeout: 10000,
    });

    const xml: string = response.data;

    const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g);
    if (!entries || entries.length === 0) {
      console.log("⚠️ ArXiv: No papers found (this is OK)");
      return [];
    }

    const papers: Candidate[] = entries.map((entry) => {
      const id = extractXML(entry, "id") || "";
      const title = extractXML(entry, "title")?.replace(/\s+/g, " ").trim() || "Untitled";
      const summary = extractXML(entry, "summary")?.replace(/\s+/g, " ").trim() || "";
      const published = extractXML(entry, "published") || "";

      const categoryMatches = entry.match(/category term="([^"]+)"/g) || [];
      const tags: string[] = categoryMatches.map((c) => {
        const match = c.match(/term="([^"]+)"/);
        return match ? match[1] : undefined;
      }).filter((t): t is string => t !== undefined);

      let recentActivity = 0;
      if (published) {
        const pubDate = new Date(published).getTime();
        const daysSince = (Date.now() - pubDate) / (1000 * 60 * 60 * 24);
        recentActivity = Math.max(0, Math.round(100 - daysSince));
      }

      return {
        id,
        name: title,
        source: "arxiv" as const,
        url: id,
        description: summary.slice(0, 300) + (summary.length > 300 ? "..." : ""),
        tags,
        recentActivity,
      };
    });

    console.log(`✅ ArXiv: Fetched ${papers.length} papers for "${task}"`);
    return papers;
  } catch (error: any) {
    console.warn(`⚠️ ArXiv fetch failed (continuing without papers): ${error.message}`);
    return [];
  }
}

function extractXML(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const match = xml.match(regex);
  return match && match[1] ? match[1].trim() : null;
}
