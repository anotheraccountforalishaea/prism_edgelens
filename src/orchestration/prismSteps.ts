import { OpenClaw } from "./openclaw";
import { parseInput } from "../parser/inputParser";
import { fetchHFModels } from "../retrieval/huggingfaceClient";
import { fetchGitHubRepos } from "../retrieval/githubClient";
import { fetchArxivPapers } from "../retrieval/arxivClient";
import { scoreAndRank } from "../scoring";
import { buildReport } from "../report/reportBuilder";
import { enrichmentStore } from "./enrichmentStore";

/**
 * PRISM Step Orchestration
 * Handles the logic flow, including the "Agentic Fallback" for sparse results.
 */
export function registerPrismSteps() {
  OpenClaw.register("parse_input", async (state) => {
    const parsedInput = await parseInput(state.rawInput);
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[OpenClaw] Step: parse_input -> Task: ${parsedInput.task}, ID: ${requestId}`);
    enrichmentStore.create(requestId);
    return { ...state, parsedInput, requestId };
  });

  OpenClaw.register("retrieve_candidates", async (state) => {
    if (!state.parsedInput || !state.requestId) throw new Error("Parsed input or Request ID missing");
    
    // Launch ArXiv in background — DO NOT AWAIT initially
    const arxivPromise = fetchArxivPapers(state.parsedInput.task);
    
    // Immediate retrieval for HF and GitHub
    const [hf, gh] = await Promise.all([
      fetchHFModels(state.parsedInput.task),
      fetchGitHubRepos(state.parsedInput.task),
    ]);

    let githubCandidates = gh;
    let hfCandidates = hf;

    // AGENTIC FALLBACK: If GitHub results are sparse (< 10), fetch trending/famous repos globally
    if (githubCandidates.length < 10) {
      console.log(`[OpenClaw] 🔄 GitHub sparse (${githubCandidates.length}). Fetching global trending repos...`);
      const trendingGh = await fetchGitHubRepos("trending ai"); 
      const existingIds = new Set(githubCandidates.map(c => c.id));
      const newTrending = trendingGh.filter(c => !existingIds.has(c.id)).slice(0, 20);
      githubCandidates = [...githubCandidates, ...newTrending];
    }

    // Await ArXiv for the final merged set
    let arxivCandidates = await arxivPromise;

    // AGENTIC FALLBACK: If ArXiv results are sparse (< 10), fetch recent famous AI papers
    if (arxivCandidates.length < 10) {
      console.log(`[OpenClaw] 🔄 ArXiv sparse (${arxivCandidates.length}). Fetching popular AI research...`);
      const famousPapers = await fetchArxivPapers("state of the art ai machine learning");
      const existingIds = new Set(arxivCandidates.map(c => c.id));
      const newFamous = famousPapers.filter(c => !existingIds.has(c.id)).slice(0, 15);
      arxivCandidates = [...arxivCandidates, ...newFamous];
    }

    // Update background store with enriched ArXiv results
    const scoredArxiv = scoreAndRank(arxivCandidates, state.parsedInput);
    enrichmentStore.update(state.requestId, scoredArxiv);

    const mergedCandidates = [...hfCandidates, ...githubCandidates];
    
    console.log(`[OpenClaw] Step: retrieve_candidates -> Found ${mergedCandidates.length} immediate candidates (ArXiv enriched: ${arxivCandidates.length})`);
    
    return { 
      ...state, 
      hfCandidates, 
      githubCandidates, 
      arxivCandidates,
      mergedCandidates 
    };
  });

  OpenClaw.register("expand_search_context", async (state) => {
    if (!state.mergedCandidates || state.mergedCandidates.length === 0) return state;

    // Extract keywords from top candidates for recursive discovery
    const allTags = state.mergedCandidates.flatMap(c => c.tags);
    const tagCounts: Record<string, number> = {};
    allTags.forEach(tag => {
      const t = tag.toLowerCase();
      if (t.length > 2) tagCounts[t] = (tagCounts[t] || 0) + 1;
    });

    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(e => e[0])
      .slice(0, 3);

    if (sortedTags.length === 0) return state;

    console.log(`[OpenClaw] Step: expand_search_context -> Identified expansion keywords: ${sortedTags.join(", ")}`);
    
    const expansionResults = await Promise.all(
        sortedTags.map(tag => fetchHFModels(tag))
    );
    
    const expandedCandidates = expansionResults.flat();
    const uniqueExpanded = expandedCandidates.filter(ec => 
        !state.mergedCandidates?.some(mc => mc.id === ec.id)
    );

    console.log(`[OpenClaw] Step: expand_search_context -> Discovered ${uniqueExpanded.length} new candidates via recursive retrieval`);

    return { 
      ...state, 
      expandedCandidates: uniqueExpanded,
      mergedCandidates: [...(state.mergedCandidates || []), ...uniqueExpanded]
    };
  });

  OpenClaw.register("score_candidates", async (state) => {
    if (!state.mergedCandidates || !state.parsedInput) throw new Error("Missing state for scoring");
    
    const scoredCandidates = scoreAndRank(state.mergedCandidates, state.parsedInput);
    console.log(`[OpenClaw] Step: score_candidates -> Scored ${scoredCandidates.length} candidates`);
    
    return { ...state, scoredCandidates, rankedCandidates: scoredCandidates };
  });

  OpenClaw.register("analyze_trends", async (state) => {
    return state;
  });

  OpenClaw.register("check_compatibility", async (state) => {
    return state;
  });

  OpenClaw.register("build_report", async (state) => {
    if (!state.scoredCandidates || !state.parsedInput) throw new Error("Missing state for report");
    
    const report = buildReport(state.parsedInput, state.scoredCandidates);
    console.log(`[OpenClaw] Step: build_report -> Generated final PRISM report`);
    
    return { ...state, report };
  });
}
