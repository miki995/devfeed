import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { FeedGlobalStateService } from '../core/feed.state';
import { ReleaseNotificationService } from '../core/notify.service';
import { categoryLabel } from '../core/categories';
import { TimeAgoPipe } from './time-ago.pipe';
import type { Category } from '@shared/index';

const STALE_DAYS = 30;

interface SourceRow {
  id: string;
  name: string;
  colorVar: string;
  enabled: boolean;
  latestAt: string;
  stale: boolean;
}

interface SourceGroup {
  category: Category;
  label: string;
  colorVar: string;
  rows: SourceRow[];
}

@Component({
  selector: 'df-sources-panel',
  imports: [TimeAgoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="close.emit()"></div>
    <section class="panel" role="dialog" aria-label="Manage sources">
      <header>
        <h3>Sources</h3>
        <button type="button" class="x" aria-label="Close" (click)="close.emit()">✕</button>
      </header>

      <div class="tools">
        <div class="muted">
          <label class="field">
            <span class="field-label">Mute keywords</span>
            <input
              #keywordInput
              type="text"
              placeholder="e.g. crypto, web3 — press Enter"
              (keydown.enter)="addKeyword(keywordInput)"
            />
          </label>
          @if (state.mutedKeywords().length) {
            <div class="chips">
              @for (keyword of state.mutedKeywords(); track keyword) {
                <button type="button" class="chip" (click)="state.removeMutedKeyword(keyword)">{{ keyword }} ✕</button>
              }
            </div>
          }
        </div>
        <div class="backup">
          <button type="button" class="tool-btn" (click)="exportData()">Export data</button>
          <label class="tool-btn">
            Import
            <input type="file" accept="application/json" hidden (change)="importData($event)" />
          </label>
          @if (importStatus()) {
            <span class="import-status">{{ importStatus() }}</span>
          }
        </div>
        <div class="backup">
          @if (notify.permission() === 'granted') {
            <span class="import-status">Release alerts on</span>
          } @else {
            <button type="button" class="tool-btn" (click)="notify.enable()">Enable release alerts</button>
          }
        </div>
      </div>

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
                @if (row.latestAt) {
                  <span class="age" [class.stale]="row.stale">{{ row.latestAt | timeAgo }}</span>
                } @else {
                  <span class="age stale">no items</span>
                }
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
      .tools {
        padding: 14px 20px;
        border-bottom: 1px solid var(--line);
      }
      .field {
        display: block;
      }
      .field-label {
        display: block;
        font-family: var(--mono);
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--faint);
        margin-bottom: 7px;
      }
      .field input {
        width: 100%;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 9px 12px;
        color: var(--text);
        font-family: var(--mono);
        font-size: 13px;
        outline: none;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin-top: 10px;
      }
      .chip {
        font-family: var(--mono);
        font-size: 11.5px;
        color: var(--ground);
        background: var(--accent);
        border: 0;
        border-radius: 16px;
        padding: 4px 10px;
        cursor: pointer;
      }
      .backup {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 16px;
      }
      .tool-btn {
        font-family: var(--mono);
        font-size: 12px;
        color: var(--muted);
        border: 1px solid var(--line);
        background: var(--surface);
        border-radius: 8px;
        padding: 7px 12px;
        cursor: pointer;
      }
      .tool-btn:hover {
        color: var(--text);
        border-color: var(--faint);
      }
      .import-status {
        font-family: var(--mono);
        font-size: 11px;
        color: var(--accent);
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
      .name {
        flex: 1;
      }
      .age {
        font-family: var(--mono);
        font-size: 11px;
        color: var(--faint);
      }
      .age.stale {
        color: var(--angular);
      }
    `,
  ],
})
export class SourcesPanelComponent {
  readonly state = inject(FeedGlobalStateService);
  readonly notify = inject(ReleaseNotificationService);
  readonly close = output<void>();
  readonly importStatus = signal<string>('');

  addKeyword(input: HTMLInputElement): void {
    this.state.addMutedKeyword(input.value);
    input.value = '';
  }

  exportData(): void {
    const blob = new Blob([this.state.exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'devfeed-backup.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  importData(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    file.text().then((text) => {
      const ok = this.state.importData(text);
      this.importStatus.set(ok ? 'Imported' : 'Invalid file');
      setTimeout(() => this.importStatus.set(''), 2000);
    });
  }

  readonly groups = computed<SourceGroup[]>(() => {
    const disabled = new Set(this.state.disabledSourceIds());
    const latestBySource = this.state.latestBySource();
    const staleThreshold = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
    const byCategory = new Map<Category, SourceRow[]>();
    for (const source of this.state.sources()) {
      const rows = byCategory.get(source.category) ?? [];
      const latestAt = latestBySource.get(source.id) ?? '';
      const stale = !latestAt || new Date(latestAt).getTime() < staleThreshold;
      rows.push({
        id: source.id,
        name: source.name,
        colorVar: `var(--${source.category})`,
        enabled: !disabled.has(source.id),
        latestAt,
        stale,
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
