import { toReadableText } from './normalize';

type Extractor = (input: string, options?: unknown, fetchOptions?: unknown) => Promise<{ content?: string } | null>;

let extractorPromise: Promise<Extractor> | undefined;

async function getExtractor(): Promise<Extractor> {
  if (!extractorPromise) {
    extractorPromise = import('@extractus/article-extractor').then((module) => module.extract as Extractor);
  }
  return extractorPromise;
}

export async function fetchFullText(url: string): Promise<string> {
  try {
    const extract = await getExtractor();
    const article = await extract(url, {}, { signal: AbortSignal.timeout(9000) });
    return toReadableText(article?.content);
  } catch {
    return '';
  }
}

export async function mapWithPool<Item, Result>(
  items: Item[],
  poolSize: number,
  worker: (item: Item, index: number) => Promise<Result>,
): Promise<Result[]> {
  const results: Result[] = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(poolSize, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}
