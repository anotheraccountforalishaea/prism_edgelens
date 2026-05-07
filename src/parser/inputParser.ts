import { ParsedInput } from "../schemas/types";

export function parseInput(text: string): ParsedInput {
  const lower = text.toLowerCase();

  let task = "unknown";
  if (lower.match(/image classif|classify image/)) task = "image-classification";
  else if (lower.match(/object detect|detect object/)) task = "object-detection";
  else if (lower.includes("segmentation")) task = "image-segmentation";
  else if (lower.match(/sentiment|text classif/)) task = "text-classification";
  else if (lower.match(/speech|voice|audio/)) task = "automatic-speech-recognition";
  else if (lower.includes("translation")) task = "translation";
  else if (lower.includes("summariz")) task = "summarization";
  else if (lower.match(/question answer|qa/)) task = "question-answering";
  else if (lower.includes("depth estimat")) task = "depth-estimation";
  else if (lower.includes("video")) task = "video-processing";
  else if (lower.includes("text") || lower.includes("nlp")) task = "nlp";
  else if (lower.includes("ai")) task = "general-ai";

  let device = "cpu-only";
  if (lower.match(/raspberry|rpi/)) device = "raspberry-pi";
  else if (lower.match(/mobile|android|ios|phone/)) device = "mobile";
  else if (lower.includes("jetson")) device = "jetson-nano";
  else if (lower.match(/arduino|microcontroller/)) device = "microcontroller";
  else if (lower.match(/browser|web/)) device = "browser";

  let memoryMB = 512;
  const memMatch = lower.match(/(\d+)\s*(mb|gb)/);
  if (memMatch && memMatch[1]) {
    const val = parseInt(memMatch[1] as string, 10);
    memoryMB = memMatch[2] === "gb" ? val * 1024 : val;
  }

  let latencyMs = 200;
  const latMatch = lower.match(/<?\s*(\d+)\s*ms/);
  if (latMatch && latMatch[1]) latencyMs = parseInt(latMatch[1] as string, 10);
  else if (lower.includes("real-time")) latencyMs = 100;

  const offline = !!lower.match(/offline|no internet|local only/);

  const deployEnv: string[] = [];
  if (lower.match(/edge|iot|embedded/)) deployEnv.push("edge");
  if (lower.match(/browser|web|frontend/)) deployEnv.push("browser");
  if (lower.match(/cloud|server|aws|gcp/)) deployEnv.push("cloud");
  if (lower.match(/air-gapped|isolated/)) deployEnv.push("air-gapped");
  if (lower.match(/mobile|phone/)) deployEnv.push("mobile");

  const privacyRequired = !!lower.match(/private|on-device|no cloud|sensitive|hipaa|gdpr/);

  const frameworkList = ["python", "javascript", "typescript", "swift", "kotlin", "rust", "onnx", "tflite", "pytorch", "tensorflow", "coreml", "flutter"];
  const framework = frameworkList.filter(f => lower.includes(f));

  const dataType: string[] = [];
  if (lower.match(/image|photo|camera/)) dataType.push("images");
  if (lower.match(/text|document|nlp/)) dataType.push("text");
  if (lower.match(/audio|speech|voice/)) dataType.push("audio");
  if (lower.match(/video|stream|frames/)) dataType.push("video");
  if (lower.match(/table|csv|structured/)) dataType.push("tabular");

  let license: "open-source" | "commercial" | "research-only" | "any" | undefined = undefined;
  if (lower.match(/open source|apache|mit/)) license = "open-source";
  else if (lower.match(/commercial|production/)) license = "commercial";
  else if (lower.match(/research|academic/)) license = "research-only";

  const budgetConstrained = !!lower.match(/free|no cost|open source only|no budget/);

  let fpsRequired: number | undefined = undefined;
  const fpsMatch = lower.match(/(\d+)\s*fps/);
  if (fpsMatch && fpsMatch[1]) fpsRequired = parseInt(fpsMatch[1] as string, 10);
  else if (lower.includes("real-time video")) fpsRequired = 30;

  let accuracyMin: number | undefined = undefined;
  const accMatch = lower.match(/(\d+)%\s*accura/) || lower.match(/at least (\d+)/) || lower.match(/above (\d+)/);
  if (accMatch && accMatch[1]) accuracyMin = parseInt(accMatch[1] as string, 10);

  return {
    task,
    device,
    rawText: text,
    memoryMB,
    latencyMs,
    offline,
    deployEnv: deployEnv.length ? deployEnv : undefined,
    privacyRequired,
    framework: framework.length ? framework : undefined,
    dataType: dataType.length ? dataType : undefined,
    license,
    budgetConstrained,
    fpsRequired,
    accuracyMin
  };
}