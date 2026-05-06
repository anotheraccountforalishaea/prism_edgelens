import express from "express";
import cors from "cors";
import { runPipeline } from "./index";
import { ScoredCandidate, PRISMReport } from "./schemas/types";

const app = express();
app.use(cors());
app.use(express.json());

// Store scored candidates in memory so /explain/:id can look them up
let lastResults: ScoredCandidate[] = [];

// POST /evaluate — runs full pipeline, returns PRISMReport-shaped response
app.post("/evaluate", async (req, res) => {
  try {
    const { input } = req.body;

    if (!input || typeof input !== "string") {
      res.status(400).json({ error: "Missing 'input' field (string)" });
      return;
    }

    const { parsed, scored, allCandidates } = await runPipeline(input);

    // Cache for explain endpoint
    lastResults = scored;

    // Build a PRISMReport-shaped response
    // (P4's reportBuilder will replace this with a richer version)
    const topResults = scored.filter(c => c.feasibilityScore >= 40);
    const rejectedCandidates = allCandidates.filter(c => {
      return !scored.find(s => s.id === c.id);
    });

    const report: PRISMReport = {
      summary: {
        task: parsed.task,
        device: parsed.device,
        constraints: {
          memoryMB: parsed.memoryMB,
          latencyMs: parsed.latencyMs,
          offline: parsed.offline,
        },
      },
      topResults,
      rejectedResults: rejectedCandidates.map(c => ({
        candidate: c,
        reason: "Feasibility score too low (memory/latency constraint exceeded)",
      })),
      trendInsights: generateTrendInsights(scored),
      suggestions: generateSuggestions(parsed, scored),
    };

    res.json(report);
  } catch (error: any) {
    console.error("Pipeline error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /explain/:id — placeholder for P4's Ollama explainer
// P4 will wire this to ollamaExplainer.ts
app.get("/explain/:id", async (req, res) => {
  const candidateId = decodeURIComponent(req.params.id);
  const candidate = lastResults.find(c => c.id === candidateId);

  if (!candidate) {
    res.status(404).json({ error: `Candidate '${candidateId}' not found in last results` });
    return;
  }

  // TODO (P4): Replace with actual Ollama call
  // import { explainCandidate } from "./explainer/ollamaExplainer";
  // const explanation = await explainCandidate(candidate, lastParsedInput);
  const explanation = `[Placeholder] ${candidate.name} (${candidate.source}) — ` +
    `Match: ${candidate.matchScore}, Feasibility: ${candidate.feasibilityScore}, ` +
    `Confidence: ${candidate.confidenceScore}. ` +
    `Trend: ${candidate.trendDirection}. ` +
    `P4 will replace this with an Ollama-generated explanation.`;

  res.json({ id: candidate.id, explanation });
});

app.listen(3000, () => {
  console.log("🚀 PRISM server running on http://localhost:3000");
});

// --- Helper functions (will be replaced by P4's reportBuilder) ---

function generateTrendInsights(scored: ScoredCandidate[]): string[] {
  const insights: string[] = [];
  const rising = scored.filter(c => c.trendDirection === "rising");
  const declining = scored.filter(c => c.trendDirection === "declining");

  if (rising.length > 0) {
    insights.push(`${rising.length} of ${scored.length} top candidates are rising in popularity`);
  }
  if (declining.length > 0) {
    insights.push(`${declining.length} candidate(s) showing declining activity — may be losing community support`);
  }

  const hfCount = scored.filter(c => c.source === "huggingface").length;
  const ghCount = scored.filter(c => c.source === "github").length;
  if (hfCount > ghCount) {
    insights.push("More viable results found on HuggingFace than GitHub for this task");
  }

  return insights;
}

function generateSuggestions(parsed: any, scored: ScoredCandidate[]): string[] {
  const suggestions: string[] = [];

  if (parsed.offline) {
    suggestions.push("For offline deployment, prioritize models with ONNX/TFLite export support");
  }
  if (parsed.memoryMB <= 512) {
    suggestions.push("Consider INT8 quantization to fit within tight memory constraints");
  }

  const lowFeasibility = scored.filter(c => c.feasibilityScore < 50 && c.feasibilityScore > 0);
  if (lowFeasibility.length > 0) {
    suggestions.push(`${lowFeasibility.length} candidate(s) have marginal feasibility — model pruning or distillation may help`);
  }

  return suggestions;
}