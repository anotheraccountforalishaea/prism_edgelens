import { ScoredCandidate } from "../schemas/types";

interface EnrichmentData {
  requestId: string;
  arxivResults: ScoredCandidate[];
  status: "pending" | "completed" | "failed";
}

class EnrichmentStore {
  private store: Map<string, EnrichmentData> = new Map();

  create(requestId: string) {
    this.store.set(requestId, {
      requestId,
      arxivResults: [],
      status: "pending"
    });
  }

  update(requestId: string, arxivResults: ScoredCandidate[]) {
    const data = this.store.get(requestId);
    if (data) {
      data.arxivResults = arxivResults;
      data.status = "completed";
    }
  }

  get(requestId: string): EnrichmentData | undefined {
    return this.store.get(requestId);
  }
}

export const enrichmentStore = new EnrichmentStore();
