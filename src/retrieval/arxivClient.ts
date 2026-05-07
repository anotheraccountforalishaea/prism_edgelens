import axios from "axios";
import { Candidate } from "../schemas/types";

/**
 * LAYER 1 — SMART RETRIEVAL (ArXiv)
 * Fetches recent research papers. Wraps everything in try/catch to ensure pipeline stability.
 */
export async function fetchArxivPapers(task: string): Promise<Candidate[]> {
  try {
    const cleanTask = task.replace(/-/g, " ");
    const url = "http://export.arxiv.org/api/query";
    
    const response = await axios.get(url, {
      params: {
        search_query: `ti:${cleanTask} AND cat:cs.LG`,
        sortBy: "submittedDate",
        sortOrder: "descending",
        max_results: 5,
      },
      timeout: 10000,
    });

    const xml: string = response.data;
    const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g);
    
    if (!entries) return [];

    const papers: Candidate[] = entries.map((entry) => {
      const id = extractXML(entry, "id") || "";
      const title = extractXML(entry, "title")?.replace(/\s+/g, " ").trim() || "Untitled";
      const summary = extractXML(entry, "summary")?.replace(/\s+/g, " ").trim() || "";
      const published = extractXML(entry, "published") || "";

      return {
        id,
        name: title,
        source: "arxiv" as const,
        url: id,
        description: summary.slice(0, 200),
        tags: ["arxiv", "research", "cs.LG"],
        lastUpdated: published,
        recentActivity: 0, // ArXiv doesn't provide popularity metrics easily
      };
    });

    console.log(`✅ ArXiv: Fetched ${papers.length} research papers for "${task}"`);
    return papers;
  } catch (error: any) {
    // LAYER 1: ArXiv failure NEVER blocks the pipeline
    console.warn(`⚠️ ArXiv fetch failed (safe fallback): ${error.message}`);
    return [];
  }
}

function extractXML(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const match = xml.match(regex);
  return match && match[1] ? match[1].trim() : null;
}
