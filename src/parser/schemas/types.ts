export interface ParsedInput {
  task: string;
  device: string;
  memoryMB: number;
  latencyMs: number;
  offline: boolean;
  rawText: string;
}