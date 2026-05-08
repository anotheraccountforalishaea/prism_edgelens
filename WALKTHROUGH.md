# PRISM EdgeLens — Complete Walkthrough

> A detailed walkthrough of the PRISM EdgeLens system, covering every module, data flow, and design decision.

---

## 1. System Overview

PRISM EdgeLens is an **AI Project Feasibility Analyzer** that takes a natural-language project description and returns scored, ranked candidates from three live sources: HuggingFace, GitHub, and ArXiv. It is built for the Samsung PRISM Hackathon (GenAI Research & Productivity theme).

The system is split into a **TypeScript backend** (Express, port 3000) and a **React frontend** (Vite, port 5173). An optional local LLM (**Ollama / Llama3**) powers intelligent input parsing and on-demand candidate explanations.

---

## 2. Pipeline Walkthrough (Step by Step)

### Step 1 — User Input

The user types a natural-language description of their AI project in the frontend's `InputForm.tsx` component. Example:

```
I need image classification on mobile with 500MB RAM
```

The frontend calls `POST /evaluate` on the backend via [apiClient.ts](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/frontend/src/api/apiClient.ts), sending `{ input: "..." }`.

---

### Step 2 — OpenClaw Orchestration Engine

The backend entry point [index.ts](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/src/index.ts) creates an OpenClaw pipeline:

```typescript
const prismAgent = new OpenClaw()
  .step("parse_input")
  .step("retrieve_candidates")
  .step("expand_search_context")
  .step("score_candidates")
  .step("analyze_trends")
  .step("check_compatibility")
  .step("build_report");
```

[OpenClaw](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/src/orchestration/openclaw.ts) is a custom orchestration engine that:
- Maintains a shared `WorkflowState` across all steps
- Executes steps sequentially with timing/logging
- Saves every query to `recentQueries.json` for history
- Provides error isolation per step

All seven steps are registered in [prismSteps.ts](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/src/orchestration/prismSteps.ts).

---

### Step 3 — Input Parsing (`parse_input`)

**File**: [inputParser.ts](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/src/parser/inputParser.ts)

The parser sends the user's raw text to Ollama (`POST http://localhost:11434/api/generate`) with a structured system prompt that instructs the LLM to extract:

| Field | Type | Example |
|-------|------|---------|
| `task` | string | `"image-classification"` |
| `device` | string | `"mobile"` |
| `memoryMB` | number | `500` |
| `latencyMs` | number | `200` |
| `offline` | boolean | `false` |
| `deployEnv` | string[] | `["edge", "mobile"]` |
| `framework` | string[] | `["pytorch"]` |
| `license` | string | `"open-source"` |
| `fpsRequired` | number | `30` |
| `accuracyMin` | number | `90` |

**Fallback**: If Ollama is unavailable, a regex-based `extractTaskFallback()` function maps keywords to task types (e.g., "speech" → `"automatic-speech-recognition"`), with safe defaults for all other fields.

The parsed output conforms to the `ParsedInput` interface defined in [types.ts](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/src/schemas/types.ts).

---

### Step 4 — Multi-Source Retrieval (`retrieve_candidates`)

Three API clients fetch candidates in parallel:

#### HuggingFace — [huggingfaceClient.ts](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/src/retrieval/huggingfaceClient.ts)
- **API**: `GET https://huggingface.co/api/models?pipeline_tag=...&sort=trendingScore&limit=50&full=true`
- **Pre-filtering**: Rejects models with <500 downloads, dataset/space types, and models without valid framework tags (pytorch, transformers, onnx, tflite, gguf)
- **Output fields**: `id`, `name`, `url`, `description`, `tags`, `sizeMB` (from safetensors), `downloads`, `recentActivity` (30-day downloads)

#### GitHub — [githubClient.ts](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/src/retrieval/githubClient.ts)
- **API**: `GET https://api.github.com/search/repositories?q=...&sort=stars&per_page=100`
- **Smart search**: Multi-word tasks use OR logic — `"image classification"` → `"(image OR classification) stars:>20"`
- **Trend signal**: `recentActivity` = `max(0, 100 - daysSinceLastPush)` — rewards recently active repos

#### ArXiv — [arxivClient.ts](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/src/retrieval/arxivClient.ts)
- **API**: `GET http://export.arxiv.org/api/query?search_query=ti:...&cat:cs.LG&max_results=5`
- **XML parsing**: Extracts `id`, `title`, `summary`, `published` via regex
- **Fault tolerant**: 10-second timeout; failure returns empty array without breaking pipeline

