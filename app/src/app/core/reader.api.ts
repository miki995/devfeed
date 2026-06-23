import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import type { ArticleContent } from '@shared/index';

@Injectable({ providedIn: 'root' })
export class ReaderApiService {
  private readonly http = inject(HttpClient);

  getContent(articleId: string): Observable<ArticleContent | null> {
    return this.http
      .get<ArticleContent>(`data/articles/${articleId}.json`)
      .pipe(catchError(() => of(null)));
  }
}
