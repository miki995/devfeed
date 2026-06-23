import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FeedGlobalStateService } from '../core/feed.state';
import { ArticleCardComponent } from './article-card.component';
import { ChannelRailComponent } from './channel-rail.component';

@Component({
  selector: 'df-feed-home',
  imports: [ArticleCardComponent, ChannelRailComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layout">
      <aside class="rail-col">
        <df-channel-rail
          [selected]="state.selectedCategory()"
          [counts]="state.countByCategory()"
          [totalCount]="state.articles().length"
          (select)="state.setCategory($event)"
        />
      </aside>

      <main class="feed-col">
        <div class="feed-head">
          <h2>Latest</h2>
          <span class="meta">{{ state.visibleArticles().length }} stories</span>
        </div>

        @if (state.loading()) {
          <p class="status">Loading the latest…</p>
        } @else {
          @for (article of state.visibleArticles(); track article.id) {
            <df-article-card
              [article]="article"
              [saved]="savedIds().has(article.id)"
              [isRead]="readIds().has(article.id)"
              (save)="state.toggleSaved($event)"
              (markRead)="state.markRead($event)"
            />
          } @empty {
            <p class="status">Nothing matches your filters yet. Try another channel.</p>
          }
        }
      </main>
    </div>
  `,
  styles: [
    `
      .layout {
        display: grid;
        grid-template-columns: 230px 1fr;
        gap: 32px;
        align-items: start;
      }
      .feed-head {
        display: flex;
        align-items: baseline;
        gap: 14px;
        margin-bottom: 10px;
      }
      .feed-head h2 {
        font-family: var(--serif);
        font-weight: 600;
        font-size: 26px;
        margin: 0;
      }
      .meta {
        font-family: var(--mono);
        font-size: 12px;
        color: var(--faint);
      }
      .status {
        color: var(--muted);
        font-family: var(--mono);
        font-size: 13px;
        padding: 40px 0;
      }
      @media (max-width: 860px) {
        .layout {
          grid-template-columns: 1fr;
        }
        .rail-col {
          display: none;
        }
      }
    `,
  ],
})
export class FeedHomeComponent {
  readonly state = inject(FeedGlobalStateService);

  readonly savedIds = computed(() => new Set(this.state.savedArticleIds()));
  readonly readIds = computed(() => new Set(this.state.readArticleIds()));
}