#### Agentic Fallback (Intelligent Auto-Expansion)

The `retrieve_candidates` step includes **agentic fallback logic**:

1. **GitHub sparse** (<10 results) → Automatically fetches `"trending ai"` repos globally and merges unique results
2. **ArXiv sparse** (<10 results) → Automatically fetches `"state of the art ai machine learning"` papers and merges unique results

ArXiv results are scored immediately and stored in the [enrichmentStore.ts](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/src/orchestration/enrichmentStore.ts) for async delivery to the frontend via `GET /enrichment/:requestId`.

---

### Step 5 — Search Context Expansion (`expand_search_context`)

After initial retrieval, the pipeline performs **recursive keyword expansion**:

1. Collects all tags from merged candidates
2. Counts tag frequency, selects top 3 most common tags
3. Runs additional HuggingFace queries for each top tag
4. Deduplicates against existing candidates
5. Merges new discoveries into the candidate pool

This typically expands the candidate pool from ~150 to ~200+ candidates, surfacing models that weren't directly tagged for the primary task but are related via shared technology.

---

### Step 6 — Scoring Engine (`score_candidates`)

Every candidate passes through the full scoring pipeline orchestrated by [ranker.ts](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/src/scoring/ranker.ts):

#### 6a. Match Scorer — [matchScorer.ts](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/src/scoring/matchScorer.ts)

Measures how well the candidate aligns with the user's task:

| Criteria | Points |
|----------|--------|
| Exact tag match with task | +40 |
| Partial tag match (substring) | +20 |
| Edge/mobile deployment tags (onnx, tflite, coreml) | +30 |
| Task keyword found in description | +30 |
| Partial word overlap in description | Up to +20 |
| High popularity (>5k stars or >100k downloads) | +50 |
| **Maximum** | **100** |

#### 6b. Feasibility Scorer — [feasibilityScorer.ts](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/src/scoring/feasibilityScorer.ts)

Measures whether the candidate can run on the target hardware:

| Criteria | Points |
|----------|--------|
| Model size ≤ RAM limit | +50 |
| Unknown size (partial credit) | +30 |
| Estimated latency within SLA | +30 |
| Estimated latency within 2× SLA | +15 |
| Has optimization tags (quantized, pruned, int8, etc.) | +20 |
| **Maximum** | **100** |

**Key design decision**: Models that exceed RAM are **not deleted** — they receive 0 points for the memory check but can still appear in results with low feasibility scores. This ensures famous large models (GPT, LLaMA) still surface with appropriate warnings.

#### 6c. Confidence Scorer — [confidenceScorer.ts](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/src/scoring/confidenceScorer.ts)

Measures community trust and validation:

| Criteria | Points |
|----------|--------|
| Downloads >50k or stars >2k | +50 |
| Downloads >5k or stars >200 | +25 |
| Appears in multiple sources (HF + GitHub) | +30 |
| Recent activity >100 | +30 |
| Recent activity >10 | +15 |
| **Maximum** | **100** |

#### 6d. Trend Analyzer — [trendAnalyzer.ts](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/src/scoring/trendAnalyzer.ts)

Uses percentile-based analysis across all candidates:
- `recentActivity` ≥ 75th percentile → **Rising** 🔥
- `recentActivity` ≤ 25th percentile → **Declining** ↓
- `recentActivity` < 5 (stale) → **Declining** ↓
- Otherwise → **Stable** →

#### 6e. Hard Constraints — [ranker.ts](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/src/scoring/ranker.ts#L38-L51)

Applied as **penalties** (not binary exclusions):
- Model size exceeds RAM → **-60 feasibility penalty** + adds "Exceeds RAM" to failedChecks
- Offline required but no offline-compatible tags → **-40 feasibility penalty** + adds "Likely requires cloud API" to failedChecks

#### 6f. Soft Constraints — [softConstraints.ts](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/src/scoring/softConstraints.ts)

Evaluates 7 optional dimensions with nuanced penalties:

| Dimension | Penalty Target | Points |
|-----------|---------------|--------|
| Framework mismatch | Confidence | -15 |
| FPS requirement unlikely | Feasibility | -20 |
| License unconfirmed | Confidence | -10 |
| Data type mismatch | Match | -20 |
| Deployment env mismatch | Feasibility | -15 |
| Accuracy unverifiable | Confidence | -10 |
| Budget constrained | — | +pass (free to use) |

Each soft check generates either a `✅ passed` or `⚠️ failed` message displayed in the ResultCard's "Technical Validation" section.

