import { canonicalUrl, normalizeTitle, dedupeSimilar } from './dedupe';
import type { Article } from '@shared/index';

const article = (over: Partial<Article>): Article => ({
  id: 'x',
  title: 'A story',
  url: 'https://example.com/post',
  summary: '',
  sourceId: 's',
  sourceName: 'S',
  category: 'frontend',
  publishedAt: '2026-01-01T00:00:00Z',
  ...over,
});

describe('canonicalUrl', () => {
  it('strips protocol, www and trailing slash', () => {
    expect(canonicalUrl('https://www.Example.com/Post/')).toBe('example.com/post');
  });

  it('ignores query strings', () => {
    expect(canonicalUrl('https://example.com/post?utm=1')).toBe('example.com/post');
  });
});

describe('normalizeTitle', () => {
  it('lowercases and collapses punctuation', () => {
    expect(normalizeTitle('Angular 20: Signals!')).toBe('angular 20 signals');
  });
});

describe('dedupeSimilar', () => {
  it('drops the same url arriving from two aggregators', () => {
    const result = dedupeSimilar([
      article({ id: '1', sourceId: 'hn', url: 'https://example.com/post' }),
      article({ id: '2', sourceId: 'reddit', url: 'https://www.example.com/post/' }),
    ]);
    expect(result.map((item) => item.id)).toEqual(['1']);
  });

  it('drops near-identical titles from different urls', () => {
    const result = dedupeSimilar([
      article({ id: '1', title: 'Angular 20 is out', url: 'https://a.com/1' }),
      article({ id: '2', title: 'Angular 20 is out!', url: 'https://b.com/2' }),
    ]);
    expect(result.map((item) => item.id)).toEqual(['1']);
  });

  it('keeps genuinely different stories', () => {
    const result = dedupeSimilar([
      article({ id: '1', title: 'Angular 20', url: 'https://a.com/1' }),
      article({ id: '2', title: 'React 20', url: 'https://b.com/2' }),
    ]);
    expect(result.map((item) => item.id)).toEqual(['1', '2']);
  });
});
