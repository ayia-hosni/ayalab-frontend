import { Injectable, effect, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'aya-lab-theme';

/**
 * Tracks the active light/dark theme. Until the user makes an explicit
 * choice, no [data-theme] attribute is stamped on <html> at all — the CSS
 * `@media (prefers-color-scheme: dark)` block in styles.css drives the theme
 * on its own, so it keeps following live OS changes with zero JS involved.
 * Only once the user actually toggles does this pin an explicit value (in
 * both localStorage and the DOM attribute), which then overrides the OS
 * preference regardless of what it does afterward.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private hasExplicitChoice = this.readStored() !== null;
  theme = signal<Theme>(this.readStored() ?? this.systemPreference());

  constructor() {
    effect(() => {
      const t = this.theme();
      if (typeof document !== 'undefined' && this.hasExplicitChoice) {
        document.documentElement.setAttribute('data-theme', t);
      }
    });
  }

  private readStored(): Theme | null {
    if (typeof localStorage === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  }

  private systemPreference(): Theme {
    if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  get isDark(): boolean { return this.theme() === 'dark'; }

  set(t: Theme): void {
    this.hasExplicitChoice = true;
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, t);
    this.theme.set(t);
  }

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }
}
