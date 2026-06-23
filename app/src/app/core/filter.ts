import type { Article, Category } from '@shared/index';

export interface FilterOptions {
  category: Category | 'all';
  search: string;
  disabledSourceIds: string[];
}

export function filterArticles(articles: Article[], options: FilterOptions): Article[] {
  const normalizedSearch = options.search.trim().toLowerCase();
  const disabled = new Set(options.disabledSourceIds);
  return articles.filter((article) => {
    if (disabled.has(article.sourceId)) {
      return false;
    }
    if (options.category !== 'all' && article.category !== options.category) {
      return false;
    }
    if (!normalizedSearch) {
      return true;
    }
    const haystack = `${article.title} ${article.summary}`.toLowerCase();
    return haystack.includes(normalizedSearch);
  });
}
