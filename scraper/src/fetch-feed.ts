import RssParser from 'rss-parser';
import type { Article, Source } from '@shared/index';
import { hashUrl, summarize } from './normalize';

const rssParser = new RssParser({ timeout: 15000 });

interface HackerNewsHit {
  objectID: string;
  title?: string;
  url?: string;
  points?: number;
  num_comments?: number;
  created_at: string;
}

interface DevtoItem {
  title: string;
  url: string;
  description?: string;
  published_at: string;
  positive_reactions_count?: number;
  comments_count?: number;
}

interface RssItem {
  title?: string;
  link?: string;
  contentSnippet?: string;
  content?: string;
  isoDate?: string;
  pubDate?: string;
}

export function parseHackerNews(source: Source, payload: { hits: HackerNewsHit[] }): Article[] {
  return (payload?.hits ?? [])
    .filter((hit) => !!hit.url && !!hit.title)
    .map((hit) => ({
      id: hashUrl(hit.url as string),
      title: hit.title as string,
      url: hit.url as string,
      summary: '',
      sourceId: source.id,
      sourceName: source.name,
      category: source.category,
      publishedAt: hit.created_at,
      points: hit.points,
      comments: hit.num_comments,
    }));
}

export function parseDevto(source: Source, items: DevtoItem[]): Article[] {
  return (items ?? [])
    .filter((item) => !!item.url && !!item.title)
    .map((item) => ({
      id: hashUrl(item.url),
      title: item.title,
      url: item.url,
      summary: summarize(item.description),
      sourceId: source.id,
      sourceName: source.name,
      category: source.category,
      publishedAt: item.published_at,
      points: item.positive_reactions_count,
      comments: item.comments_count,
    }));
}

export function parseRssItems(source: Source, items: RssItem[]): Article[] {
  return (items ?? [])
    .filter((item) => !!item.link && !!item.title)
    .map((item) => ({
      id: hashUrl(item.link as string),
      title: item.title as string,
      url: item.link as string,
      summary: summarize(item.contentSnippet ?? item.content),
      sourceId: source.id,
      sourceName: source.name,
      category: source.category,
      publishedAt: item.isoDate ?? item.pubDate ?? new Date(0).toISOString(),
    }));
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { headers: { 'user-agent': 'devfeed-scraper' } });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

export async function fetchSource(source: Source): Promise<Article[]> {
  try {
    if (source.type === 'hackernews') {
      const payload = (await fetchJson(source.url)) as { hits: HackerNewsHit[] };
      return parseHackerNews(source, payload);
    }
    if (source.type === 'devto') {
      const items = (await fetchJson(source.url)) as DevtoItem[];
      return parseDevto(source, items);
    }
    const feed = await rssParser.parseURL(source.url);
    return parseRssItems(source, (feed.items ?? []) as RssItem[]);
  } catch (error) {
    console.warn(`[devfeed] skipping ${source.id}: ${(error as Error).message}`);
    return [];
  }
}
