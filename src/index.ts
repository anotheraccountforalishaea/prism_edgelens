import { OpenClaw } from "./orchestration/openclaw";
import { registerPrismSteps } from "./orchestration/prismSteps";
import { ScoredCandidate, ParsedInput, PRISMReport, Candidate } from "./schemas/types";

// Initialize OpenClaw steps
registerPrismSteps();

/**
 * PRISM Pipeline Entry Point
 * Now powered by OpenClaw orchestration for modular, agentic workflow.
 */
export async function runPipeline(rawInput: string): Promise<{
  parsed: ParsedInput;
  scored: ScoredCandidate[];
  allCandidates: Candidate[];
  report: PRISMReport;
}> {
  const prismAgent = new OpenClaw()
    .step("parse_input")
    .step("retrieve_candidates")
    .step("expand_search_context")
    .step("score_candidates")
    .step("analyze_trends")
    .step("check_compatibility")
    .step("build_report");

  const state = await prismAgent.run(rawInput);

  if (!state.parsedInput || !state.scoredCandidates || !state.report) {
    throw new Error("Pipeline failed to complete all critical steps.");
  }

  return {
    parsed: state.parsedInput,
    scored: state.scoredCandidates,
    allCandidates: state.mergedCandidates || [],
    report: state.report,
  };
}

// CLI test
if (require.main === module) {
  const input = process.argv.slice(2).join(" ") || "I need speech recognition on mobile offline";
  console.log("🔍 Input:", input);
  console.log("---");
  runPipeline(input).then((result) => {
    console.log("\n=== PIPELINE RESULTS (OpenClaw Powered) ===");
    console.log(`Task: ${result.parsed.task}`);
    console.log(`Device: ${result.parsed.device}`);
    console.log(`Candidates fetched (including expansion): ${result.allCandidates.length}`);
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