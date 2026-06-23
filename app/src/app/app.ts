import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeedGlobalStateService } from './core/feed.state';
import { SourcesPanelComponent } from './feed/sources-panel.component';

interface ThemeOption {
  id: string;
  label: string;
}

const THEMES: ThemeOption[] = [
  { id: 'midnight', label: 'Midnight' },
  { id: 'paper', label: 'Paper' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'grape', label: 'Grape' },
  { id: 'ember', label: 'Ember' },
];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SourcesPanelComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly state = inject(FeedGlobalStateService);
  protected readonly themeLabel = computed(() => THEMES.find((theme) => theme.id === this.state.theme())?.label ?? 'Midnight');
  protected readonly sourcesOpen = signal<boolean>(false);

  protected toggleSources(open: boolean): void {
    this.sourcesOpen.set(open);
  }

  constructor() {
    effect(() => {
      const active = this.state.theme();
      if (active === 'midnight') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', active);
      }
    });
  }

  protected cycleTheme(): void {
    const currentIndex = THEMES.findIndex((theme) => theme.id === this.state.theme());
    const next = THEMES[(currentIndex + 1) % THEMES.length];
    this.state.setTheme(next.id);
  }

  protected onSearch(value: string): void {
    this.state.setSearch(value);
  }
}
