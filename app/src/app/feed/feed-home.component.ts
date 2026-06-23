import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FeedGlobalStateService } from '../core/feed.state';
import { ArticleCardComponent } from './article-card.component';
import { ChannelRailComponent } from './channel-rail.component';
import { ReleaseTickerComponent } from './release-ticker.component';

@Component({
  selector: 'df-feed-home',
  imports: [ArticleCardComponent, ChannelRailComponent, ReleaseTickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <df-release-ticker [releases]="state.latestReleases()" />

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
          <div class="views">
            <button type="button" [class.active]="state.view() === 'all'" (click)="state.setView('all')">Latest</button>
            <button type="button" [class.active]="state.view() === 'saved'" (click)="state.setView('saved')">
              Saved
              @if (state.savedCount()) {
                <span class="badge">{{ state.savedCount() }}</span>
              }
            </button>
          </div>
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
        align-items: center;
        gap: 14px;
        margin-bottom: 10px;
      }
      .views {
        display: flex;
        gap: 6px;
      }
      .views button {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        border: 1px solid var(--line);
        background: transparent;
        color: var(--muted);
        font-family: var(--sans);
        font-size: 14px;
        padding: 6px 14px;
        border-radius: 8px;
        cursor: pointer;
      }
      .views button.active {
        background: var(--surface);
        color: var(--text);
        border-color: var(--faint);
      }
      .badge {
        font-family: var(--mono);
        font-size: 11px;
        background: var(--accent);
        color: var(--ground);
        border-radius: 10px;
        padding: 1px 7px;
        font-weight: 600;
      }
      .meta {
        margin-left: auto;
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
