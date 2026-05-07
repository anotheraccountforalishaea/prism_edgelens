import { parseInput } from "./parser/inputParser";
import { Candidate, ScoredCandidate, ParsedInput, PRISMReport } from "./schemas/types";
import { fetchHFModels } from "./retrieval/huggingfaceClient";
import { fetchGitHubRepos } from "./retrieval/githubClient";
import { fetchArxivPapers } from "./retrieval/arxivClient";
import { scoreAndRank } from "./scoring";
import { buildReport } from "./report/reportBuilder";

// Pipeline entry point — runs parse → fetch → score → return ranked results
export async function runPipeline(rawInput: string): Promise<{
  parsed: ParsedInput;
  scored: ScoredCandidate[];
  allCandidates: Candidate[];
  report: PRISMReport;
}> {
  // Step 1: Parse user input
  const parsed = parseInput(rawInput);
  console.log(`📝 Parsed input: task="${parsed.task}", device="${parsed.device}", memory=${parsed.memoryMB}MB`);

  // Step 2: Fetch from all 3 sources in parallel (P2's code)
  const [hfModels, ghRepos, arxivPapers] = await Promise.all([
    fetchHFModels(parsed.task),
    fetchGitHubRepos(parsed.task),
    fetchArxivPapers(parsed.task),
  ]);

  const allCandidates: Candidate[] = [...hfModels, ...ghRepos, ...arxivPapers];
  console.log(`📦 Total candidates fetched: ${allCandidates.length} (HF: ${hfModels.length}, GH: ${ghRepos.length}, ArXiv: ${arxivPapers.length})`);

  // Step 3: Score and rank (P3's code)
  const scored = scoreAndRank(allCandidates, parsed);
  console.log(`🏆 Scored & ranked: ${scored.length} viable candidates (${allCandidates.length - scored.length} rejected)`);

  // Step 4: Build report (P4)
  const report = buildReport(parsed, scored);

  return {
    parsed,
    scored,
    allCandidates,
    report,
  };
}

// CLI test
if (require.main === module) {
  const input = process.argv.slice(2).join(" ") || "I need speech recognition on mobile offline";
  console.log("🔍 Input:", input);
  console.log("---");
  runPipeline(input).then((result) => {
    console.log("\n=== PIPELINE RESULTS ===");
    console.log(`Task: ${result.parsed.task}`);
    console.log(`Device: ${result.parsed.device}`);
    console.log(`Candidates fetched: ${result.allCandidates.length}`);
    console.log(`Viable (scored): ${result.scored.length}`);
    console.log("\n--- Top 5 Results ---");
    result.scored.slice(0, 5).forEach((c, i) => {
      console.log(`\n#${i + 1}: ${c.name} (${c.source})`);
      console.log(`    Match: ${c.matchScore} | Feasibility: ${c.feasibilityScore} | Confidence: ${c.confidenceScore}`);
      console.log(`    Trend: ${c.trendDirection} | Compatibility: ${c.compatibility}`);
      console.log(`    URL: ${c.url}`);
    });
  });
}