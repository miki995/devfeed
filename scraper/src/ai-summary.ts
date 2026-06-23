import type { Article } from '@shared/index';
import { mapWithPool } from './extract';

const MODEL = 'gemini-2.0-flash';

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

async function summarizeOne(apiKey: string, article: Article): Promise<string> {
  const source = article.content ?? article.summary;
  if (!source) {
    return '';
  }
  const prompt = `Summarize this developer article in two plain sentences for a busy engineer. No preamble.\n\nTitle: ${article.title}\n\n${source.slice(0, 4000)}`;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: AbortSignal.timeout(20000),
      },
    );
    if (!response.ok) {
      return '';
    }
    const payload = (await response.json()) as GeminiResponse;
    return (payload.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim();
  } catch {
    return '';
  }
}

export async function addAiSummaries(articles: Article[]): Promise<number> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return 0;
  }
  const limit = Number(process.env.AI_SUMMARY_LIMIT ?? '40');
  const targets = articles.filter((article) => article.content).slice(0, limit);
  let summarized = 0;
  await mapWithPool(targets, 4, async (article) => {
    const summary = await summarizeOne(apiKey, article);
    if (summary) {
      article.aiSummary = summary;
      summarized += 1;
    }
  });
  return summarized;
}
