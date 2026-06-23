import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { FeedBundle } from '@shared/index';

@Injectable({ providedIn: 'root' })
export class FeedApiService {
  private readonly http = inject(HttpClient);

  getFeed(): Observable<FeedBundle> {
    return this.http.get<FeedBundle>('data/news.json');
  }
}
