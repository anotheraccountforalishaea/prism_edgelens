# 🔍 PRISM — AI Project Feasibility Analyzer

> Describe your AI project idea → Get scored, ranked candidates from HuggingFace, GitHub & ArXiv  
> Built for Samsung PRISM Hackathon | Theme: GenAI Research & Productivity

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ ([download](https://nodejs.org))
- Two terminal windows

### Run the app

```bash
# Terminal 1 — Start Backend (port 3000)
cd Desktop\prism_edgelens
npm install
npx ts-node src/server.ts

# Terminal 2 — Start Frontend (port 5173)
cd Desktop\prism_edgelens\frontend
npm install
npx vite
```

Open **http://localhost:5173** in your browser.

### Test prompts to try
```
I need image classification on mobile with 500MB RAM
I need speech recognition on mobile offline
I want text generation for desktop
I need video processing on mobile with 500MB RAM offline
```

---

## 📁 Project Structure

```
prism_edgelens/
├── package.json
├── tsconfig.json
├── README.md                          ← You are here
│
├── src/                               ← BACKEND
│   ├── index.ts                       ← Pipeline orchestrator (P1 + P2 wired)
│   ├── server.ts                      ← Express server (POST /evaluate on port 3000)
│   │
│   ├── parser/                        ← P1's work ✅
│   │   ├── inputParser.ts             ← Parses user text → structured query
│   │   └── schemas/
│   │       └── types.ts               ← ALL shared TypeScript interfaces
│   │
│   ├── retrieval/                     ← P2's work ✅
│   │   ├── huggingfaceClient.ts       ← Fetches 20 trending models from HuggingFace API
│   │   ├── githubClient.ts            ← Fetches 10 starred repos from GitHub API
│   │   └── arxivClient.ts            ← Fetches 5 papers from ArXiv (best-effort)
│   │
│   ├── scoring/                       ← P3's work 🔜
│   │   ├── matchScorer.ts             ← TODO: Score 0-100 how well candidate matches task
│   │   ├── feasibilityScorer.ts       ← TODO: Score 0-100 can it run on the device
│   │   ├── confidenceScorer.ts        ← TODO: Score 0-100 is it reliable/popular
│   │   ├── trendAnalyzer.ts           ← TODO: rising / stable / declining
│   │   ├── compatibilityChecker.ts    ← TODO: compatible / partial / incompatible
│   │   └── ranker.ts                  ← TODO: combine scores, sort, reject bad ones
│   │
│   ├── explainer/                     ← P4's work 🔜
│   │   └── ollamaExplainer.ts         ← TODO: on-demand AI explanation per result
│   │
│   └── report/                        ← P4's work 🔜
│       └── reportBuilder.ts           ← TODO: build final PRISMReport JSON
│
└── frontend/                          ← FRONTEND (Vite + React)
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx                    ← Current: basic form + raw JSON display
        ├── main.tsx                   ← React entry point
        └── components/                ← P4's work 🔜
            ├── Dashboard.tsx          ← TODO: 3-column layout (HF / GitHub / ArXiv)
            ├── ResultCard.tsx         ← TODO: card per candidate with scores
            ├── ScoreBar.tsx           ← TODO: animated 0-100 bar
            ├── TrendBadge.tsx         ← TODO: 🔥 rising / → stable / ↓ declining
            ├── CompatibilityBadge.tsx ← TODO: ✅ / ⚠️ / ❌ badge
            ├── ExplainPopover.tsx     ← TODO: "Why?" button → Ollama explanation
            └── ExternalLink.tsx       ← TODO: clickable link to HF / GitHub / ArXiv
```

---

## ✅ What's Done (P1 + P2)

### P1 — Orchestration + Input Parser
| File | What it does | Status |
|------|-------------|--------|
| `parser/inputParser.ts` | Detects task, device, RAM, offline from user text | ✅ Done |
| `parser/schemas/types.ts` | All shared interfaces (`Candidate`, `ScoredCandidate`, `PRISMReport`) | ✅ Done |
| `index.ts` | Pipeline: parse → fetch → (score → report) | ✅ Done |
| `server.ts` | Express server with `POST /evaluate` endpoint | ✅ Done |
| `frontend/src/App.tsx` | Basic form + Analyze button | ✅ Done |

### P2 — Data Retrieval + Trend Signals
| File | What it does | Status |
|------|-------------|--------|
| `retrieval/huggingfaceClient.ts` | Fetches 20 models via `GET /api/models?pipeline_tag=...&sort=trending` | ✅ Done |
| `retrieval/githubClient.ts` | Fetches 10 repos via GitHub Search API, sorted by stars | ✅ Done |
| `retrieval/arxivClient.ts` | Fetches 5 papers via ArXiv API (XML→regex parse, best-effort) | ✅ Done |

**Current pipeline output:**
```
Input: "I need image classification on mobile with 500MB RAM"
→ Parsed: { task: "image-classification", device: "mobile", memoryMB: 500 }
→ Fetched: 30 candidates (20 HuggingFace + 10 GitHub + 0 ArXiv)
→ Status: "Awaiting P3/P4"
```

---

## 🔜 What's Left (P3 + P4)

### P3 — Scoring + Trend Analysis + Compatibility

**Branch:** `p3-scoring`

Your files go in `src/scoring/`. Import types from:
```typescript
import { Candidate, ScoredCandidate, ParsedInput } from "../parser/schemas/types";
```

**Each candidate from P2 has these fields you'll use:**
```typescript
{
  id: "meta-llama/Llama-3-8B",
  name: "meta-llama/Llama-3-8B",
  source: "huggingface",          // or "github" or "arxiv"
  url: "https://huggingface.co/meta-llama/Llama-3-8B",
  description: "...",
  tags: ["pytorch", "llama", ...],
  sizeMB: 16000,                  // HuggingFace only (may be undefined)
  downloads: 500000,              // HuggingFace only
  stars: 1200,                    // GitHub only
  recentActivity: 500000,         // trend signal — higher = more active
}
```

**Files to create:**

1. **`matchScorer.ts`** — How well does this candidate match the user's task?
   - Tag keywords match → +40, edge/mobile support → +30, description match → +30

2. **`feasibilityScorer.ts`** — Can it actually run on the target device?
   - `sizeMB <= memoryMB` → +50 (fail = auto-reject), latency ok → +30, quantized → +20

3. **`confidenceScorer.ts`** — Is this a reliable, popular candidate?
   - downloads > 10k OR stars > 500 → +40, multi-source → +30, recently active → +30

4. **`trendAnalyzer.ts`** — Is this tech rising or falling?
   - `recentActivity` in top 25% → "rising", bottom 25% → "declining", else → "stable"

5. **`compatibilityChecker.ts`** — Compatible with user's constraints?
   - feasibilityScore >= 70 → "compatible", 40-69 → "partial", < 40 → "incompatible"

6. **`ranker.ts`** — Combine and sort
   - Score = match×0.4 + feasibility×0.4 + confidence×0.2, sort descending

**After building, update `index.ts`** to call your scorers after P2's fetch step.

---

### P4 — Explainer + Report + Dashboard UI

**Branch:** `p4-explainer`

**Backend files** (in `src/`):

1. **`explainer/ollamaExplainer.ts`** — On-demand AI explanation
   - Called when user clicks "Why?" button, NOT for all candidates
   - `POST http://localhost:11434/api/generate` (Ollama, free, local)

2. **`report/reportBuilder.ts`** — Build final `PRISMReport` JSON
   - Split into `topResults` (score >= 40) and `rejectedResults` (< 40)
   - Generate `trendInsights` and `suggestions` arrays

**Frontend components** (in `frontend/src/components/`):

3. **`Dashboard.tsx`** — 3-column layout: HuggingFace | GitHub | ArXiv
4. **`ResultCard.tsx`** — One card per candidate with 3 ScoreBars + badges + link
5. **`ScoreBar.tsx`** — Animated horizontal bar (green→yellow→red)
6. **`TrendBadge.tsx`** — "🔥 Rising" / "→ Stable" / "↓ Declining"
7. **`CompatibilityBadge.tsx`** — "✅ Compatible" / "⚠️ Partial" / "❌ Incompatible"
8. **`ExplainPopover.tsx`** — "Why?" button → calls `/explain/:id` → shows text
9. **`ExternalLink.tsx`** — Clickable link to actual HF/GitHub/ArXiv page

---

## 🔧 Important Notes

### API Info (ALL FREE)
- **HuggingFace**: No token needed for basic use. Optional token increases rate limit.
- **GitHub**: No token needed. Rate limit: 10 req/min without token.
- **ArXiv**: No token ever. Best-effort — may timeout (10s limit). Pipeline continues without it.
- **Ollama**: Free local AI. Install from https://ollama.com, then `ollama pull phi3`.

### TypeScript Strict Mode
This project uses `exactOptionalPropertyTypes: true`. If you get type errors on optional fields, use `| undefined`:
```typescript
// ❌ This will error:
sizeMB?: number;

// ✅ This works:
sizeMB?: number | undefined;
```

### Port Info
- Backend: **http://localhost:3000** (`POST /evaluate`)
- Frontend: **http://localhost:5173** (or 5174 if 5173 is busy)

### Git Workflow
```bash
git pull origin main           # Before starting work
git checkout -b p3-scoring     # Create your branch
# ... do your work ...
git add .
git commit -m "Add scoring engine"
git push origin p3-scoring     # Push your branch
# Create a Pull Request on GitHub
```

---

## 👥 Team

| Person | Role | Status |
|--------|------|--------|
| P1 | Orchestration + Parser + Frontend Shell | ✅ Done |
| P2 | Data Retrieval (HuggingFace + GitHub + ArXiv) | ✅ Done |
| P3 | Scoring + Trend Analysis + Ranking | 🔜 Next |
| P4 | Explainer + Report Builder + Dashboard UI | 🔜 Next |