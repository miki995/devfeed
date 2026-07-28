import { parseHackerNews, parseDevto, parseRssItems, groupByHost, isRateLimit } from './fetch-feed';
import type { Source } from '@shared/index';

const hnSource: Source = { id: 'hn', name: 'HN', category: 'frontend', type: 'hackernews', url: 'x', enabled: true };
const devtoSource: Source = { id: 'dt', name: 'DEV', category: 'frontend', type: 'devto', url: 'x', enabled: true };
const rssSource: Source = { id: 'rs', name: 'RSS', category: 'angular', type: 'rss', url: 'x', enabled: true };

describe('parseHackerNews', () => {
  it('maps algolia hits to articles', () => {
    const articles = parseHackerNews(hnSource, {
      hits: [{ objectID: '1', title: 'A story', url: 'https://a.com', points: 42, num_comments: 7, created_at: '2026-06-01T00:00:00Z' }],
    });
    expect(articles[0]).toMatchObject({ title: 'A story', url: 'https://a.com', points: 42, comments: 7, sourceId: 'hn', category: 'frontend' });
  });

  it('skips hits without a url', () => {
    const articles = parseHackerNews(hnSource, { hits: [{ objectID: '1', title: 'Ask HN', created_at: '2026-06-01T00:00:00Z' }] });
    expect(articles).toEqual([]);
  });
});

describe('parseDevto', () => {
  it('maps dev.to payload to articles', () => {
    const articles = parseDevto(devtoSource, [
      { title: 'Cool post', url: 'https://dev.to/x', description: 'desc', published_at: '2026-06-01T00:00:00Z', positive_reactions_count: 9, comments_count: 3 },
    ]);
    expect(articles[0]).toMatchObject({ title: 'Cool post', url: 'https://dev.to/x', points: 9, comments: 3 });
  });
});

describe('groupByHost', () => {
  const source = (id: string, url: string): Source => ({ ...rssSource, id, url });

  it('buckets sources that share a hostname', () => {
    const groups = groupByHost([
      source('a', 'https://dev.to/api/articles?tag=ai'),
      source('b', 'https://reddit.com/r/webdev/.rss'),
      source('c', 'https://dev.to/api/articles?tag=node'),
    ]);
    expect(groups.map((group) => group.map((entry) => entry.id))).toEqual([['a', 'c'], ['b']]);
  });

  it('keeps every source exactly once', () => {
    const sources = [source('a', 'https://x.com/1'), source('b', 'https://y.com/1'), source('c', 'https://x.com/2')];
    expect(groupByHost(sources).flat()).toHaveLength(3);
  });

  it('treats an unparseable url as its own bucket', () => {
    const groups = groupByHost([source('a', 'not a url'), source('b', 'https://x.com/1')]);
    expect(groups).toHaveLength(2);
  });
});

describe('isRateLimit', () => {
  it('recognises the rate-limit messages both fetch paths produce', () => {
    expect(isRateLimit('HTTP 429 for https://dev.to/api/articles?tag=devops')).toBe(true);
    expect(isRateLimit('Status code 429')).toBe(true);
  });

  it('does not treat other failures as rate limits', () => {
    expect(isRateLimit('Status code 404')).toBe(false);
    expect(isRateLimit('Invalid character in entity name')).toBe(false);
  });
});

describe('parseRssItems', () => {
  it('maps rss items, stripping html in summary', () => {
    const articles = parseRssItems(rssSource, [
      { title: 'Released v1', link: 'https://g.com/r/1', contentSnippet: '<b>notes</b>', isoDate: '2026-06-01T00:00:00Z' },
    ]);
    expect(articles[0]).toMatchObject({ title: 'Released v1', url: 'https://g.com/r/1', category: 'angular' });
    expect(articles[0].summary).toBe('notes');
  });
});
