export function parseInput(text: string) {
  const lower = text.toLowerCase();

  let task = "unknown";

  if (lower.includes("image")) task = "image-classification";
  else if (lower.includes("text")) task = "nlp";
  else if (lower.includes("speech")) task = "speech-recognition";
  else if (lower.includes("video")) task = "video-processing";
  else if (lower.includes("ai")) task = "general-ai";

  return {
    task,
    device: lower.includes("mobile") ? "mobile" : "desktop",
    memoryMB: lower.includes("500") ? 500 : 1024,
    latencyMs: 100,
    offline: lower.includes("offline"),
    rawText: text
  };
}