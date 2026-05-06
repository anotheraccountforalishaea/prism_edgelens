import { Candidate, ParsedInput } from "../schemas/types";

export function feasibilityScore(c: Candidate, input: ParsedInput): number {
  let score = 0;

  // Memory check — hard fail if model is too large
  if (c.sizeMB !== undefined) {
    if (c.sizeMB <= input.memoryMB) {
      score += 50;
    } else {
      return 0; // Auto-reject: exceeds memory budget
    }
  } else {
    // Unknown size — give partial credit, not a free pass
    score += 25;
  }

  // Latency feasibility (rough heuristic based on model size)
  if (c.sizeMB !== undefined && input.latencyMs > 0) {
    // Very rough: ~1ms per MB as a baseline on modern hardware
    const estimatedLatencyMs = c.sizeMB * 1;
    if (estimatedLatencyMs <= input.latencyMs) {
      score += 30;
    } else if (estimatedLatencyMs <= input.latencyMs * 2) {
      score += 15; // Marginal — might work with optimization
    }
    // else: 0 — likely too slow
  } else {
    score += 15; // Unknown latency — partial credit
  }

  // Optimization tags (quantization, pruning help with both memory + latency)
  const optimizationTags = ["quantized", "pruned", "int8", "int4", "fp16", "distilled", "compressed"];
  if (c.tags?.some(t => optimizationTags.includes(t.toLowerCase()))) {
    score += 20;
  }

  return Math.min(score, 100);
}