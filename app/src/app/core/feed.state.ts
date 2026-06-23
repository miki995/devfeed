import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import type { Article, Category, Source } from '@shared/index';
import { FeedApiService } from './feed.api';
import { filterArticles } from './filter';
import { pickReleases } from './releases';
import { dedupeSimilar } from './dedupe';
import { loadPrefs, savePrefs, Prefs } from './prefs.store';

export type FeedView = 'all' | 'saved';

interface FeedState {
  loading: boolean;
  articles: Article[];
  sources: Source[];
}

const EMPTY_STATE: FeedState = { loading: true, articles: [], sources: [] };

@Injectable({ providedIn: 'root' })
export class FeedGlobalStateService {
  private readonly api = inject(FeedApiService);
  private readonly prefs = signal<Prefs>(loadPrefs());
  private readonly previousVisitAt: string;

  readonly selectedCategory = signal<Category | 'all'>('all');
  readonly searchText = signal<string>('');
  readonly view = signal<FeedView>('all');

  constructor() {
    this.previousVisitAt = this.prefs().lastVisitAt;
    this.commit({ ...this.prefs(), lastVisitAt: new Date().toISOString() });
  }

  private readonly feedState = toSignal(
    this.api.getFeed().pipe(
      map((bundle) => ({ loading: false, articles: bundle.articles, sources: bundle.sources })),
      startWith(EMPTY_STATE),
      catchError(() => of({ loading: false, articles: [], sources: [] } as FeedState)),
    ),
    { initialValue: EMPTY_STATE },
  );

  readonly loading: Signal<boolean> = computed(() => this.feedState().loading);
  readonly articles: Signal<Article[]> = computed(() => dedupeSimilar(this.feedState().articles));
  readonly sources: Signal<Source[]> = computed(() => this.feedState().sources);
  readonly disabledSourceIds: Signal<string[]> = computed(() => this.prefs().disabledSourceIds);
  readonly savedArticleIds: Signal<string[]> = computed(() => this.prefs().savedArticleIds);
  readonly readArticleIds: Signal<string[]> = computed(() => this.prefs().readArticleIds);
  readonly theme: Signal<string> = computed(() => this.prefs().theme);

  readonly visibleArticles: Signal<Article[]> = computed(() =>
    filterArticles(this.articles(), {
      category: this.selectedCategory(),
      search: this.searchText(),
      disabledSourceIds: this.disabledSourceIds(),
      onlySaved: this.view() === 'saved',
      savedArticleIds: this.savedArticleIds(),
    }),
  );

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

  readonly countByCategory: Signal<Map<Category, number>> = computed(() => {
    const counts = new Map<Category, number>();
    for (const article of this.articles()) {
      counts.set(article.category, (counts.get(article.category) ?? 0) + 1);
    }
    return counts;
  });

  setCategory(category: Category | 'all'): void {
    this.selectedCategory.set(category);
  }

  setSearch(text: string): void {
    this.searchText.set(text);
  }

  setView(view: FeedView): void {
    this.view.set(view);
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

  private commit(next: Prefs): void {
    this.prefs.set(next);
    savePrefs(next);
  }
}
