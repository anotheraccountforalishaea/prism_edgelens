import axios from "axios";
import { Candidate } from "../schemas/types";

/**
 * Fetches trending AI models from HuggingFace based on a task.
 *
 * API: GET https://huggingface.co/api/models
 * Free — no token required for basic search (token increases rate limit)
 */
export async function fetchHFModels(task: string): Promise<Candidate[]> {
  try {
    const url = "https://huggingface.co/api/models";

    // HuggingFace needs hyphenated task names: "object detection" → "object-detection"
    const pipelineTag = task.replace(/\s+/g, "-").toLowerCase();

    // Try pipeline_tag first, fall back to keyword search if it fails
    let data: any[];
    try {
      const response = await axios.get(url, {
        params: { pipeline_tag: pipelineTag, sort: "trending", limit: 20 },
        headers: process.env.HF_TOKEN
          ? { Authorization: `Bearer ${process.env.HF_TOKEN}` }
          : {},
      });
      data = response.data;
    } catch {
      // Fallback: search by keyword instead of pipeline_tag
      const response = await axios.get(url, {
        params: { search: task, sort: "downloads", limit: 20 },
        headers: process.env.HF_TOKEN
          ? { Authorization: `Bearer ${process.env.HF_TOKEN}` }
          : {},
      });
      data = response.data;
    }

    const models: Candidate[] = data.map((model: any) => ({
      id: model.modelId || model.id,
      name: model.modelId || model.id,
      source: "huggingface" as const,
      url: `https://huggingface.co/${model.modelId || model.id}`,
      description:
        model.cardData?.description ||
        (model.tags || []).join(", ") ||
        "No description available",
      tags: model.tags || [],
      sizeMB: model.safetensors?.total
        ? Math.round(model.safetensors.total / (1024 * 1024))
        : undefined,
      downloads: model.downloads || 0,
      recentActivity: model.downloads || 0,
    }));

    console.log(`✅ HuggingFace: Fetched ${models.length} models for task "${task}"`);
    return models;
  } catch (error: any) {
    console.error(`❌ HuggingFace fetch failed: ${error.message}`);
    return [];
  }
}
