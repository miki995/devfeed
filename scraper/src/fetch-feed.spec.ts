import { parseHackerNews, parseDevto, parseRssItems } from './fetch-feed';
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

describe('parseRssItems', () => {
  it('maps rss items, stripping html in summary', () => {
    const articles = parseRssItems(rssSource, [
      { title: 'Released v1', link: 'https://g.com/r/1', contentSnippet: '<b>notes</b>', isoDate: '2026-06-01T00:00:00Z' },
    ]);
    expect(articles[0]).toMatchObject({ title: 'Released v1', url: 'https://g.com/r/1', category: 'angular' });
    expect(articles[0].summary).toBe('notes');
  });
});
