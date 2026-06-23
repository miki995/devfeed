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

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(' ');
  const base = lastSpace > maxLength * 0.6 ? clipped.slice(0, lastSpace) : clipped;
  return `${base.trimEnd()}…`;
}

export function summarize(html: string | undefined): string {
  return truncate(stripHtml(html), 240);
}

export function toReadableText(html: string | undefined): string {
  if (!html) {
    return '';
  }
  return html
    .replace(/<\s*(br|\/p|\/div|\/h[1-6]|\/li|\/tr)\s*\/?>/gi, '\n')
    .replace(/<\s*li[^>]*>/gi, '\n• ')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 12000);
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
