import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { Article } from '@shared/index';
import { TimeAgoPipe } from './time-ago.pipe';

interface ReleaseView {
  id: string;
  url: string;
  sourceName: string;
  publishedAt: string;
  colorVar: string;
}

@Component({
  selector: 'df-release-ticker',
  imports: [TimeAgoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (releaseViews().length) {
      <div class="ticker">
        <div class="label"><span class="pulse"></span> Just shipped</div>
        <div class="track">
          @for (release of releaseViews(); track release.id) {
            <a class="rel" [href]="release.url" target="_blank" rel="noopener">
              <span class="dot" [style.background]="release.colorVar"></span>
              <b>{{ release.sourceName }}</b>
              <span class="ago">{{ release.publishedAt | timeAgo }}</span>
            </a>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .ticker {
        display: flex;
        align-items: stretch;
        border: 1px solid var(--line);
        border-radius: 14px;
        overflow: hidden;
        background: var(--surface);
        margin-bottom: 26px;
      }
      .label {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 14px 18px;
        font-family: var(--mono);
        font-size: 12px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--accent);
        border-right: 1px solid var(--line);
        background: var(--surface-2);
        white-space: nowrap;
      }
      .pulse {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--accent);
        animation: pulse 1.8s infinite;
      }
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 55%, transparent);
        }
        70% {
          box-shadow: 0 0 0 7px transparent;
        }
        100% {
          box-shadow: 0 0 0 0 transparent;
        }
      }
      .track {
        display: flex;
        align-items: center;
        gap: 28px;
        padding: 0 20px;
        overflow-x: auto;
        flex: 1;
        font-family: var(--mono);
        font-size: 13px;
      }
      .rel {
        display: flex;
        align-items: center;
        gap: 9px;
        white-space: nowrap;
        color: var(--muted);
      }
      .rel b {
        color: var(--text);
        font-weight: 600;
      }
      .rel .ago {
        color: var(--faint);
      }
      .dot {
        width: 7px;
        height: 7px;
        border-radius: 2px;
      }
      @media (prefers-reduced-motion: reduce) {
        .pulse {
          animation: none;
        }
      }
    `,
  ],
})
export class ReleaseTickerComponent {
  readonly releases = input.required<Article[]>();

  readonly releaseViews = computed<ReleaseView[]>(() =>
    this.releases().map((article) => ({
      id: article.id,
      url: article.url,
      sourceName: article.sourceName,
      publishedAt: article.publishedAt,
      colorVar: `var(--${article.category})`,
    })),
  );
}
