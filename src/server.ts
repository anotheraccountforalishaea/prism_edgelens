import express from "express";
import cors from "cors";
import { runPipeline } from "./index";
import { ScoredCandidate, PRISMReport, ParsedInput } from "./schemas/types";
import { buildReport } from "./report/reportBuilder";
import { explainCandidate } from "./explainer/ollamaExplainer";
import { enrichmentStore } from "./orchestration/enrichmentStore";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("PRISM Backend is running. Powered by OpenClaw Orchestration.");
});

// Store results and parsed input in memory so /explain/:id can look them up
let lastResults: ScoredCandidate[] = [];
let lastParsedInput: ParsedInput | null = null;

// POST /evaluate — runs full pipeline, returns PRISMReport-shaped response
app.post("/evaluate", async (req, res) => {
  try {
    const { input } = req.body;

    if (!input || typeof input !== "string") {
      res.status(400).json({ error: "Missing 'input' field (string)" });
      return;
    }

    const { parsed, scored, report, requestId } = await runPipeline(input);

    // Cache for explain endpoint
    lastResults = scored;
    lastParsedInput = parsed;

    res.json({ ...report, requestId });
  } catch (error: any) {
    console.error("Pipeline error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /explain/:id — placeholder for P4's Ollama explainer
app.get("/explain/:id", async (req, res) => {
  const candidateId = decodeURIComponent(req.params.id);
  const candidate = lastResults.find(c => c.id === candidateId);

  if (!candidate) {
    res.status(404).json({ error: `Candidate '${candidateId}' not found in last results` });
    return;
  }

  if (!lastParsedInput) {
    res.status(400).json({ error: "No pipeline has been run yet" });
    return;
  }

  try {
    const explanation = await explainCandidate(candidate, lastParsedInput);
    res.json({ id: candidate.id, explanation });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate explanation with Ollama" });
  }
});

app.get("/enrichment/:requestId", (req, res) => {
  const { requestId } = req.params;
  const data = enrichmentStore.get(requestId);
  
  if (!data) {
    return res.status(404).json({ error: "Request not found" });
  }
  
  res.json(data);
});

app.listen(3000, () => {
  console.log("🚀 PRISM server running on http://localhost:3000");
});