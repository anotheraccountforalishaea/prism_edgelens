import { Candidate, ParsedInput } from "../schemas/types";

export function matchScore(c: Candidate, input: ParsedInput): number {
  let score = 0;
  const taskLower = input.task.toLowerCase();

  // Exact tag match
  if (c.tags?.some(t => t.toLowerCase() === taskLower)) {
    score += 40;
  } else if (c.tags?.some(t => t.toLowerCase().includes(taskLower) || taskLower.includes(t.toLowerCase()))) {
    // Partial tag match
    score += 20;
  }

  // Edge/mobile deployment capability
  if (c.tags?.some(t => ["edge", "mobile", "embedded", "onnx", "tflite", "coreml"].includes(t.toLowerCase()))) {
    score += 30;
  }

  // Description keyword match
  const desc = c.description?.toLowerCase() ?? "";
  if (desc.includes(taskLower)) {
    score += 30;
  } else {
    // Partial word overlap in description
    const taskWords = taskLower.split(/\s+/).filter(w => w.length > 3);
    const matchingWords = taskWords.filter(w => desc.includes(w));
    if (matchingWords.length > 0) {
      score += Math.floor((matchingWords.length / taskWords.length) * 20);
    }
  }

  return Math.min(score, 100);
}