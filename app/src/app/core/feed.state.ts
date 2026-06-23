import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { startWith, map, catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import type { Article, Category, Source, SearchEntry } from '@shared/index';
import { isCategory } from '@shared/index';
import { FeedApiService } from './feed.api';
import { filterArticles } from './filter';
import { pickReleases } from './releases';
import { pickTrending } from './trending';
import { groupByDay, DayGroup as DayGroupType } from './grouping';
import { dedupeSimilar } from './dedupe';
import { loadPrefs, savePrefs, Prefs, DEFAULT_PREFS } from './prefs.store';

export type FeedView = 'all' | 'saved' | 'trending';

const HISTORY_LIMIT = 30;
const RECENT_LIMIT = 6;

interface FeedState {
  loading: boolean;
  articles: Article[];
  sources: Source[];
  generatedAt: string;
}

const EMPTY_STATE: FeedState = { loading: true, articles: [], sources: [], generatedAt: '' };

@Injectable({ providedIn: 'root' })
export class FeedGlobalStateService {
  private readonly api = inject(FeedApiService);
  private readonly prefs = signal<Prefs>(loadPrefs());
  private readonly previousVisitAt: string;

  readonly selectedCategory = signal<Category | 'all'>('all');
  readonly searchText = signal<string>('');
  readonly view = signal<FeedView>('all');
  private readonly wantSearchIndex = signal<boolean>(false);

  private readonly searchIndex: Signal<Map<string, string>> = toSignal(
    toObservable(this.wantSearchIndex).pipe(
      switchMap((want) => (want ? this.api.getSearchIndex() : of([] as SearchEntry[]))),
      map((entries) => new Map(entries.map((entry) => [entry.id, entry.text]))),
    ),
    { initialValue: new Map<string, string>() },
  );

  constructor() {
    const stored = this.prefs();
    this.previousVisitAt = stored.lastVisitAt;
    this.selectedCategory.set(isCategory(stored.lastCategory) ? stored.lastCategory : 'all');
    this.view.set(stored.lastView === 'saved' ? 'saved' : 'all');
    this.commit({ ...stored, lastVisitAt: new Date().toISOString() });
  }

  private readonly feedState = toSignal(
    this.api.getFeed().pipe(
      map((bundle) => ({ loading: false, articles: bundle.articles, sources: bundle.sources, generatedAt: bundle.generatedAt })),
      startWith(EMPTY_STATE),
      catchError(() => of(EMPTY_STATE)),
    ),
    { initialValue: EMPTY_STATE },
  );

  readonly loading: Signal<boolean> = computed(() => this.feedState().loading);
  readonly articles: Signal<Article[]> = computed(() => dedupeSimilar(this.feedState().articles));
  readonly sources: Signal<Source[]> = computed(() => this.feedState().sources);
  readonly generatedAt: Signal<string> = computed(() => this.feedState().generatedAt);

  readonly latestBySource: Signal<Map<string, string>> = computed(() => {
    const newest = new Map<string, string>();
    for (const article of this.articles()) {
      const current = newest.get(article.sourceId);
      if (!current || new Date(article.publishedAt).getTime() > new Date(current).getTime()) {
        newest.set(article.sourceId, article.publishedAt);
      }
    }
    return newest;
  });
  readonly disabledSourceIds: Signal<string[]> = computed(() => this.prefs().disabledSourceIds);
  readonly savedArticleIds: Signal<string[]> = computed(() => this.prefs().savedArticleIds);
  readonly readArticleIds: Signal<string[]> = computed(() => this.prefs().readArticleIds);
  readonly theme: Signal<string> = computed(() => this.prefs().theme);
  readonly hideRead: Signal<boolean> = computed(() => this.prefs().hideRead);
  readonly mutedKeywords: Signal<string[]> = computed(() => this.prefs().mutedKeywords);

  readonly visibleArticles: Signal<Article[]> = computed(() => {
    if (this.view() === 'trending') {
      return this.trending();
    }
    return filterArticles(this.articles(), {
      category: this.selectedCategory(),
      search: this.searchText(),
      disabledSourceIds: this.disabledSourceIds(),
      onlySaved: this.view() === 'saved',
      savedArticleIds: this.savedArticleIds(),
      hideRead: this.hideRead() && this.view() !== 'saved',
      readArticleIds: this.readArticleIds(),
      mutedKeywords: this.mutedKeywords(),
      searchIndex: this.searchIndex(),
    });
  });

  readonly grouped: Signal<DayGroupType[]> = computed(() => groupByDay(this.visibleArticles(), Date.now()));

  readonly trending: Signal<Article[]> = computed(() => pickTrending(this.articles(), Date.now(), 12));

  readonly recentlyOpened: Signal<Article[]> = computed(() => {
    const byId = this.articlesById();
    return this.prefs()
      .history.map((id) => byId.get(id))
      .filter((article): article is Article => !!article)
      .slice(0, RECENT_LIMIT);
  });

  readonly latestReleases: Signal<Article[]> = computed(() => pickReleases(this.articles(), 6));

  readonly savedCount: Signal<number> = computed(() => this.savedArticleIds().length);

  readonly newArticleIds: Signal<Set<string>> = computed(() => {
    if (!this.previousVisitAt) {
      return new Set<string>();
    }
    const threshold = new Date(this.previousVisitAt).getTime();
    const ids = this.articles()
      .filter((article) => new Date(article.publishedAt).getTime() > threshold)
      .map((article) => article.id);
    return new Set(ids);
  });

  readonly newCount: Signal<number> = computed(() => this.newArticleIds().size);

  readonly articlesById: Signal<Map<string, Article>> = computed(() => {
    const byId = new Map<string, Article>();
    for (const article of this.articles()) {
      byId.set(article.id, article);
    }
    return byId;
  });

  readonly countByCategory: Signal<Map<Category, number>> = computed(() => {
    const counts = new Map<Category, number>();
    for (const article of this.articles()) {
      counts.set(article.category, (counts.get(article.category) ?? 0) + 1);
    }
    return counts;
  });

  setCategory(category: Category | 'all'): void {
    this.selectedCategory.set(category);
    this.commit({ ...this.prefs(), lastCategory: category });
  }

  setSearch(text: string): void {
    this.searchText.set(text);
    if (text.trim()) {
      this.wantSearchIndex.set(true);
    }
  }

  setView(view: FeedView): void {
    this.view.set(view);
    this.commit({ ...this.prefs(), lastView: view });
  }

  openArticle(articleId: string): void {
    const current = this.prefs();
    const history = [articleId, ...current.history.filter((id) => id !== articleId)].slice(0, HISTORY_LIMIT);
    const readArticleIds = current.readArticleIds.includes(articleId)
      ? current.readArticleIds
      : [...current.readArticleIds, articleId];
    this.commit({ ...current, history, readArticleIds });
  }

  getScroll(articleId: string): number {
    return this.prefs().scrollPositions[articleId] ?? 0;
  }

  setScroll(articleId: string, position: number): void {
    const current = this.prefs();
    this.commit({ ...current, scrollPositions: { ...current.scrollPositions, [articleId]: position } });
  }

  addMutedKeyword(keyword: string): void {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized || this.prefs().mutedKeywords.includes(normalized)) {
      return;
    }
    this.commit({ ...this.prefs(), mutedKeywords: [...this.prefs().mutedKeywords, normalized] });
  }

  removeMutedKeyword(keyword: string): void {
    this.commit({ ...this.prefs(), mutedKeywords: this.prefs().mutedKeywords.filter((entry) => entry !== keyword) });
  }

  exportData(): string {
    return JSON.stringify(this.prefs(), null, 2);
  }

  importData(json: string): boolean {
    try {
      const parsed = JSON.parse(json) as Partial<Prefs>;
      this.commit({ ...DEFAULT_PREFS, ...this.prefs(), ...parsed });
      return true;
    } catch {
      return false;
    }
  }

  isSourceEnabled(sourceId: string): boolean {
    return !this.disabledSourceIds().includes(sourceId);
  }

  toggleSource(sourceId: string): void {
    const current = this.prefs();
    const disabled = current.disabledSourceIds.includes(sourceId)
      ? current.disabledSourceIds.filter((id) => id !== sourceId)
      : [...current.disabledSourceIds, sourceId];
    this.commit({ ...current, disabledSourceIds: disabled });
  }

  toggleSaved(articleId: string): void {
    const current = this.prefs();
    const saved = current.savedArticleIds.includes(articleId)
      ? current.savedArticleIds.filter((id) => id !== articleId)
      : [...current.savedArticleIds, articleId];
    this.commit({ ...current, savedArticleIds: saved });
  }

  markRead(articleId: string): void {
    const current = this.prefs();
    if (current.readArticleIds.includes(articleId)) {
      return;
    }
    this.commit({ ...current, readArticleIds: [...current.readArticleIds, articleId] });
  }

  setTheme(theme: string): void {
    this.commit({ ...this.prefs(), theme });
  }

  toggleHideRead(): void {
    this.commit({ ...this.prefs(), hideRead: !this.prefs().hideRead });
  }

  markAllVisibleRead(): void {
    const current = this.prefs();
    const merged = new Set(current.readArticleIds);
    for (const article of this.visibleArticles()) {
      merged.add(article.id);
    }
    this.commit({ ...current, readArticleIds: Array.from(merged) });
  }

  clearSaved(): void {
    this.commit({ ...this.prefs(), savedArticleIds: [] });
  }

  private commit(next: Prefs): void {
    this.prefs.set(next);
    savePrefs(next);
  }
}
