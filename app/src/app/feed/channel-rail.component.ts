import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { Category } from '@shared/index';
import { CATEGORY_META } from '../core/categories';

interface Channel {
  id: Category | 'all';
  label: string;
  colorVar: string;
  count: number;
}

@Component({
  selector: 'df-channel-rail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="rail">
      <h3>Channels</h3>
      @for (channel of channels(); track channel.id) {
        <button type="button" class="channel" [class.active]="channel.id === selected()" (click)="select.emit(channel.id)">
          <span class="swatch" [style.background]="channel.colorVar"></span>
          <span class="name">{{ channel.label }}</span>
          <span class="count">{{ channel.count }}</span>
        </button>
      }
    </nav>
  `,
  styles: [
    `
      .rail {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      h3 {
        font-family: var(--mono);
        font-size: 11px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--faint);
        margin: 0 0 14px;
        font-weight: 600;
      }
      .channel {
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 9px 11px;
        border: 0;
        background: transparent;
        border-radius: 9px;
        cursor: pointer;
        color: var(--muted);
        font-size: 14px;
        font-family: var(--sans);
        text-align: left;
        width: 100%;
      }
      .channel:hover,
      .channel.active {
        background: var(--surface);
        color: var(--text);
      }
      .swatch {
        width: 10px;
        height: 10px;
        border-radius: 3px;
        flex: none;
      }
      .name {
        flex: 1;
      }
      .count {
        font-family: var(--mono);
        font-size: 11.5px;
        color: var(--faint);
      }
      @media (max-width: 860px) {
        .rail {
          flex-direction: row;
          overflow-x: auto;
          gap: 8px;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .rail::-webkit-scrollbar {
          display: none;
        }
        h3 {
          display: none;
        }
        .channel {
          width: auto;
          flex: none;
          border: 1px solid var(--line);
          padding: 7px 12px;
        }
        .channel .count {
          display: none;
        }
      }
    `,
  ],
})
export class ChannelRailComponent {
  readonly selected = input.required<Category | 'all'>();
  readonly counts = input.required<Map<Category, number>>();
  readonly totalCount = input.required<number>();
  readonly select = output<Category | 'all'>();

  readonly channels = computed<Channel[]>(() => {
    const categoryChannels: Channel[] = CATEGORY_META.map((meta) => ({
      id: meta.id,
      label: meta.label,
      colorVar: `var(--${meta.id})`,
      count: this.counts().get(meta.id) ?? 0,
    }));
    return [{ id: 'all', label: 'All feeds', colorVar: 'var(--accent)', count: this.totalCount() }, ...categoryChannels];
  });
}
