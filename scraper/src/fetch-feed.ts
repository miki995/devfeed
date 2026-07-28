import RssParser from 'rss-parser';
import type { Article, Source } from '@shared/index';
import { hashUrl, summarize, toReadableText } from './normalize';

const USER_AGENT = 'devfeed-scraper (+https://github.com/miki995/devfeed)';

// Several feeds (reddit especially) reject the default parser UA with 429.
const rssParser = new RssParser({ timeout: 15000, headers: { 'user-agent': USER_AGENT } });

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
  'content:encoded'?: string;
  isoDate?: string;
  pubDate?: string;
}

const MIN_CONTENT_LENGTH = 280;
const SAME_HOST_DELAY_MS = 2500;
const RETRY_ATTEMPTS = 2;
const RETRY_DELAY_MS = 6000;

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function buildContent(html: string | undefined): { content?: string; hasContent: boolean } {
  const readable = toReadableText(html);
  if (readable.length >= MIN_CONTENT_LENGTH) {
    return { content: readable, hasContent: true };
  }
  return { hasContent: false };
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
    .map((item) => {
      const fullHtml = item['content:encoded'] ?? item.content;
      const { content, hasContent } = buildContent(fullHtml);
      return {
        id: hashUrl(item.link as string),
        title: item.title as string,
        url: item.link as string,
        summary: summarize(item.contentSnippet ?? item.content),
        sourceId: source.id,
        sourceName: source.name,
        category: source.category,
        publishedAt: item.isoDate ?? item.pubDate ?? new Date(0).toISOString(),
        content,
        hasContent,
      };
    });
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { headers: { 'user-agent': USER_AGENT } });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

/** Buckets sources by hostname so requests to one host can be spaced out. */
export function groupByHost(sources: Source[]): Source[][] {
  const byHost = new Map<string, Source[]>();
  for (const source of sources) {
    let host = source.url;
    try {
      host = new URL(source.url).host;
    } catch {
      // Not a parseable URL — treat the raw string as its own bucket.
    }
    const bucket = byHost.get(host);
    if (bucket) {
      bucket.push(source);
    } else {
      byHost.set(host, [source]);
    }
  }
  return [...byHost.values()];
}

/**
 * Hits every host in parallel but its sources one at a time. Firing all sources at
 * once meant 8 simultaneous requests to dev.to and 3 to reddit, which answered 429 —
 * making healthy sources look dead.
 */
export async function fetchAllSources(sources: Source[]): Promise<Article[][]> {
  const groups = await Promise.all(
    groupByHost(sources).map(async (group) => {
      const results: Article[][] = [];
      for (const [index, source] of group.entries()) {
        if (index > 0) {
          await delay(SAME_HOST_DELAY_MS);
        }
        results.push(await fetchSource(source));
      }
      return results;
    }),
  );
  return groups.flat();
}

async function fetchOnce(source: Source): Promise<Article[]> {
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
}

export function isRateLimit(message: string): boolean {
  return message.includes('429');
}

export async function fetchSource(source: Source): Promise<Article[]> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await fetchOnce(source);
    } catch (error) {
      const message = (error as Error).message;
      // Reddit and dev.to throttle hard; one backed-off retry recovers most of them.
      if (attempt < RETRY_ATTEMPTS && isRateLimit(message)) {
        await delay(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }
      console.warn(`[devfeed] skipping ${source.id}: ${message}`);
      return [];
    }
  }
}
