import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { FeedGlobalStateService } from '../core/feed.state';
import { categoryLabel } from '../core/categories';
import type { Category } from '@shared/index';

interface SourceRow {
  id: string;
  name: string;
  colorVar: string;
  enabled: boolean;
}

interface SourceGroup {
  category: Category;
  label: string;
  colorVar: string;
  rows: SourceRow[];
}

@Component({
  selector: 'df-sources-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="close.emit()"></div>
    <section class="panel" role="dialog" aria-label="Manage sources">
      <header>
        <h3>Sources</h3>
        <button type="button" class="x" aria-label="Close" (click)="close.emit()">✕</button>
      </header>
      <div class="groups">
        @for (group of groups(); track group.category) {
          <div class="group">
            <div class="group-head">
              <span class="swatch" [style.background]="group.colorVar"></span>
              {{ group.label }}
            </div>
            @for (row of group.rows; track row.id) {
              <label class="row">
                <input type="checkbox" [checked]="row.enabled" (change)="state.toggleSource(row.id)" />
                <span class="name">{{ row.name }}</span>
              </label>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 20;
      }
      .panel {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: min(420px, 90vw);
        background: var(--ground);
        border-left: 1px solid var(--line);
        z-index: 21;
        display: flex;
        flex-direction: column;
      }
      header {
        display: flex;
        align-items: center;
        padding: 18px 20px;
        border-bottom: 1px solid var(--line);
      }
      header h3 {
        margin: 0;
        font-family: var(--serif);
        font-size: 20px;
      }
      .x {
        margin-left: auto;
        border: 0;
        background: transparent;
        color: var(--muted);
        font-size: 16px;
        cursor: pointer;
      }
      .groups {
        overflow-y: auto;
        padding: 12px 20px 40px;
      }
      .group {
        margin-bottom: 22px;
      }
      .group-head {
        display: flex;
        align-items: center;
        gap: 9px;
        font-family: var(--mono);
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--faint);
        margin-bottom: 10px;
      }
      .swatch {
        width: 9px;
        height: 9px;
        border-radius: 3px;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 7px 0;
        font-size: 14px;
        color: var(--text);
        cursor: pointer;
      }
      .row input {
        accent-color: var(--accent);
        width: 16px;
        height: 16px;
      }
    `,
  ],
})
export class SourcesPanelComponent {
  readonly state = inject(FeedGlobalStateService);
  readonly close = output<void>();

  readonly groups = computed<SourceGroup[]>(() => {
    const disabled = new Set(this.state.disabledSourceIds());
    const byCategory = new Map<Category, SourceRow[]>();
    for (const source of this.state.sources()) {
      const rows = byCategory.get(source.category) ?? [];
      rows.push({
        id: source.id,
        name: source.name,
        colorVar: `var(--${source.category})`,
        enabled: !disabled.has(source.id),
      });
      byCategory.set(source.category, rows);
    }
    return Array.from(byCategory.entries()).map(([category, rows]) => ({
      category,
      label: categoryLabel(category),
      colorVar: `var(--${category})`,
      rows,
    }));
  });
}
