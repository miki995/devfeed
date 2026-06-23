import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FeedGlobalStateService } from './feed.state';
import { loadPrefs } from './prefs.store';
import type { FeedBundle } from '@shared/index';

const bundle: FeedBundle = {
  generatedAt: '2026-06-23T10:00:00Z',
  count: 2,
  sources: [
    { id: 'angular-blog', name: 'Angular blog', category: 'angular', type: 'rss', url: 'x', enabled: true },
    { id: 'spring-blog', name: 'Spring blog', category: 'spring-boot', type: 'rss', url: 'x', enabled: true },
  ],
  articles: [
    { id: 'a', title: 'Angular news', url: 'https://a.com/1', summary: '', sourceId: 'angular-blog', sourceName: 'Angular blog', category: 'angular', publishedAt: '2026-06-20T00:00:00Z' },
    { id: 'b', title: 'Spring news', url: 'https://b.com/1', summary: '', sourceId: 'spring-blog', sourceName: 'Spring blog', category: 'spring-boot', publishedAt: '2026-06-19T00:00:00Z' },
  ],
};

function createService(): FeedGlobalStateService {
  const service = TestBed.inject(FeedGlobalStateService);
  const httpMock = TestBed.inject(HttpTestingController);
  httpMock.expectOne('data/news.json').flush(bundle);
  return service;
}

describe('FeedGlobalStateService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  });

  it('persists the selected category and view', () => {
    const service = createService();
    service.setCategory('angular');
    service.setView('saved');
    const prefs = loadPrefs();
    expect(prefs.lastCategory).toBe('angular');
    expect(prefs.lastView).toBe('saved');
  });

  it('filters by the deduped, category-scoped feed', () => {
    const service = createService();
    service.setCategory('angular');
    expect(service.visibleArticles().map((article) => article.id)).toEqual(['a']);
  });

  it('marks all visible articles read and can hide them', () => {
    const service = createService();
    service.markAllVisibleRead();
    service.toggleHideRead();
    expect(service.visibleArticles()).toEqual([]);
    expect(loadPrefs().readArticleIds).toContain('a');
  });

  it('clears saved articles', () => {
    const service = createService();
    service.toggleSaved('a');
    expect(service.savedCount()).toBe(1);
    service.clearSaved();
    expect(service.savedCount()).toBe(0);
  });
});
