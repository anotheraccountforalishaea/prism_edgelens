import type { PRISMReport, ScoredCandidate } from "../types/types";

const BASE_URL = "http://localhost:3000";

export async function evaluateProject(input: string): Promise<PRISMReport> {
  const response = await fetch(`${BASE_URL}/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) {
    throw new Error(`Pipeline error: ${response.statusText}`);
  }

  return response.json();
}

export async function getExplanation(id: string): Promise<{ id: string; explanation: string }> {
  const response = await fetch(`${BASE_URL}/explain/${encodeURIComponent(id)}`);
  
  if (!response.ok) {
    throw new Error(`Explanation error: ${response.statusText}`);
  }

  return response.json();
}

export async function getEnrichment(requestId: string): Promise<{
  requestId: string;
  arxivResults: ScoredCandidate[];
  status: "pending" | "completed" | "failed";
}> {
  const response = await fetch(`${BASE_URL}/enrichment/${requestId}`);
  
  if (!response.ok) {
    throw new Error(`Enrichment error: ${response.statusText}`);
  }

  return response.json();
}
