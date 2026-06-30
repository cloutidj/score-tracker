import { Injectable, signal } from '@angular/core';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'st-theme';
const THEME_ATTRIBUTE = 'data-theme';

/**
 * Controls the app color theme. `_theme.scss` flips Material's M3 palette from
 * the `[data-theme~="dark"]` selector (a single `color-scheme` switch), so we
 * apply the chosen theme by setting the `data-theme` attribute on `<body>`.
 *
 * The user's explicit choice is persisted in localStorage; on first load we
 * fall back to the operating system's `prefers-color-scheme` setting.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
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
    localStorage.setItem(STORAGE_KEY, theme);
    this.apply(theme);
  }

  private apply(theme: Theme): void {
    document.body.setAttribute(THEME_ATTRIBUTE, theme);
  }

  private resolveInitialTheme(): Theme {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
