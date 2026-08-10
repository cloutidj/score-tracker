import { Injectable, inject, signal } from '@angular/core';
import { DatabaseService } from '@core/database.service';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'st-theme';
const THEME_ATTRIBUTE = 'data-theme';

/**
 * Controls the app color theme by setting `data-theme` on `<body>` — each skin's light/dark
 * blocks in `src/styles/skins/` key off that attribute.
 *
 * The user's explicit choice is persisted via {@link DatabaseService}; on first load we
 * fall back to the operating system's `prefers-color-scheme` setting.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly database = inject(DatabaseService);
  private readonly _theme = signal<Theme>(this.resolveInitialTheme());

  /** The currently active theme. */
  readonly theme = this._theme.asReadonly();

  initialize(): void {
    this.apply(this._theme());
  }

  toggle(): void {
    this.set(this._theme() === 'dark' ? 'light' : 'dark');
  }

  private set(theme: Theme): void {
    this._theme.set(theme);
    this.database.save(STORAGE_KEY, theme);
    this.apply(theme);
  }

  private apply(theme: Theme): void {
    document.body.setAttribute(THEME_ATTRIBUTE, theme);
  }

  private resolveInitialTheme(): Theme {
    const saved = this.database.get<Theme>(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
