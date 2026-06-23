import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { Article } from '@shared/index';
import { categoryLabel } from '../core/categories';
import { TimeAgoPipe } from './time-ago.pipe';

@Component({
  selector: 'df-article-card',
  imports: [TimeAgoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card" [class.is-read]="isRead()">
      <span class="stripe" [style.background]="colorVar()"></span>
      <div class="body">
        <div class="tagrow">
          <span class="tag">
            <span class="dot" [style.background]="colorVar()"></span>
            {{ label() }}
          </span>
          <span class="src">{{ article().sourceName }}</span>
          <span class="time">{{ article().publishedAt | timeAgo }}</span>
        </div>
        <a class="title" [href]="article().url" target="_blank" rel="noopener" (click)="markRead.emit(article().id)">
          {{ article().title }}
        </a>
        @if (article().summary) {
          <p class="summary">{{ article().summary }}</p>
        }
      </div>
      <div class="side">
        @if (article().points !== undefined) {
          <span class="pts">{{ article().points }}</span>
        }
        <button
          type="button"
          class="save"
          [class.on]="saved()"
          [attr.aria-pressed]="saved()"
          aria-label="Save article"
          (click)="save.emit(article().id)"
        >
          ★
        </button>
      </div>
    </article>
  `,
  styles: [
    `
      .card {
        display: grid;
        grid-template-columns: 4px 1fr auto;
        gap: 16px;
        padding: 18px 4px;
        border-bottom: 1px solid var(--line);
      }
      .card.is-read .title {
        color: var(--muted);
      }
      .stripe {
        border-radius: 3px;
      }
      .body {
        min-width: 0;
      }
      .tagrow {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        font-family: var(--mono);
        font-size: 11.5px;
      }
      .tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--muted);
      }
      .dot {
        width: 7px;
        height: 7px;
        border-radius: 2px;
      }
      .src {
        color: var(--faint);
      }
      .time {
        color: var(--faint);
        margin-left: auto;
      }
      .title {
        display: block;
        font-family: var(--serif);
        font-weight: 600;
        font-size: 18.5px;
        line-height: 1.32;
        margin-bottom: 6px;
      }
      .title:hover {
        color: var(--accent);
      }
      .summary {
        margin: 0;
        color: var(--muted);
        font-size: 14px;
        line-height: 1.55;
        max-width: 64ch;
      }
      .side {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
        font-family: var(--mono);
      }
      .pts {
        color: var(--accent);
        font-size: 15px;
      }
      .save {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1px solid var(--line);
        background: transparent;
        color: var(--faint);
        cursor: pointer;
        font-size: 14px;
      }
      .save.on {
        color: var(--accent);
        border-color: var(--accent);
      }
    `,
  ],
})
export class ArticleCardComponent {
  readonly article = input.required<Article>();
  readonly saved = input<boolean>(false);
  readonly isRead = input<boolean>(false);
  readonly save = output<string>();
  readonly markRead = output<string>();

  readonly label = computed(() => categoryLabel(this.article().category));
  readonly colorVar = computed(() => `var(--${this.article().category})`);
}
