# 🔍 PRISM EdgeLens — AI Project Feasibility Analyzer

> **Describe your AI project idea → Get scored, ranked candidates from HuggingFace, GitHub & ArXiv**
> Built for **Samsung PRISM Hackathon** | Theme: GenAI Research & Productivity

> 🎥 **Video Demonstration / Presentation:** [Watch on Youtube] https://youtu.be/cjLDePmpSiw?si=bNllHtCQe6Wuq8sS

---

## 📋 Table of Contents

1. [Problem Statement](#-problem-statement)
2. [Our Solution](#-our-solution)
3. [Solution Architecture & Explanation](#-solution-architecture--explanation)
4. [Complete Source Code Structure](#-complete-source-code-structure)
5. [Setup & Installation](#-setup--installation)
6. [Usage Instructions](#-usage-instructions)
7. [Execution Statements](#-execution-statements)
8. [Walkthrough](#-walkthrough)
9. [API Reference](#-api-reference)
10. [Technology Stack](#-technology-stack)
11. [Team](#-team)

---

## ❓ Problem Statement

### The Challenge

Deploying AI models on **edge devices** (mobile phones, Raspberry Pi, Jetson Nano, microcontrollers) presents a critical research gap:

1. **Discovery Overload**: There are thousands of AI models on HuggingFace, GitHub repos, and ArXiv papers. Engineers spend hours manually searching across platforms to find what fits their hardware constraints.
2. **Hardware-Feasibility Blindness**: Most model search tools ignore real-world constraints — RAM limits, latency SLAs, offline requirements, and device compatibility. A model that tops benchmarks may be completely unrunnable on a 512MB mobile device.
3. **No Cross-Platform Intelligence**: HuggingFace, GitHub, and ArXiv are siloed. No tool aggregates candidates from all three, scores them against hardware constraints, and ranks them in a unified view.
4. **Trend Blindness**: Engineers often pick models without knowing if they're rising in adoption or declining — leading to tech debt from day one.

### Who Faces This Problem?

- **Edge AI Engineers** evaluating models for constrained hardware
- **Research Teams** surveying the state of the art across platforms
- **Product Managers** assessing feasibility of AI features on target devices
- **Students & Hackathon Participants** needing quick, evidence-based model selection

---

## 💡 Our Solution

**PRISM EdgeLens** is an intelligent, multi-source AI project feasibility analyzer that:

1. **Parses natural language** project descriptions using a local LLM (Ollama/Llama3) to extract structured constraints (task type, device, RAM, latency, offline mode, framework preferences).
2. **Retrieves candidates** from three live sources simultaneously — **HuggingFace** (trending models), **GitHub** (starred repositories), and **ArXiv** (recent research papers).
3. **Scores every candidate** on three axes:
   - **Match Score (0–100)**: How well does this candidate align with the requested task?
   - **Feasibility Score (0–100)**: Can it physically run on the target device given RAM/latency constraints?
   - **Confidence Score (0–100)**: Is it popular, well-maintained, and cross-validated across sources?
4. **Analyzes trends** (rising / stable / declining) based on recent activity percentiles.
5. **Checks compatibility** (compatible / partial / incompatible) based on feasibility thresholds.
6. **Generates a structured report** with top results, rejected candidates (with reasons), trend insights, and architecture suggestions.
7. **Provides on-demand AI explanations** via Ollama — click "Why?" on any result to get a 2–3 sentence justification.
8. **Displays everything** in a professional 3-column dashboard (HuggingFace | GitHub | ArXiv) with animated score bars, trend badges, compatibility badges, and bookmark functionality.

### Key Differentiators

| Feature | PRISM EdgeLens | Traditional Search |
|---------|---------------|-------------------|
| Multi-source aggregation | ✅ HF + GitHub + ArXiv | ❌ Single platform |
| Hardware-aware scoring | ✅ RAM, latency, offline | ❌ No constraints |
| Trend analysis | ✅ Rising / Stable / Declining | ❌ No trend data |
| On-demand AI explanation | ✅ Ollama-powered "Why?" | ❌ Manual reading |
| Agentic fallback (auto-expand) | ✅ Auto-broadens sparse results | ❌ Static search |
| Soft + Hard constraint engine | ✅ Penalize, don't delete | ❌ Binary filter |

---

## 🧠 Solution Architecture & Explanation

### High-Level Pipeline

```
User Input (natural language)
       │
       ▼
┌─────────────────────┐
│   INPUT PARSER      │  ← Ollama LLM extracts structured constraints
│   (inputParser.ts)  │     task, device, RAM, latency, offline, etc.
└─────────┬───────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│            MULTI-SOURCE RETRIEVAL               │
│  ┌──────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ HuggingFace  │ │   GitHub    │ │   ArXiv   │ │
│  │ (50 models)  │ │ (100 repos) │ │ (5 papers)│ │
│  └──────┬───────┘ └──────┬──────┘ └─────┬─────┘ │
│         └────────┬───────┘              │       │
│                  ▼                      │       │
│          Merged Candidates         Background   │
│                  │               Enrichment     │
└──────────────────┼──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│        AGENTIC SEARCH EXPANSION                 │
│  • If GitHub < 10 results → fetch trending AI   │
│  • If ArXiv < 10 results → fetch famous papers  │
│  • Extract top tags → recursive HF expansion    │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│             SCORING ENGINE                      │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────┐ │
│  │MatchScorer  │ │Feasibility   │ │Confidence │ │
│  │ (tag/desc   │ │ (RAM/latency │ │ (stars/   │ │
│  │  matching)  │ │  /optimize)  │ │  downloads)│ │
│  └──────┬──────┘ └──────┬───────┘ └─────┬─────┘ │
│         └───────┬───────┘               │       │
│                 ▼                       │       │
│     Hard Constraints (RAM penalty)      │       │
│     Soft Constraints (framework,        │       │
│       license, FPS, accuracy, etc.)     │       │
│                 │                       │       │
│                 ▼                       │       │
│    Combined Score = Match×0.4 +         │       │
│      Feasibility×0.4 + Confidence×0.2  │       │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│           REPORT BUILDER                        │
│  • Top Results (feasibility ≥ 40)               │
│  • Rejected Results (with reasons)              │
│  • Trend Insights                               │
│  • Architecture Suggestions                     │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│         REACT DASHBOARD (Vite)                  │
│  3-column layout: HuggingFace | GitHub | ArXiv  │
│  ResultCards with ScoreBars, Badges, Bookmarks  │
│  "Why?" → Ollama on-demand explanation          │
└─────────────────────────────────────────────────┘
```

### OpenClaw Orchestration Engine

The pipeline is powered by **OpenClaw**, a custom agentic orchestration framework built for this project. It provides:

- **Step Registration**: Each pipeline stage (parse, retrieve, score, report) is a registered step function.
- **Sequential Execution**: Steps run in order with shared `WorkflowState`.
- **Timing & Logging**: Every step logs its duration for performance profiling.
- **Error Isolation**: A failing step stops the pipeline with a clear error message.
- **History Persistence**: Every query is saved to `recentQueries.json` for audit.

```typescript
const prismAgent = new OpenClaw()
  .step("parse_input")           // LLM-powered NLP parsing
  .step("retrieve_candidates")   // Multi-source fetch + agentic fallback
  .step("expand_search_context") // Recursive keyword expansion
  .step("score_candidates")      // 3-axis scoring + constraints
  .step("analyze_trends")        // Percentile-based trend detection
  .step("check_compatibility")   // Feasibility-derived compatibility
  .step("build_report");         // Final structured PRISMReport
```

### Scoring Algorithm Explained

Each candidate receives three independent scores (0–100), then a weighted combination:

| Scorer | Max Points | Criteria |
|--------|-----------|----------|
| **Match** | 100 | Tag match (+40), edge/mobile tags (+30), description keyword (+30), popularity bonus (+50 for >5k stars or >100k downloads) |
| **Feasibility** | 100 | Size ≤ RAM (+50), latency estimate OK (+30), optimization tags like quantized/onnx/tflite (+20) |
| **Confidence** | 100 | Downloads >50k or stars >2k (+50), cross-source corroboration (+30), recent activity (+30) |

**Hard Constraints** (applied as penalties, not deletions):
- Model size exceeds RAM → -60 penalty on feasibility
- Offline required but no offline tags → -40 penalty on feasibility

**Soft Constraints** (nuanced deductions):
- Framework mismatch → -15 confidence
- FPS requirement unlikely → -20 feasibility
- License unconfirmed → -10 confidence
- Data type mismatch → -20 match
- Deployment env mismatch → -15 feasibility

**Final Combined Score** = `Match × 0.4 + Feasibility × 0.4 + Confidence × 0.2`

---

## 📁 Complete Source Code Structure

```
prism_edgelens/
├── package.json                           ← Backend dependencies & scripts
├── tsconfig.json                          ← TypeScript strict mode config
├── README.md                              ← This file
│
├── src/                                   ← BACKEND (TypeScript + Express)
│   ├── index.ts                           ← Pipeline entry point (OpenClaw powered)
│   ├── server.ts                          ← Express server (POST /evaluate, GET /explain/:id)
│   │
│   ├── schemas/
│   │   └── types.ts                       ← All shared TypeScript interfaces
│   │                                        (ParsedInput, Candidate, ScoredCandidate, PRISMReport)
│   │
│   ├── parser/
│   │   ├── inputParser.ts                 ← Ollama LLM-powered NLP parser + regex fallback
│   │   └── schemas/
│   │       └── types.ts                   ← Legacy types (re-exported from schemas/)
│   │
│   ├── retrieval/
│   │   ├── huggingfaceClient.ts           ← Fetches 50 trending models from HuggingFace API
│   │   ├── githubClient.ts                ← Fetches 100 starred repos via GitHub Search API
│   │   └── arxivClient.ts                 ← Fetches 5 papers from ArXiv (XML→regex parse)
│   │
│   ├── scoring/
│   │   ├── index.ts                       ← Barrel export for scoring module
│   │   ├── matchScorer.ts                 ← Task alignment scoring (tags, description, popularity)
│   │   ├── feasibilityScorer.ts           ← Hardware feasibility scoring (RAM, latency, optimization)
│   │   ├── confidenceScorer.ts            ← Community confidence scoring (downloads, stars, activity)
│   │   ├── trendAnalyzer.ts               ← Percentile-based trend detection (rising/stable/declining)
│   │   ├── compatibilityChecker.ts        ← Feasibility-derived compatibility level
│   │   ├── hardConstraints.ts             ← Hard constraint gateway (softened to penalty model)
│   │   ├── softConstraints.ts             ← 7-dimension soft constraint evaluator
│   │   └── ranker.ts                      ← Master ranker: scores + constraints → sorted results
│   │
│   ├── explainer/
│   │   └── ollamaExplainer.ts             ← On-demand Ollama AI explanation per candidate
│   │
│   ├── report/
│   │   └── reportBuilder.ts               ← Final PRISMReport JSON builder
│   │
│   └── orchestration/
│       ├── openclaw.ts                    ← OpenClaw agentic orchestration engine
│       ├── prismSteps.ts                  ← All 7 pipeline steps registered here
│       └── enrichmentStore.ts             ← In-memory store for async ArXiv enrichment
│
└── frontend/                              ← FRONTEND (Vite + React + TypeScript)
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── App.tsx                        ← Main app: landing page + analytics dashboard
        ├── App.css                        ← Global styles
        ├── main.tsx                       ← React entry point
        ├── index.css                      ← Base CSS reset
        ├── api/
        │   └── apiClient.ts               ← API client (evaluate, explain, enrichment)
        ├── types/
        │   └── types.ts                   ← Frontend TypeScript interfaces
        └── components/
            ├── InputForm.tsx              ← Natural language input form
            ├── Dashboard.tsx              ← 3-column layout (HuggingFace | GitHub | ArXiv)
            ├── ResultCard.tsx             ← Candidate card with scores, badges, actions
            ├── ScoreBar.tsx               ← Animated horizontal score bar (0–100)
            ├── TrendBadge.tsx             ← Market trend indicator badge
            ├── CompatibilityBadge.tsx     ← Hardware compatibility badge
            ├── ExplainPopover.tsx          ← "Why?" button → Ollama AI explanation popover
            └── ExternalLink.tsx           ← Link to source (HuggingFace/GitHub/ArXiv)
```

---

## ⚙️ Setup & Installation

### Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Node.js** | v18+ | Runtime for backend and frontend |
| **npm** | v9+ | Package manager (comes with Node.js) |
| **Ollama** | Latest | Local LLM for input parsing & explanations |
| **Git** | Latest | Version control |

### Step 1 — Clone the Repository

```bash
git clone https://github.com/anotheraccountforalishaea/prism_edgelens.git
cd prism_edgelens
```

### Step 2 — Install Ollama (Required for LLM features)

Download from [https://ollama.com](https://ollama.com) and install. Then pull the model:

```bash
ollama pull llama3
```

> **Note**: If Ollama is not running, the input parser will fall back to a regex-based extractor. The "Why?" explanation feature will show a graceful error message. The core pipeline (retrieval + scoring) works without Ollama.

### Step 3 — Install Backend Dependencies

```bash
cd prism_edgelens
npm install
```

### Step 4 — Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 5 — (Optional) Set API Tokens for Higher Rate Limits

Create a `.env` file in the project root:

```env
HF_TOKEN=hf_your_huggingface_token_here
GITHUB_TOKEN=ghp_your_github_token_here
```

> Both APIs work **without tokens** but have lower rate limits. HuggingFace: unlimited basic, GitHub: 10 requests/minute without token.

---

## 🚀 Usage Instructions

### Running the Application

You need **two terminal windows** — one for the backend, one for the frontend.

#### Terminal 1 — Start Backend Server (Port 3000)

```bash
cd prism_edgelens
npx ts-node src/server.ts
```

You should see:
```
🚀 PRISM server running on http://localhost:3000
```

#### Terminal 2 — Start Frontend Dev Server (Port 5173)

```bash
cd prism_edgelens/frontend
npx vite
```

You should see:
```
  VITE v8.x.x  ready in XXXms

  ➜  Local:   http://localhost:5173/
```

#### Open in Browser

Navigate to **http://localhost:5173** in your browser.

### How to Use

1. **Enter your AI project description** in natural language. Be as specific as possible about:
   - What task you need (image classification, speech recognition, etc.)
   - What device you're targeting (mobile, Raspberry Pi, etc.)
   - Any constraints (RAM, latency, offline, framework preferences)

2. **Click "Initiate Intelligence Matrix"** to run the pipeline.

3. **View results** in the 3-column dashboard:
   - **HuggingFace / Models** — Pre-trained models sorted by combined score
   - **GitHub / Repositories** — Open-source projects sorted by relevance
   - **ArXiv / Research** — Academic papers (loaded asynchronously)

4. **Interact with results**:
   - Click **"Technical Rationale"** on any card to get an AI-generated explanation
   - Click **"Open Source"** to visit the original page
   - Click the **★ bookmark icon** to save candidates for later
   - Expand **"Technical Validation"** to see passed/failed constraint checks

5. **Review insights** at the bottom — Strategic Insights and Architecture Suggestions.

### Example Prompts to Try

```
I need image classification on mobile with 500MB RAM
I need speech recognition on mobile offline
I want text generation for desktop with pytorch framework
I need object detection on Raspberry Pi with 256MB RAM and 100ms latency
I need video processing on mobile with 500MB RAM offline
I want sentiment analysis for browser deployment with tensorflow
```

---

## ▶️ Execution Statements

### Start the Full Application

```bash
# Terminal 1: Backend
cd prism_edgelens
npm install
npx ts-node src/server.ts

# Terminal 2: Frontend
cd prism_edgelens/frontend
npm install
npx vite
```

### Run Pipeline via CLI (No Frontend Needed)

```bash
cd prism_edgelens
npx ts-node src/index.ts "I need image classification on mobile with 500MB RAM"
```

Expected CLI output:
```
🔍 Input: I need image classification on mobile with 500MB RAM
---
--- 🐾 OpenClaw Orchestration Start ---
[OpenClaw] Step: parse_input -> Task: image-classification, ID: abc123
✅ HuggingFace: Fetched 35 models for task "image-classification"
✅ GitHub: Fetched 100 repos for "(image OR classification) stars:>20"
⚠️ ArXiv fetch failed (safe fallback): timeout
[OpenClaw] Step: retrieve_candidates -> Found 135 immediate candidates
[OpenClaw] Step: expand_search_context -> Identified expansion keywords: pytorch, vision, transformers
[OpenClaw] Step: score_candidates -> Scored 175 candidates
[OpenClaw] Step: build_report -> Generated final PRISM report
--- 🐾 OpenClaw Orchestration End ---

=== PIPELINE RESULTS (OpenClaw Powered) ===
Task: image-classification
Device: mobile
Candidates fetched (including expansion): 175
Viable (scored): 175

--- Top 5 Results ---
#1: google/mobilenet-v2 (huggingface)
    Match: 100 | Feasibility: 100 | Confidence: 80
    Trend: rising | Compatibility: compatible
    URL: https://huggingface.co/google/mobilenet-v2
...
```

### Test Backend API Directly

```bash
# POST /evaluate
curl -X POST http://localhost:3000/evaluate \
  -H "Content-Type: application/json" \
  -d '{"input": "I need speech recognition on mobile offline"}'

# GET /explain/:id (after running /evaluate)
curl http://localhost:3000/explain/openai%2Fwhisper-base

# GET /enrichment/:requestId (poll for ArXiv results)
curl http://localhost:3000/enrichment/abc123
```

### Verify Backend is Running

```bash
curl http://localhost:3000/
# Response: "PRISM Backend is running. Powered by OpenClaw Orchestration."
```

---

## 🔄 Walkthrough

### End-to-End Flow

**Step 1: User enters a query**
```
"I need image classification on mobile with 500MB RAM"
```

**Step 2: Input Parser (Ollama LLM) extracts constraints**
```json
{
  "task": "image-classification",
  "device": "mobile",
  "memoryMB": 500,
  "latencyMs": 200,
  "offline": false
}
```

**Step 3: Multi-source retrieval runs in parallel**
- HuggingFace → 35 models (filtered by pipeline_tag, sorted by trendingScore)
- GitHub → 100 repos (search: `(image OR classification) stars:>20`, sorted by stars)
- ArXiv → 5 papers (search: `ti:image classification AND cat:cs.LG`)

**Step 4: Agentic fallback expands sparse results**
- If GitHub returned < 10 results → auto-fetches "trending ai" repos
- If ArXiv returned < 10 results → auto-fetches "state of the art ai" papers
- Top 3 frequent tags extracted → recursive HuggingFace expansion

**Step 5: Scoring engine evaluates every candidate**
- Each candidate gets Match, Feasibility, and Confidence scores (0–100)
- Hard constraints apply penalties (not deletions) for oversized models
- Soft constraints check framework, license, FPS, accuracy, deployment env
- Combined score = Match×0.4 + Feasibility×0.4 + Confidence×0.2
- Results sorted by combined score descending

**Step 6: Report builder generates final output**
- Top Results: candidates with feasibility ≥ 40
- Rejected Results: candidates below threshold (with rejection reasons)
- Trend Insights: "X of Y top results are rising in popularity"
- Suggestions: optimization tips based on constraints (quantization, pruning)

**Step 7: Dashboard renders results**
- 3-column layout separating sources
- Each card shows: source badge, trend badge, 3 animated score bars, compatibility badge
- "Technical Rationale" button calls Ollama for on-demand explanation
- "Open Source" button links to the original page
- Bookmark feature saves candidates to localStorage

---

## 📡 API Reference

### `POST /evaluate`

Run the full PRISM pipeline.

**Request:**
```json
{ "input": "I need image classification on mobile with 500MB RAM" }
```

**Response:** `PRISMReport` JSON object containing:
- `summary` — Parsed task, device, constraints
- `topResults` — Array of `ScoredCandidate` objects (feasibility ≥ 40)
- `rejectedResults` — Array of `{ candidate, reason }` objects
- `trendInsights` — Array of insight strings
- `suggestions` — Array of optimization suggestion strings
- `requestId` — Unique ID for enrichment polling

### `GET /explain/:id`

Get an AI-generated explanation for a specific candidate.

**Response:**
```json
{ "id": "google/mobilenet-v2", "explanation": "MobileNetV2 is an excellent fit..." }
```

### `GET /enrichment/:requestId`

Poll for asynchronous ArXiv enrichment results.

**Response:**
```json
{ "requestId": "abc123", "arxivResults": [...], "status": "completed" }
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend Runtime** | Node.js v18+ | Server-side JavaScript |
| **Backend Language** | TypeScript (strict mode) | Type-safe development |
| **Backend Framework** | Express v5 | REST API server |
| **HTTP Client** | Axios | External API calls |
| **Frontend Framework** | React 19 | Component-based UI |
| **Frontend Build** | Vite 8 | Fast HMR dev server |
| **Local LLM** | Ollama (Llama3) | Input parsing & explanations |
| **Data Sources** | HuggingFace, GitHub, ArXiv | AI model/project/paper discovery |
| **Orchestration** | OpenClaw (custom) | Agentic pipeline engine |

### External APIs (All Free, No Payment Required)

| API | Auth Required | Rate Limit |
|-----|--------------|------------|
| HuggingFace Models API | Optional token | Unlimited (basic) |
| GitHub Search API | Optional token | 10 req/min (unauthenticated) |
| ArXiv Query API | None | Best-effort (10s timeout) |
| Ollama Local API | None (local) | Unlimited (local) |

---

## 🔧 Important Notes

### TypeScript Strict Mode

This project uses `exactOptionalPropertyTypes: true`. Optional fields must use `| undefined`:
```typescript
// ✅ Correct
sizeMB?: number | undefined;

// ❌ Will cause type error
sizeMB?: number;
```

### Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Backend (Express) | 3000 | `http://localhost:3000` |
| Frontend (Vite) | 5173 | `http://localhost:5173` |

### Graceful Degradation

- **Ollama offline** → Parser falls back to regex extraction; "Why?" shows error message
- **ArXiv timeout** → Pipeline continues without papers; enrichment polls later
- **GitHub rate limited** → Returns empty array; cached results used if available
- **HuggingFace down** → Returns empty array; pipeline continues with other sources

---

## 👥 Team

| Person | Role | Modules |
|--------|------|---------|
| P1 | Orchestration + Parser + Frontend Shell | `index.ts`, `server.ts`, `inputParser.ts`, `App.tsx`, `openclaw.ts`, `prismSteps.ts` |
| P2 | Data Retrieval + Trend Signals | `huggingfaceClient.ts`, `githubClient.ts`, `arxivClient.ts` |
| P3 | Scoring + Trend Analysis + Ranking | `matchScorer.ts`, `feasibilityScorer.ts`, `confidenceScorer.ts`, `trendAnalyzer.ts`, `compatibilityChecker.ts`, `ranker.ts`, `softConstraints.ts`, `hardConstraints.ts` |
| P4 | Explainer + Report + Dashboard UI | `ollamaExplainer.ts`, `reportBuilder.ts`, `Dashboard.tsx`, `ResultCard.tsx`, `ScoreBar.tsx`, `TrendBadge.tsx`, `CompatibilityBadge.tsx`, `ExplainPopover.tsx`, `ExternalLink.tsx`, `InputForm.tsx` |

---

## 📄 License

This project was built for the Samsung PRISM Hackathon (GenAI Research & Productivity theme).