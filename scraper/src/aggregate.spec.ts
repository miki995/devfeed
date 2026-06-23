import { aggregate } from './aggregate';
import type { Article, Source } from '@shared/index';

const source: Source = { id: 's', name: 'S', category: 'frontend', type: 'rss', url: 'x', enabled: true };
const article = (id: string, date: string): Article => ({
  id,
  title: id,
  url: `https://a.com/${id}`,
  summary: '',
  sourceId: 's',
  sourceName: 'S',
  category: 'frontend',
  publishedAt: date,
});

describe('aggregate', () => {
  it('flattens, dedupes, sorts newest first, and counts', () => {
    const bundle = aggregate(
      [[article('a', '2025-01-01T00:00:00Z')], [article('b', '2026-06-01T00:00:00Z')]],
      [source],
    );
    expect(bundle.articles.map((item) => item.id)).toEqual(['b', 'a']);
    expect(bundle.count).toBe(2);
    expect(bundle.sources).toEqual([source]);
    expect(typeof bundle.generatedAt).toBe('string');
  });
});
