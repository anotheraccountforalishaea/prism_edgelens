import { ParsedInput } from "../schemas/types";

export async function parseInput(rawText: string): Promise<ParsedInput> {
  const systemPrompt = `
You are a structured data extractor for an AI project evaluator.
Read the user's project description and extract all constraints into a strict JSON object.
Return ONLY raw JSON. Do not include markdown fences.

Return this exact structure:
{
  "task": "image-classification" | "object-detection" | "image-segmentation" | "text-classification" | "automatic-speech-recognition" | "translation" | "summarization" | "question-answering" | "depth-estimation" | "video-processing" | "nlp" | "unknown",
  "device": "raspberry-pi" | "mobile" | "jetson-nano" | "microcontroller" | "browser" | "cpu-only",
  "memoryMB": number,
  "latencyMs": number,
  "offline": boolean,
  "deployEnv": string[],
  "privacyRequired": boolean,
  "framework": string[],
  "dataType": string[],
  "license": "open-source" | "commercial" | "research-only" | "any",
  "budgetConstrained": boolean,
  "fpsRequired": number,
  "accuracyMin": number,
  "languagePreference": string
}

Defaults if not mentioned:
- memoryMB: 512
- latencyMs: 200
- offline: false
- privacyRequired: false
- budgetConstrained: false

If an optional field (like deployEnv, framework, license, fpsRequired, accuracyMin) is not mentioned, omit the key or return null.
`;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: `${systemPrompt}\n\nUser Input: "${rawText}"\n\nReturn ONLY the JSON.`,
        stream: false,
        format: "json" // Forces Ollama to output valid JSON
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.response) as ParsedInput;

    // Preserve the original raw text
    parsed.rawText = rawText;

    // Enforce fallbacks for critical numerical checks just in case Ollama hallucinated
    parsed.memoryMB = parsed.memoryMB ?? 512;
    parsed.latencyMs = parsed.latencyMs ?? 200;
    parsed.offline = parsed.offline ?? false;
    
    // To satisfy exactOptionalPropertyTypes, we must convert null to undefined
    if (parsed.deployEnv === null) parsed.deployEnv = undefined;
    if (parsed.framework === null) parsed.framework = undefined;
    if (parsed.dataType === null) parsed.dataType = undefined;
    if (parsed.license === null) parsed.license = undefined;
    if (parsed.fpsRequired === null) parsed.fpsRequired = undefined;
    if (parsed.accuracyMin === null) parsed.accuracyMin = undefined;
    if (parsed.languagePreference === null) parsed.languagePreference = undefined;

    return parsed;
  } catch (error) {
    console.error("Ollama parser failed, using regex fallback:", error);
    
    // Fallback if Ollama is down
    return {
      task: extractTaskFallback(rawText),
      device: "cpu-only",
      rawText: rawText,
      memoryMB: 512,
      latencyMs: 200,
      offline: false
    };
  }
}

// Minimal regex fallback if Ollama is unreachable
function extractTaskFallback(rawText: string): string {
  const text = rawText.toLowerCase();
  if (text.includes("image classif") || text.includes("classify image")) return "image-classification";
  if (text.includes("object detect") || text.includes("detect object")) return "object-detection";
  if (text.includes("speech") || text.includes("voice")) return "automatic-speech-recognition";
  if (text.includes("sentiment") || text.includes("text classif")) return "text-classification";
  if (text.includes("translat")) return "translation";
  if (text.includes("summariz")) return "summarization";
  if (text.includes("segment")) return "image-segmentation";
  return "unknown";
}