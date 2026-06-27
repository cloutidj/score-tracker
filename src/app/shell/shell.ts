import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

type Theme = 'light' | 'dark';

/**
 * Hand-built, mobile-first app shell: a flex column with a fixed header and a
 * single scrollable content area (projected via `<ng-content>`). Replaces the
 * Clarity `clr-main-container` / `clr-header` layout.
 *
 * Presentational only — the owning `App` keeps the `ThemeService` / `SwUpdate`
 * wiring and feeds state in through inputs / receives intent through outputs.
 */
@Component({
  selector: 'st-shell',
  imports: [RouterLink, FontAwesomeModule],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  readonly theme = input.required<Theme>();
  readonly updateAvailable = input(false);

  readonly toggleTheme = output<void>();
  readonly updateApplication = output<void>();
}