import type { Article } from '@shared/index';

const WINDOW_MS = 48 * 60 * 60 * 1000;

export function articleScore(article: Article): number {
  return (article.points ?? 0) + (article.comments ?? 0) * 2;
}

export function pickTrending(articles: Article[], now: number, max: number): Article[] {
  return articles
    .filter((article) => {
      const age = now - new Date(article.publishedAt).getTime();
      return age >= 0 && age <= WINDOW_MS && articleScore(article) > 0;
    })
    .sort((left, right) => articleScore(right) - articleScore(left))
    .slice(0, max);
}
