import { ParsedInput } from "../schemas/types";

/**
 * Intelligent Input Parser for PRISM
 * Uses a multi-layered extraction approach to understand technical intent
 * without relying on brittle regex alone.
 */
export function parseInput(text: string): ParsedInput {
  const lower = text.toLowerCase();

  // 1. Task Extraction - Hierarchy based on precision
  const taskMap: Record<string, string[]> = {
    "image-classification": ["image class", "classify image", "vision classification", "disease detection", "agriculture monitoring"],
    "object-detection": ["object detect", "detect object", "yolo", "ssd", "drone detection"],
    "image-segmentation": ["segmentation", "pixel-wise", "crop monitoring"],
    "text-classification": ["sentiment", "text classif", "intent detection"],
    "automatic-speech-recognition": ["speech", "voice", "audio", "asr", "stt"],
    "translation": ["translation", "translate"],
    "summarization": ["summariz"],
    "question-answering": ["question answer", "qa", "mrc"],
    "depth-estimation": ["depth estimat"],
    "video-processing": ["video", "iot camera"],
    "text-generation": ["text generation", "nlp", "llm", "chat", "autocomplete", "coding assistant"],
    "artificial-intelligence": ["ai", "machine learning", "deep learning"]
  };

  let task = "unknown";
  for (const [key, patterns] of Object.entries(taskMap)) {
    if (patterns.some(p => lower.includes(p))) {
      task = key;
      break;
    }
  }

  // 2. Keyword Fallback for Discovery
  // If no canonical task is found, we extract the core technical entities
  if (task === "unknown") {
    const technicalKeywords = [
        "llm", "agent", "autonomous", "orchestration", "quantized", "copilot", 
        "rag", "retrieval", "coding", "typescript", "node", "python", "macos", 
        "linux", "vps", "server", "mac mini", "apple silicon", "gpu", 
        "quantization", "memory", "optimization", "agriculture", "crop", "drone", "tinyml"
    ];
    
    const words = technicalKeywords.filter(kw => lower.includes(kw));
    if (words.length > 0) {
      task = Array.from(new Set(words)).slice(0, 3).join(" ");
    } else {
      // Last resort: significant words that aren't stop words
      task = text.split(/\s+/).filter(w => w.length > 4).slice(0, 3).join(" ");
    }
  }

  // 3. Hardware Constraints Parsing
  let device = "cpu-only";
  if (lower.match(/raspberry|rpi/)) device = "raspberry-pi";
  else if (lower.match(/mobile|android|ios|phone/)) device = "mobile";
  else if (lower.includes("jetson")) device = "jetson-nano";
  else if (lower.includes("coral") || lower.includes("tpu")) device = "coral-tpu";
  else if (lower.match(/arduino|microcontroller/)) device = "microcontroller";
  else if (lower.match(/browser|web/)) device = "browser";
  else if (lower.match(/apple silicon|m1|m2|m3|mac mini/)) device = "apple-silicon";

  let memoryMB = 1024; // Default to 1GB
  const memMatch = lower.match(/(\d+(?:\.\d+)?)\s*(mb|gb)/);
  if (memMatch && memMatch[1]) {
    const val = parseFloat(memMatch[1]);
    memoryMB = memMatch[2] === "gb" ? Math.round(val * 1024) : Math.round(val);
  }

  let latencyMs = 500;
  const latMatch = lower.match(/<?\s*(\d+)\s*ms/);
  if (latMatch && latMatch[1]) latencyMs = parseInt(latMatch[1], 10);
  else if (lower.includes("real-time")) latencyMs = 100;

  // 4. Operational Requirements
  const offline = !!lower.match(/offline|no internet|local only|self-hosted|rural/);
  const privacyRequired = !!lower.match(/private|on-device|no cloud|sensitive|hipaa|gdpr/);
  const budgetConstrained = !!lower.match(/free|no cost|open source only|no budget/);

  // 5. Technical Context Extraction
  const frameworkList = ["python", "javascript", "typescript", "swift", "kotlin", "rust", "onnx", "tflite", "pytorch", "tensorflow", "coreml", "flutter", "tensorrt"];
  const framework = frameworkList.filter(f => lower.includes(f));

  const dataType: string[] = [];
  if (lower.match(/image|photo|camera|vision/)) dataType.push("images");
  if (lower.match(/text|document|nlp/)) dataType.push("text");
  if (lower.match(/audio|speech|voice/)) dataType.push("audio");
  if (lower.match(/video|stream|frames/)) dataType.push("video");

  let license: "open-source" | "commercial" | "research-only" | "any" | undefined = undefined;
  if (lower.match(/open source|apache|mit|gpl/)) license = "open-source";
  else if (lower.match(/commercial|production/)) license = "commercial";
  else if (lower.match(/research|academic/)) license = "research-only";

  return {
    task,
    device,
    rawText: text,
    memoryMB,
    latencyMs,
    offline,
    deployEnv: lower.includes("vps") || lower.includes("server") ? ["cloud"] : undefined,
    privacyRequired,
    framework: framework.length ? framework : undefined,
    dataType: dataType.length ? dataType : undefined,
    license,
    budgetConstrained
  };
}