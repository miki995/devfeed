import type { Article } from '@shared/index';

export function canonicalUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.host.replace(/^www\./, '');
    const path = parsed.pathname.replace(/\/+$/, '');
    return `${host}${path}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function dedupeSimilar(articles: Article[]): Article[] {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const result: Article[] = [];
  for (const article of articles) {
    const urlKey = canonicalUrl(article.url);
    const titleKey = normalizeTitle(article.title);
    if (seenUrls.has(urlKey) || (titleKey.length > 0 && seenTitles.has(titleKey))) {
      continue;
    }
    seenUrls.add(urlKey);
    if (titleKey.length > 0) {
      seenTitles.add(titleKey);
    }
    result.push(article);
  }
  return result;
}
