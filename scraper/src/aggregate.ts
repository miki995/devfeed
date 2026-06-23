import type { Article, FeedBundle, Source } from '@shared/index';
import { dedupeByUrl, sortByDateDesc, capPerSource } from './normalize';

export function aggregate(perSourceResults: Article[][], sources: Source[]): FeedBundle {
  const flattened = perSourceResults.flat();
  const capped = capPerSource(flattened, 40);
  const articles = sortByDateDesc(dedupeByUrl(capped));
  return {
    generatedAt: new Date().toISOString(),
    count: articles.length,
    articles,
    sources,
  };
}
