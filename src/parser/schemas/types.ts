// Shared types for the PRISM project — ALL persons import from here

export interface ParsedInput {
  task: string;
  device: string;
  memoryMB: number;
  latencyMs: number;
  offline: boolean;
  rawText: string;
}

export type SourceType = "huggingface" | "github" | "arxiv";
export type TrendDirection = "rising" | "stable" | "declining";
export type CompatibilityLevel = "compatible" | "partial" | "incompatible";

export interface Candidate {
  id: string;
  name: string;
  source: SourceType;
  url: string;
  description: string;
  tags: string[];
  sizeMB?: number | undefined;
  downloads?: number | undefined;
  stars?: number | undefined;
  recentActivity?: number | undefined;
}

export interface ScoredCandidate extends Candidate {
  matchScore: number;
  feasibilityScore: number;
  confidenceScore: number;
  trendDirection: TrendDirection;
  compatibility: CompatibilityLevel;
  explanation?: string;
}

export interface PRISMReport {
  summary: {
    task: string;
    device: string;
    constraints: { memoryMB: number; latencyMs: number; offline: boolean };
  };
  topResults: ScoredCandidate[];
  rejectedResults: { candidate: Candidate; reason: string }[];
  trendInsights: string[];
  suggestions: string[];
}