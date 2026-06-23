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

  it('mutes articles whose title or summary contains a muted keyword, unless saved', () => {
    const withCrypto = [
      article({ id: '1', title: 'Crypto mining in JS' }),
      article({ id: '2', title: 'Angular update' }),
      article({ id: '3', title: 'Crypto saved one', sourceId: 'angular-blog' }),
    ];
    const result = filterArticles(withCrypto, {
      category: 'all',
      search: '',
      disabledSourceIds: [],
      mutedKeywords: ['crypto'],
      savedArticleIds: ['3'],
    });
    expect(result.map((item) => item.id)).toEqual(['2', '3']);
  });

  it('searches the provided full-text index when present', () => {
    const index = new Map<string, string>([['2', 'spring boot virtual threads loom guide']]);
    const result = filterArticles(articles, {
      category: 'all',
      search: 'loom',
      disabledSourceIds: [],
      searchIndex: index,
    });
    expect(result.map((item) => item.id)).toEqual(['2']);
  });

  it('hides read articles when hideRead is set, unless saved', () => {
    const result = filterArticles(articles, {
      category: 'all',
      search: '',
      disabledSourceIds: [],
      hideRead: true,
      readArticleIds: ['1', '3'],
      savedArticleIds: ['3'],
    });
    expect(result.map((item) => item.id)).toEqual(['2', '3']);
  });

  it('keeps only saved articles when onlySaved is set', () => {
    const result = filterArticles(articles, {
      category: 'all',
      search: '',
      disabledSourceIds: [],
      onlySaved: true,
      savedArticleIds: ['2'],
    });
    expect(result.map((item) => item.id)).toEqual(['2']);
  });
});
