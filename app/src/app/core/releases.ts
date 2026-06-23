import type { Article } from '@shared/index';

export function isReleaseSourceId(sourceId: string): boolean {
  return /releases|changelog/.test(sourceId);
}

export function pickReleases(articles: Article[], max: number): Article[] {
  return articles.filter((article) => isReleaseSourceId(article.sourceId)).slice(0, max);
}