#### 6g. Final Ranking

```
Combined Score = Match × 0.4 + Feasibility × 0.4 + Confidence × 0.2
```

Candidates are sorted by combined score (descending). The compatibility level is derived from final feasibility:
- ≥ 70 → **Compatible** ✅
- 40–69 → **Partial** ⚠️
- < 40 → **Incompatible** ❌

---

### Step 7 — Report Builder (`build_report`)

**File**: [reportBuilder.ts](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/src/report/reportBuilder.ts)

Generates the final `PRISMReport`:
- **topResults**: All candidates with feasibility ≥ 40
- **rejectedResults**: Candidates below 40, with reasons ("Hard fail on memory constraints" or "Low feasibility score")
- **trendInsights**: e.g., "5 of 12 top results are rising in popularity"
- **suggestions**: Context-aware tips (e.g., "Consider INT8 quantization" if RAM < 1GB)

---

### Step 8 — Express API Layer

**File**: [server.ts](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/src/server.ts)

Three endpoints serve the frontend:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/evaluate` | POST | Runs full pipeline, returns PRISMReport |
| `/explain/:id` | GET | Calls Ollama for on-demand AI explanation |
| `/enrichment/:requestId` | GET | Returns async ArXiv enrichment results |

The server caches `lastResults` and `lastParsedInput` in memory so the `/explain/:id` endpoint can look up candidates from the most recent pipeline run.

---

### Step 9 — Frontend Dashboard

**File**: [App.tsx](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/frontend/src/App.tsx)

The frontend has two states:

**Landing State** — Shows the `InputForm` with a textarea and "Initiate Intelligence Matrix" button. Displays discovery depth (150+ candidates), analysis engine (OpenClaw v2.1), and search mode (Multi-Keyword OR).

**Results State** — Shows:
1. **Constraint Summary Bar** — Parsed task, hardware, RAM, latency SLA
2. **Dashboard** — 3-column layout via [Dashboard.tsx](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/frontend/src/components/Dashboard.tsx):
   - HuggingFace / Models
   - GitHub / Repositories
   - ArXiv / Research
3. **Result Cards** — Each card ([ResultCard.tsx](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/frontend/src/components/ResultCard.tsx)) shows:
   - Source badge + trend badge
   - Model name + truncated description
   - 3 animated score bars (Match, Feasibility, Confidence)
   - Compatibility badge
   - "Technical Rationale" button (Ollama explanation)
   - "Open Source" link to original page
   - Bookmark (★) toggle saved to localStorage
   - Expandable "Technical Validation" (passed/failed checks)
4. **ArXiv Enrichment** — "Secondary enrichment active" banner while polling
5. **Strategic Insights + Architecture Suggestions** sections

**Async ArXiv Polling**: After the initial `/evaluate` response, the frontend polls `GET /enrichment/:requestId` every 2 seconds (up to 20 attempts) to merge ArXiv results into the dashboard.

---

## 3. Key Design Decisions

### Why "Penalize, Don't Delete"?
Traditional search tools binary-filter candidates that exceed constraints. PRISM uses a **penalty model** instead — oversized models still appear with low feasibility scores and clear warnings. This ensures engineers see famous models (like GPT-4, LLaMA) even if they're too large, because they provide architectural inspiration and may have quantized variants.

### Why OpenClaw Instead of Simple Function Calls?
OpenClaw provides structured logging, timing, error isolation, and history persistence. It also enables future extensibility — adding a new pipeline step requires only registering a new function, not refactoring the main flow.

### Why Regex Fallback for Input Parsing?
Ollama may not be installed or running on all machines. The regex fallback ensures the pipeline always works — even without an LLM, users get results based on keyword detection with sensible defaults.

### Why Separate ArXiv Enrichment?
ArXiv's API is slow and unreliable (10s timeout). Instead of blocking the entire pipeline, ArXiv runs asynchronously. The frontend receives immediate HuggingFace + GitHub results and then polls for ArXiv data, providing a progressive loading experience.

---

## 4. Files Created / Modified

This walkthrough and README creation involved **no source code changes**. Only the following documentation file was updated:

| File | Action | Purpose |
|------|--------|---------|
| [README.md](file:///c:/Users/alish/OneDrive/Desktop/prism_edgelens/README.md) | Overwritten | Complete README with Problem, Solution, Setup, Instructions, Usage, Execution, Walkthrough, Source Code structure |

All `.ts`, `.tsx`, `.css`, and config files remain **unchanged**.
