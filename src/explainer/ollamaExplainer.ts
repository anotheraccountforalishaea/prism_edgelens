import { ScoredCandidate, ParsedInput } from '../schemas/types';

export async function explainCandidate(c: ScoredCandidate, input: ParsedInput): Promise<string> {
  const prompt = `Project needs: ${input.task} on ${input.device}, ${input.memoryMB}MB RAM, ${input.latencyMs}ms latency.
Candidate: ${c.name} (${c.source}) | match=${c.matchScore} feasibility=${c.feasibilityScore} confidence=${c.confidenceScore} trend=${c.trendDirection}
In 2-3 sentences: is this a good fit? What optimizations are needed?`;

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3', // Note: User needs to ensure this model is pulled in Ollama
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Failed to explain candidate:', error);
    return 'Explanation could not be generated at this time. Please ensure Ollama is running locally.';
  }
}
