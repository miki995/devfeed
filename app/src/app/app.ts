import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeedGlobalStateService } from './core/feed.state';
import { cycleChannel } from './core/navigation';
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
  host: { '(document:keydown)': 'onKeydown($event)', '(window:scroll)': 'onScroll()' },
})
export class App {
  protected readonly state = inject(FeedGlobalStateService);
  protected readonly themeLabel = computed(() => THEMES.find((theme) => theme.id === this.state.theme())?.label ?? 'Midnight');
  protected readonly sourcesOpen = signal<boolean>(false);
  protected readonly helpOpen = signal<boolean>(false);
  protected readonly scrolled = signal<boolean>(false);
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 600);
  }

  protected scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected toggleSources(open: boolean): void {
    this.sourcesOpen.set(open);
  }

  protected toggleHelp(open: boolean): void {
    this.helpOpen.set(open);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';

    if (event.key === 'Escape') {
      if (this.helpOpen()) {
        this.helpOpen.set(false);
      } else if (this.sourcesOpen()) {
        this.sourcesOpen.set(false);
      } else if (typing) {
        this.searchInput()?.nativeElement.blur();
      }
      return;
    }

    if (typing || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    if (event.key === '/') {
      event.preventDefault();
      this.searchInput()?.nativeElement.focus();
      return;
    }
    if (event.key === ']') {
      this.state.setCategory(cycleChannel(this.state.selectedCategory(), 1));
      return;
    }
    if (event.key === '[') {
      this.state.setCategory(cycleChannel(this.state.selectedCategory(), -1));
      return;
    }
    if (event.key === 's') {
      this.state.setView(this.state.view() === 'saved' ? 'all' : 'saved');
      return;
    }
    if (event.key === 't') {
      this.cycleTheme();
      return;
    }
    if (event.key === '?') {
      this.helpOpen.update((open) => !open);
    }
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
