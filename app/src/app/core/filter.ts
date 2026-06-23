import type { Article, Category } from '@shared/index';

export interface FilterOptions {
  category: Category | 'all';
  search: string;
  disabledSourceIds: string[];
  onlySaved?: boolean;
  savedArticleIds?: string[];
  hideRead?: boolean;
  readArticleIds?: string[];
  mutedKeywords?: string[];
  searchIndex?: Map<string, string>;
}

export function filterArticles(articles: Article[], options: FilterOptions): Article[] {
  const normalizedSearch = options.search.trim().toLowerCase();
  const disabled = new Set(options.disabledSourceIds);
  const saved = new Set(options.savedArticleIds ?? []);
  const read = new Set(options.readArticleIds ?? []);
  const mutedKeywords = (options.mutedKeywords ?? []).map((keyword) => keyword.toLowerCase()).filter(Boolean);
  return articles.filter((article) => {
    if (disabled.has(article.sourceId)) {
      return false;
    }
    if (options.onlySaved && !saved.has(article.id)) {
      return false;
    }
    if (options.hideRead && read.has(article.id) && !saved.has(article.id)) {
      return false;
    }
    if (options.category !== 'all' && article.category !== options.category) {
      return false;
    }
    const titleAndSummary = `${article.title} ${article.summary}`.toLowerCase();
    if (mutedKeywords.length && !saved.has(article.id)) {
      const muted = mutedKeywords.some((keyword) => titleAndSummary.includes(keyword));
      if (muted) {
        return false;
      }
    }
    if (!normalizedSearch) {
      return true;
    }
    const indexed = options.searchIndex?.get(article.id);
    const haystack = indexed ?? titleAndSummary;
    return haystack.includes(normalizedSearch);
  });
}
