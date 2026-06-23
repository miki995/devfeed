import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeedGlobalStateService } from '../core/feed.state';
import { ArticleCardComponent } from './article-card.component';
import { ChannelRailComponent } from './channel-rail.component';
import { ReleaseTickerComponent } from './release-ticker.component';
import { TimeAgoPipe } from './time-ago.pipe';

@Component({
  selector: 'df-feed-home',
  imports: [ArticleCardComponent, ChannelRailComponent, ReleaseTickerComponent, TimeAgoPipe, RouterLink],
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
            <button type="button" [class.active]="state.view() === 'all'" (click)="state.setView('all')">
              Latest
              @if (state.newCount()) {
                <span class="badge">{{ state.newCount() }} new</span>
              }
            </button>
            <button type="button" [class.active]="state.view() === 'saved'" (click)="state.setView('saved')">
              Saved
              @if (state.savedCount()) {
                <span class="badge">{{ state.savedCount() }}</span>
              }
            </button>
            <button type="button" [class.active]="state.view() === 'trending'" (click)="state.setView('trending')">
              Trending
            </button>
          </div>
          <div class="actions">
            @if (state.view() === 'saved') {
              @if (state.savedCount()) {
                <button type="button" class="link" (click)="state.clearSaved()">Clear saved</button>
              }
            } @else {
              <button type="button" class="link" [class.on]="state.hideRead()" (click)="state.toggleHideRead()">
                {{ state.hideRead() ? 'Showing unread' : 'Hide read' }}
              </button>
              <button type="button" class="link" (click)="state.markAllVisibleRead()">Mark all read</button>
            }
          </div>
          <span class="meta">
            {{ state.visibleArticles().length }} stories
            @if (state.generatedAt()) {
              · updated {{ state.generatedAt() | timeAgo }}
            }
          </span>
        </div>

        @if (showRecent()) {
          <div class="recent">
            <span class="recent-label">Jump back in</span>
            @for (item of state.recentlyOpened(); track item.id) {
              <a class="recent-chip" [routerLink]="['/read', item.id]">{{ item.title }}</a>
            }
          </div>
        }

        @if (state.loading()) {
          <p class="status">Loading the latest…</p>
        } @else if (!state.visibleArticles().length) {
          @if (state.view() === 'saved') {
            <div class="empty">
              <p class="empty-title">No saved stories yet</p>
              <p class="empty-sub">Tap the ★ on any story to keep it here for later.</p>
              <button type="button" class="empty-action" (click)="state.setView('all')">Browse Latest</button>
            </div>
          } @else {
            <p class="status">Nothing matches your filters yet. Try another channel.</p>
          }
        } @else if (useGroups()) {
          @for (group of state.grouped(); track group.label) {
            <h3 class="day">{{ group.label }}</h3>
            @for (article of group.articles; track article.id) {
              <df-article-card
                [article]="article"
                [saved]="savedIds().has(article.id)"
                [isRead]="readIds().has(article.id)"
                [isNew]="state.newArticleIds().has(article.id)"
                (save)="state.toggleSaved($event)"
              />
            }
          }
        } @else {
          @for (article of state.visibleArticles(); track article.id) {
            <df-article-card
              [article]="article"
              [saved]="savedIds().has(article.id)"
              [isRead]="readIds().has(article.id)"
              [isNew]="state.newArticleIds().has(article.id)"
              (save)="state.toggleSaved($event)"
            />
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
      .actions {
        display: flex;
        gap: 14px;
        margin-left: auto;
      }
      .link {
        border: 0;
        background: transparent;
        color: var(--muted);
        font-family: var(--mono);
        font-size: 12px;
        cursor: pointer;
        padding: 0;
      }
      .link:hover,
      .link.on {
        color: var(--accent);
      }
      .meta {
        margin-left: 0;
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
      .recent {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        padding: 12px 0 14px;
        border-bottom: 1px solid var(--line);
        margin-bottom: 6px;
      }
      .recent-label {
        font-family: var(--mono);
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--faint);
        margin-right: 4px;
      }
      .recent-chip {
        max-width: 220px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12.5px;
        color: var(--muted);
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 5px 12px;
      }
      .recent-chip:hover {
        color: var(--text);
        border-color: var(--faint);
      }
      .day {
        font-family: var(--mono);
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--faint);
        margin: 26px 0 4px;
      }
      .empty {
        padding: 60px 0;
        text-align: center;
      }
      .empty-title {
        font-family: var(--serif);
        font-size: 20px;
        margin: 0 0 6px;
      }
      .empty-sub {
        color: var(--muted);
        font-size: 14px;
        margin: 0 0 18px;
      }
      .empty-action {
        border: 1px solid var(--accent);
        background: transparent;
        color: var(--accent);
        font-family: var(--mono);
        font-size: 13px;
        padding: 9px 18px;
        border-radius: 8px;
        cursor: pointer;
      }
      @media (max-width: 860px) {
        .layout {
          grid-template-columns: 1fr;
        }
        .rail-col {
          position: sticky;
          top: 78px;
          z-index: 4;
          background: var(--ground);
          margin: 0 -24px;
          padding: 6px 24px 10px;
          border-bottom: 1px solid var(--line);
        }
      }
    `,
  ],
})
export class FeedHomeComponent {
  readonly state = inject(FeedGlobalStateService);

  readonly savedIds = computed(() => new Set(this.state.savedArticleIds()));
  readonly readIds = computed(() => new Set(this.state.readArticleIds()));
  readonly useGroups = computed(() => this.state.view() !== 'trending' && !this.state.searchText().trim());
  readonly showRecent = computed(
    () => this.state.view() === 'all' && !this.state.searchText().trim() && this.state.recentlyOpened().length > 0,
  );
}
