import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

type Theme = 'light' | 'dark';

/**
 * Hand-built, mobile-first app shell: a flex column with a fixed header and a
 * single scrollable content area (projected via `<ng-content>`). Replaces the
 * legacy library's main-container / header layout.
 *
 * Presentational only — the owning `App` keeps the `ThemeService` / `SwUpdate`
 * wiring and feeds state in through inputs / receives intent through outputs.
 */
@Component({
  selector: 'st-shell',
  imports: [RouterLink, MatButtonModule, MatToolbarModule, FontAwesomeModule],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  readonly theme = input.required<Theme>();
  readonly updateAvailable = input(false);
  readonly playersOpen = input(false);
  readonly ruleSetsOpen = input(false);

  readonly toggleTheme = output<void>();
  readonly openPlayers = output<void>();
  readonly openRuleSets = output<void>();
  readonly updateApplication = output<void>();
}
