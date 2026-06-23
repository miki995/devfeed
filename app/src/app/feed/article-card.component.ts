import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Article } from '@shared/index';
import { categoryLabel } from '../core/categories';
import { TimeAgoPipe } from './time-ago.pipe';

@Component({
  selector: 'df-article-card',
  imports: [TimeAgoPipe, RouterLink],
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
          @if (isNew()) {
            <span class="new">NEW</span>
          }
          <span class="src">{{ article().sourceName }}</span>
          @if (article().readMinutes) {
            <span class="src">· {{ article().readMinutes }} min</span>
          }
          <span class="time">{{ article().publishedAt | timeAgo }}</span>
        </div>
        <a class="title" [routerLink]="['/read', article().id]">
          {{ article().title }}
        </a>
        @if (article().summary) {
          <p class="summary">{{ article().summary }}</p>
        }
        <a class="read" [routerLink]="['/read', article().id]">Read →</a>
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
      .new {
        font-family: var(--mono);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.06em;
        color: var(--ground);
        background: var(--accent);
        border-radius: 4px;
        padding: 1px 5px;
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
        max-width: 70ch;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .read {
        display: inline-block;
        margin-top: 9px;
        font-family: var(--mono);
        font-size: 12px;
        color: var(--accent);
      }
      .read:hover {
        text-decoration: underline;
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
  readonly isNew = input<boolean>(false);
  readonly save = output<string>();

  readonly label = computed(() => categoryLabel(this.article().category));
  readonly colorVar = computed(() => `var(--${this.article().category})`);
}
