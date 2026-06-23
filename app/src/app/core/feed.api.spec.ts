import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FeedApiService } from './feed.api';

describe('FeedApiService', () => {
  let service: FeedApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FeedApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FeedApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('requests the news bundle', () => {
    let received = 0;
    service.getFeed().subscribe((bundle) => (received = bundle.count));
    const request = httpMock.expectOne('data/news.json');
    expect(request.request.method).toBe('GET');
    request.flush({ generatedAt: 'x', count: 2, articles: [], sources: [] });
    expect(received).toBe(2);
  });
});
