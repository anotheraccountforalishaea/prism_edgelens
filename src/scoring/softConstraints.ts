import { Candidate, ParsedInput } from "../schemas/types";

export interface SoftPenaltyResult {
  matchPenalty: number;         // deducted from matchScore
  feasibilityPenalty: number;   // deducted from feasibilityScore
  confidencePenalty: number;    // deducted from confidenceScore
  failedSoftChecks: string[];   // shown in UI as ⚠️ warnings
  passedSoftChecks: string[];   // shown in UI as ✅ confirmations
}

export function computeSoftPenalties(
  candidate: Candidate,
  parsed: ParsedInput
): SoftPenaltyResult {

  let matchPenalty = 0;
  let feasibilityPenalty = 0;
  let confidencePenalty = 0;
  const failed: string[] = [];
  const passed: string[] = [];

  // ── FRAMEWORK ────────────────────────────────────────
  if (parsed.framework?.length) {
    const hasFramework = parsed.framework.some(f =>
      candidate.tags?.some(t => t.toLowerCase().includes(f.toLowerCase()))
    );
    if (hasFramework) {
      passed.push(`✅ Supports ${parsed.framework.join(", ")}`);
    } else {
      confidencePenalty += 15;
      failed.push(`⚠️ No explicit ${parsed.framework.join(", ")} support — may need conversion`);
    }
  }

  // ── FPS ──────────────────────────────────────────────
  if (parsed.fpsRequired) {
    const canDoFPS =
      !candidate.sizeMB                                      ? true  :
      parsed.fpsRequired <= 30 && candidate.sizeMB < 100    ? true  :
      parsed.fpsRequired <= 60 && candidate.sizeMB < 30     ? true  : false;
    if (canDoFPS) {
      passed.push(`✅ Likely achieves ${parsed.fpsRequired}fps`);
    } else {
      feasibilityPenalty += 20;
      failed.push(`⚠️ Model may be too large to achieve ${parsed.fpsRequired}fps`);
    }
  }

  // ── LICENSE ──────────────────────────────────────────
  if (parsed.license && parsed.license !== "any") {
    const openLicenses = ["apache", "mit", "gpl", "cc-by", "bsd", "llama", "mistral"];
    const isOpen = openLicenses.some(l =>
      candidate.tags?.some(t => t.toLowerCase().includes(l))
    );
    if (parsed.license === "research-only") {
      passed.push("✅ Research use generally permitted");
    } else if (isOpen) {
      passed.push("✅ Open-source license confirmed");
    } else {
      confidencePenalty += 10;
      failed.push("⚠️ License not explicitly confirmed in metadata");
    }
  }

  // ── DATA TYPE ────────────────────────────────────────
  if (parsed.dataType?.length) {
    const dataTagMap: Record<string, string[]> = {
      "images":  ["vision", "image", "cv", "cnn", "vit", "resnet"],
      "text":    ["nlp", "text", "bert", "gpt", "llm", "transformer"],
      "audio":   ["audio", "speech", "whisper", "wav2vec", "asr"],
      "video":   ["video", "temporal", "action", "stream"],
      "tabular": ["tabular", "xgboost", "sklearn", "gradient-boosting"],
    };
    const required = parsed.dataType.flatMap(d => dataTagMap[d] ?? []);
    const hasMatch = required.some(t =>
      candidate.tags?.some(tag => tag.toLowerCase().includes(t))
    );
    if (hasMatch) {
      passed.push(`✅ Compatible with ${parsed.dataType.join(", ")} input`);
    } else {
      matchPenalty += 20;
      failed.push(`⚠️ No explicit ${parsed.dataType.join(", ")} data type tags found`);
    }
  }

  // ── DEPLOYMENT ENVIRONMENT ───────────────────────────
  if (parsed.deployEnv?.length) {
    const envTagMap: Record<string, string[]> = {
      "edge":       ["tflite", "onnx", "gguf", "arm", "edge", "tinyml"],
      "browser":    ["onnx", "ort-web", "webml", "javascript", "wasm"],
      "cloud":      ["transformers", "pytorch", "tensorflow", "api"],
      "air-gapped": ["gguf", "onnx", "tflite", "local"],
      "mobile":     ["tflite", "coreml", "android", "ios", "lite"],
    };
    const required = parsed.deployEnv.flatMap(e => envTagMap[e] ?? []);
    const hasMatch = required.some(t => candidate.tags?.includes(t));
    if (hasMatch) {
      passed.push(`✅ Tagged for ${parsed.deployEnv.join(", ")} deployment`);
    } else {
      feasibilityPenalty += 15;
      failed.push(`⚠️ No explicit ${parsed.deployEnv.join(", ")} deployment tags — may need manual export`);
    }
  }

  // ── ACCURACY ─────────────────────────────────────────
  if (parsed.accuracyMin) {
    const isWidelyValidated =
      (candidate.downloads ?? 0) > 5000 ||
      (candidate.stars ?? 0) > 500;
    if (isWidelyValidated) {
      passed.push(`✅ High community validation — likely meets accuracy bar`);
    } else {
      confidencePenalty += 10;
      failed.push(`⚠️ Cannot verify ${parsed.accuracyMin}% accuracy from metadata alone`);
    }
  }

  // ── BUDGET ───────────────────────────────────────────
  if (parsed.budgetConstrained) {
    passed.push("✅ Free to use — no licensing cost");
  }

  return {
    matchPenalty,
    feasibilityPenalty,
    confidencePenalty,
    failedSoftChecks: failed,
    passedSoftChecks: passed,
  };
}
