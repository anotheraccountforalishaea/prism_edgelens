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

    // Try pipeline_tag first
    let data: any[] = [];
    try {
      const response = await axios.get(url, {
        params: {
          pipeline_tag: pipelineTag,
          sort: "downloads",       // sort by downloads = actually popular models
          direction: -1,           // descending order (most downloads first)
          limit: 20,
        },
        headers: process.env.HF_TOKEN
          ? { Authorization: `Bearer ${process.env.HF_TOKEN}` }
          : {},
      });
      data = response.data;
    } catch (e) {
      console.log(`Pipeline tag search failed, trying keyword search...`);
    }

    // Fallback: search by keyword instead of pipeline_tag if we got 0 results
    if (!data || data.length === 0) {
      try {
        const response = await axios.get(url, {
          params: { search: task, sort: "downloads", direction: -1, limit: 20 },
          headers: process.env.HF_TOKEN
            ? { Authorization: `Bearer ${process.env.HF_TOKEN}` }
            : {},
        });
        data = response.data;
      } catch (e) {
        console.log(`Keyword search also failed.`);
      }
    }

    // Filter out models with very few downloads (noise)
    const filtered = data.filter((m: any) => (m.downloads || 0) >= 100);

    const models: Candidate[] = filtered.map((model: any) => ({
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

    console.log(`✅ HuggingFace: Fetched ${models.length} models for task "${task}" (all 100+ ⬇)`);
    return models;
  } catch (error: any) {
    console.error(`❌ HuggingFace fetch failed: ${error.message}`);
    return [];
  }
}
