import { Candidate, ParsedInput } from "../schemas/types";

export interface HardCheckResult {
  passes: boolean;
  reason?: string;
}

export function passesHardConstraints(
  candidate: Candidate,
  parsed: ParsedInput
): HardCheckResult {

  // MEMORY — absolute hardware limit
  // If model size is known and exceeds RAM, it cannot run. Period.
  if (candidate.sizeMB && candidate.sizeMB > parsed.memoryMB) {
    return {
      passes: false,
      reason: `Model size ${candidate.sizeMB}MB exceeds device RAM ${parsed.memoryMB}MB`
    };
  }

  // OFFLINE — if user needs offline and model has zero offline tags
  // A model that requires internet cannot work in an offline environment
  if (parsed.offline) {
    const offlineTags = ["gguf", "onnx", "tflite", "local", "offline", "edge"];
    const hasOfflineSupport = offlineTags.some(t => candidate.tags?.includes(t));
    if (!hasOfflineSupport) {
      return {
        passes: false,
        reason: "No offline inference support found — model likely requires internet"
      };
    }
  }

  // PRIVACY — if user needs on-device and model explicitly requires 
  // external inference API (e.g. hosted HuggingFace inference endpoint only)
  if (parsed.privacyRequired) {
    const privacyTags = ["local", "on-device", "gguf", "onnx", "tflite"];
    const hasPrivacySupport = privacyTags.some(t => candidate.tags?.includes(t));
    const requiresExternalAPI =
      candidate.source === "huggingface" &&
      candidate.tags?.includes("inference-api") &&
      !hasPrivacySupport;
    if (requiresExternalAPI) {
      return {
        passes: false,
        reason: "Model requires external inference API — violates on-device privacy constraint"
      };
    }
  }

  return { passes: true };
}
