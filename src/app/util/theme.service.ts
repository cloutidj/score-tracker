import { Injectable, signal } from '@angular/core';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'st-theme';
const THEME_ATTRIBUTE = 'cds-theme';

/**
 * Controls the Clarity color theme. Clarity 18 activates its dark palette via
 * the `[cds-theme~="dark"]` selector, so we apply the chosen theme by setting
 * the `cds-theme` attribute on `<body>`.
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
