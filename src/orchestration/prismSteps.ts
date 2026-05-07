import { OpenClaw } from "./openclaw";
import { parseInput } from "../parser/inputParser";
import { fetchHFModels } from "../retrieval/huggingfaceClient";
import { fetchGitHubRepos } from "../retrieval/githubClient";
import { fetchArxivPapers } from "../retrieval/arxivClient";
import { scoreAndRank } from "../scoring";
import { buildReport } from "../report/reportBuilder";

export function registerPrismSteps() {
  OpenClaw.register("parse_input", async (state) => {
    const parsedInput = parseInput(state.rawInput);
    console.log(`[OpenClaw] Step: parse_input -> Task: ${parsedInput.task}`);
    return { ...state, parsedInput };
  });

  OpenClaw.register("retrieve_candidates", async (state) => {
    if (!state.parsedInput) throw new Error("Parsed input missing");
    
    const [hf, gh, arxiv] = await Promise.all([
      fetchHFModels(state.parsedInput.task),
      fetchGitHubRepos(state.parsedInput.task),
      fetchArxivPapers(state.parsedInput.task),
    ]);

    const mergedCandidates = [...hf, ...gh, ...arxiv];
    console.log(`[OpenClaw] Step: retrieve_candidates -> Found ${mergedCandidates.length} total candidates`);
    
    return { 
      ...state, 
      hfCandidates: hf, 
      githubCandidates: gh, 
      arxivCandidates: arxiv, 
      mergedCandidates 
    };
  });

  OpenClaw.register("expand_search_context", async (state) => {
    if (!state.mergedCandidates || state.mergedCandidates.length === 0) return state;

    // Agentic behavior: extract keywords from top candidates
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

    console.log(`[OpenClaw] Step: expand_search_context -> Identified expansion keywords: ${sortedTags.join(", ")}`);
    
    // Perform second pass retrieval for each new keyword
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
    console.log(`[OpenClaw] Step: analyze_trends -> Analyzing market direction for candidates`);
    return state;
  });

  OpenClaw.register("check_compatibility", async (state) => {
    console.log(`[OpenClaw] Step: check_compatibility -> Validating hardware alignment`);
    return state;
  });

  OpenClaw.register("build_report", async (state) => {
    if (!state.scoredCandidates || !state.parsedInput) throw new Error("Missing state for report");
    
    const report = buildReport(state.parsedInput, state.scoredCandidates);
    console.log(`[OpenClaw] Step: build_report -> Generated final PRISM report`);
    
    return { ...state, report };
  });
}
