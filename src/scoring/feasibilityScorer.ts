import { Candidate, ParsedInput } from "../schemas/types";

/**
 * Calculates a feasibility score (0-100) based on hardware constraints.
 * Softens rejection logic to ensure 'famous' results still surface with warnings.
 */
export function feasibilityScore(c: Candidate, input: ParsedInput): number {
  let score = 0;

  // 1. Memory alignment (50 points)
  if (c.sizeMB !== undefined) {
    if (c.sizeMB <= input.memoryMB) {
      score += 50;
    } else {
      // PENALTY instead of AUTO-REJECT (0 points but doesn't kill the item)
      // This allows famous large models to show up with low feasibility scores
      score += 0; 
    }
  } else {
    // Unknown size — give partial credit (30 points)
    score += 30;
  }

  // 2. Latency alignment (30 points)
  if (c.sizeMB !== undefined && input.latencyMs > 0) {
    const estimatedLatencyMs = c.sizeMB * 1.5; // Heuristic: 1.5ms per MB
    if (estimatedLatencyMs <= input.latencyMs) {
      score += 30;
    } else if (estimatedLatencyMs <= input.latencyMs * 2) {
      score += 15;
    }
  } else {
    score += 15; // Unknown latency
  }

  // 3. Optimization alignment (20 points)
  const optimizationTags = [
    "quantized", "pruned", "int8", "int4", "fp16", "distilled", "compressed", 
    "onnx", "tflite", "tensorrt", "edge", "mobile"
  ];
  const hasOptimization = c.tags?.some(t => optimizationTags.includes(t.toLowerCase()));
  if (hasOptimization) {
    score += 20;
  }

  return Math.min(score, 100);
}