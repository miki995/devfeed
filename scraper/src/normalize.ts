import { createHash } from 'crypto';
import type { Article } from '@shared/index';

export function hashUrl(url: string): string {
  return createHash('sha1').update(url).digest('hex').slice(0, 12);
}

export function stripHtml(html: string | undefined): string {
  if (!html) {
    return '';
  }
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function dedupeByUrl(articles: Article[]): Article[] {
  const seen = new Set<string>();
  const result: Article[] = [];
  for (const article of articles) {
    if (!seen.has(article.url)) {
      seen.add(article.url);
      result.push(article);
    }
  }
  return result;
}

export function sortByDateDesc(articles: Article[]): Article[] {
  return [...articles].sort(
    (left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
  );
}

export function capPerSource(articles: Article[], maxPerSource: number): Article[] {
  const countBySource = new Map<string, number>();
  const result: Article[] = [];
  for (const article of articles) {
    const used = countBySource.get(article.sourceId) ?? 0;
    if (used < maxPerSource) {
      countBySource.set(article.sourceId, used + 1);
      result.push(article);
    }
  }
  return result;
}
