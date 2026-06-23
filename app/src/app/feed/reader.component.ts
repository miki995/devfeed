import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { FeedGlobalStateService } from '../core/feed.state';
import { ReaderApiService } from '../core/reader.api';
import { categoryLabel } from '../core/categories';
import { TimeAgoPipe } from './time-ago.pipe';

@Component({
  selector: 'df-reader',
  imports: [RouterLink, TimeAgoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="reader">
      <a class="back" routerLink="/">← Back to feed</a>

      @if (article(); as current) {
        <div class="tagrow">
          <span class="tag">{{ label() }}</span>
          <span class="src">{{ current.sourceName }}</span>
          <span class="time">{{ current.publishedAt | timeAgo }}</span>
        </div>
        <h1>{{ current.title }}</h1>

        @if (content(); as body) {
          <div class="content">{{ body }}</div>
        } @else if (loaded()) {
          <p class="summary">{{ current.summary }}</p>
          <p class="note">Full text isn't available for this source in the app.</p>
        } @else {
          <p class="note">Loading…</p>
        }

        <a class="original" [href]="current.url" target="_blank" rel="noopener">Open original at {{ current.sourceName }} ↗</a>
      } @else {
        <p class="note">This story isn't in the current feed. <a routerLink="/">Back to feed</a></p>
      }
    </article>
  `,
  styles: [
    `
      .reader {
        max-width: 720px;
        margin: 0 auto;
      }
      .back {
        display: inline-block;
        font-family: var(--mono);
        font-size: 13px;
        color: var(--muted);
        margin-bottom: 22px;
      }
      .back:hover {
        color: var(--accent);
      }
      .tagrow {
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: var(--mono);
        font-size: 12px;
        color: var(--faint);
        margin-bottom: 12px;
      }
      .tag {
        color: var(--muted);
      }
      h1 {
        font-family: var(--serif);
        font-weight: 600;
        font-size: 34px;
        line-height: 1.2;
        margin: 0 0 24px;
      }
      .content {
        white-space: pre-wrap;
        font-size: 17px;
        line-height: 1.7;
        color: var(--text);
      }
      .summary {
        font-size: 17px;
        line-height: 1.7;
        color: var(--text);
      }
      .note {
        color: var(--muted);
        font-family: var(--mono);
        font-size: 13px;
      }
      .original {
        display: inline-block;
        margin-top: 30px;
        font-family: var(--mono);
        font-size: 13px;
        color: var(--accent);
        border: 1px solid var(--accent);
        border-radius: 8px;
        padding: 10px 18px;
      }
      .original:hover {
        background: var(--accent);
        color: var(--ground);
      }
    `,
  ],
})
export class ReaderComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ReaderApiService);
  private readonly state = inject(FeedGlobalStateService);

  private readonly articleId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), {
    initialValue: '',
  });

  readonly article = computed(() => this.state.articlesById().get(this.articleId()));
  readonly label = computed(() => {
    const current = this.article();
    return current ? categoryLabel(current.category) : '';
  });

  private readonly contentState = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id') ?? ''),
      switchMap((id) => this.api.getContent(id)),
      map((result) => ({ loaded: true, content: result?.content ?? null })),
    ),
    { initialValue: { loaded: false, content: null as string | null } },
  );

  readonly loaded = computed(() => this.contentState().loaded);
  readonly content = computed(() => this.contentState().content);

  constructor() {
    effect(() => {
      const id = this.articleId();
      if (id) {
        this.state.markRead(id);
      }
    });
  }
}
