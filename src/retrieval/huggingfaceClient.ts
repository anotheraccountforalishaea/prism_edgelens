import axios from "axios";
import { Candidate } from "../schemas/types";

/**
 * LAYER 1 — SMART RETRIEVAL (HuggingFace)
 * Uses structured filters and trending scores for precision retrieval.
 */
export async function fetchHFModels(task: string): Promise<Candidate[]> {
  try {
    const url = "https://huggingface.co/api/models";
    const pipelineTag = task.replace(/\s+/g, "-").toLowerCase();

    const response = await axios.get(url, {
      params: {
        pipeline_tag: pipelineTag,
        sort: "trendingScore",
        direction: -1,
        limit: 50,
        full: true, // Fetch card data
      },
      headers: process.env.HF_TOKEN ? { Authorization: `Bearer ${process.env.HF_TOKEN}` } : {},
    });

    const data: any[] = response.data;
    
    const models: Candidate[] = data
      .filter((m: any) => {
        // Pre-filter: hard reject low downloads and irrelevant types
        const downloads = m.downloads || 0;
        const tags = m.tags || [];
        if (downloads < 500) return false;
        if (tags.includes("dataset") || tags.includes("space")) return false;
        
        const validFrameworks = ["pytorch", "transformers", "onnx", "tflite", "gguf"];
        return validFrameworks.some(f => tags.includes(f));
      })
      .map((model: any) => ({
        id: model.id,
        name: model.id,
        source: "huggingface" as const,
        url: `https://huggingface.co/${model.id}`,
        description: model.cardData?.summary || (model.tags || []).join(", "),
        tags: model.tags || [],
        sizeMB: model.safetensors?.total
          ? Math.round(model.safetensors.total / (1024 * 1024))
          : undefined,
        downloads: model.downloads || 0,
        recentActivity: model.downloads30d || model.downloads || 0,
        lastUpdated: model.lastModified,
      }));

    console.log(`✅ HuggingFace: Fetched ${models.length} models for task "${task}"`);
    return models;
  } catch (error: any) {
    console.error(`❌ HuggingFace fetch failed: ${error.message}`);
    return [];
  }
}
