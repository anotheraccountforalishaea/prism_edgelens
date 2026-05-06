import { parseInput } from "./parser/inputParser";
import { Candidate } from "./parser/schemas/types";
import { fetchHFModels } from "./retrieval/huggingfaceClient";
import { fetchGitHubRepos } from "./retrieval/githubClient";
import { fetchArxivPapers } from "./retrieval/arxivClient";

// Pipeline entry point — runs parse → fetch → return candidates
export async function runPipeline(rawInput: string) {
  // Step 1: Parse user input
  const parsed = parseInput(rawInput);

  // Step 2: Fetch from all 3 sources in parallel (P2's code)
  const [hfModels, ghRepos, arxivPapers] = await Promise.all([
    fetchHFModels(parsed.task),
    fetchGitHubRepos(parsed.task),
    fetchArxivPapers(parsed.task),
  ]);

  const allCandidates: Candidate[] = [...hfModels, ...ghRepos, ...arxivPapers];

  // Step 3: Score and rank (P3 — TODO)
  // Step 4: Build report (P4 — TODO)

  return {
    parsed,
    status: "Pipeline steps 1-2 complete (parsing + retrieval). Awaiting P3/P4.",
    totalCandidates: allCandidates.length,
    huggingface: hfModels.slice(0, 5),
    github: ghRepos.slice(0, 5),
    arxiv: arxivPapers.slice(0, 5),
  };
}

// CLI test
if (require.main === module) {
  const input = process.argv.slice(2).join(" ") || "I need speech recognition on mobile offline";
  console.log("Input:", input);
  runPipeline(input).then((result) => {
    console.log(JSON.stringify(result, null, 2));
  });
}