import { ParsedInput, ScoredCandidate, PRISMReport, Candidate } from '../schemas/types';

export function buildReport(input: ParsedInput, ranked: ScoredCandidate[]): PRISMReport {
  const topResults = ranked.filter(c => c.feasibilityScore >= 40);
  const rejectedResultsRaw = ranked.filter(c => c.feasibilityScore < 40);

  const rejectedResults = rejectedResultsRaw.map(c => ({
    candidate: c as Candidate,
    reason: c.feasibilityScore === 0 
      ? 'Hard fail on memory constraints.' 
      : 'Low feasibility score based on latency and optimization needs.',
  }));

  const risingCount = topResults.filter(c => c.trendDirection === 'rising').length;
  const trendInsights = [];
  if (topResults.length > 0) {
    trendInsights.push(`${risingCount} of ${topResults.length} top results are rising in popularity.`);
  } else {
    trendInsights.push('No highly feasible candidates were found matching the trend criteria.');
  }

  const suggestions = [];
  if (input.memoryMB < 1000) {
    suggestions.push('Consider INT8 or 4-bit quantization for deployment on restricted edge environments.');
  }
  if (input.latencyMs < 50) {
    suggestions.push('Aggressive pruning and optimized inference engines (e.g., ONNX Runtime, TensorRT) may be necessary to meet strict latency goals.');
  }

  return {
    summary: {
      task: input.task,
      device: input.device,
      constraints: {
        memoryMB: input.memoryMB,
        latencyMs: input.latencyMs,
        offline: input.offline,
      },
    },
    topResults,
    rejectedResults,
    trendInsights,
    suggestions,
  };
}
