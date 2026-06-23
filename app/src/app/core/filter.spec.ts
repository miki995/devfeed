import { filterArticles } from './filter';
import type { Article } from '@shared/index';

const article = (over: Partial<Article>): Article => ({
  id: 'x',
  title: 'Hello Angular',
  url: 'u',
  summary: 'signals are great',
  sourceId: 'angular-blog',
  sourceName: 'Angular',
  category: 'angular',
  publishedAt: '2026-01-01T00:00:00Z',
  ...over,
});

describe('filterArticles', () => {
  const articles = [
    article({ id: '1', category: 'angular', title: 'Angular 20' }),
    article({ id: '2', category: 'spring-boot', title: 'Spring tips', sourceId: 'spring-blog' }),
    article({ id: '3', category: 'angular', title: 'RxJS guide', sourceId: 'angular-blog' }),
  ];

  it('returns all when category is all and no search', () => {
    expect(filterArticles(articles, { category: 'all', search: '', disabledSourceIds: [] }).length).toBe(3);
  });

  it('filters by category', () => {
    const result = filterArticles(articles, { category: 'angular', search: '', disabledSourceIds: [] });
    expect(result.map((item) => item.id)).toEqual(['1', '3']);
  });

  it('filters by case-insensitive search across title and summary', () => {
    const result = filterArticles(articles, { category: 'all', search: 'rxjs', disabledSourceIds: [] });
    expect(result.map((item) => item.id)).toEqual(['3']);
  });

  it('excludes disabled sources', () => {
    const result = filterArticles(articles, { category: 'all', search: '', disabledSourceIds: ['spring-blog'] });
    expect(result.map((item) => item.id)).toEqual(['1', '3']);
  });
});
