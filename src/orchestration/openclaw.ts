import * as fs from "fs";
import { ParsedInput, Candidate, ScoredCandidate, PRISMReport } from "../schemas/types";

export interface WorkflowState {
  rawInput: string;
  requestId?: string;
  parsedInput?: ParsedInput;
  hfCandidates?: Candidate[];
  githubCandidates?: Candidate[];
  arxivCandidates?: Candidate[];
  mergedCandidates?: Candidate[];
  expandedCandidates?: Candidate[];
  scoredCandidates?: ScoredCandidate[];
  rankedCandidates?: ScoredCandidate[];
  report?: PRISMReport;
  logs: string[];
}

type StepFunction = (state: WorkflowState) => Promise<WorkflowState> | WorkflowState;

export class OpenClaw {
  private steps: { name: string; fn: StepFunction }[] = [];
  private static registry: Map<string, StepFunction> = new Map();

  static register(name: string, fn: StepFunction) {
    this.registry.set(name, fn);
  }

  step(name: string, fn?: StepFunction): this {
    if (fn) {
      this.steps.push({ name, fn });
    } else {
      const registeredFn = OpenClaw.registry.get(name);
      if (registeredFn) {
        this.steps.push({ name: name, fn: registeredFn });
      } else {
        throw new Error(`Step "${name}" is not registered and no function was provided.`);
      }
    }
    return this;
  }

  async run(initialInput: string): Promise<WorkflowState> {
    let state: WorkflowState = {
      rawInput: initialInput,
      logs: [`🚀 Initializing OpenClaw pipeline for: "${initialInput}"`],
    };

    console.log(`\n--- 🐾 OpenClaw Orchestration Start ---`);
    
    for (const step of this.steps) {
      const startTime = Date.now();
      state.logs.push(`[${step.name}] Starting...`);
      
      try {
        state = await step.fn(state);
        const duration = Date.now() - startTime;
        state.logs.push(`[${step.name}] Completed in ${duration}ms`);
      } catch (error: any) {
        state.logs.push(`[${step.name}] FAILED: ${error.message}`);
        console.error(`❌ Step "${step.name}" failed:`, error);
        throw error;
      }
    }

    state.logs.push(`🏁 OpenClaw pipeline finished.`);
    console.log(`--- 🐾 OpenClaw Orchestration End ---\n`);
    
    this.saveToHistory(state);
    
    return state;
  }

  private saveToHistory(state: WorkflowState) {
    try {
      const historyFile = "recentQueries.json";
      let history: any[] = [];
      if (fs.existsSync(historyFile)) {
        history = JSON.parse(fs.readFileSync(historyFile, "utf-8"));
      }
      
      const entry = {
        timestamp: new Date().toISOString(),
        input: state.rawInput,
        task: state.parsedInput?.task,
        candidateCount: state.mergedCandidates?.length || 0,
        topResult: state.scoredCandidates?.[0]?.name
      };

      history.unshift(entry);
      fs.writeFileSync(historyFile, JSON.stringify(history.slice(0, 50), null, 2));
    } catch (err) {
      console.warn("Could not save to history:", err);
    }
  }
}
