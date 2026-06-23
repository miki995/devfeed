import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import type { FeedBundle, SearchEntry } from '@shared/index';

@Injectable({ providedIn: 'root' })
export class FeedApiService {
  private readonly http = inject(HttpClient);

  getFeed(): Observable<FeedBundle> {
    return this.http.get<FeedBundle>('data/news.json');
  }

  getSearchIndex(): Observable<SearchEntry[]> {
    return this.http.get<SearchEntry[]>('data/search.json').pipe(catchError(() => of([])));
  }
}
