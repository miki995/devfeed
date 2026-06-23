import type { Article } from '@shared/index';

export function isReleaseSourceId(sourceId: string): boolean {
  return /releases|changelog/.test(sourceId);
}

export function pickReleases(articles: Article[], max: number): Article[] {
  const seenSources = new Set<string>();
  const result: Article[] = [];
  for (const article of articles) {
    if (!isReleaseSourceId(article.sourceId) || seenSources.has(article.sourceId)) {
      continue;
    }
    seenSources.add(article.sourceId);
    result.push(article);
    if (result.length === max) {
      break;
    }
  }
  return result;
}
