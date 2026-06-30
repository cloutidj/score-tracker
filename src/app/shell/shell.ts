import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PanelService } from '@core/panel.service';
import { ToggleIconButtonComponent } from '@ui/toggle-icon-button/toggle-icon-button.component';

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
  imports: [RouterLink, MatToolbarModule, ToggleIconButtonComponent],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  protected readonly panelService = inject(PanelService);

  readonly theme = input.required<Theme>();
  readonly updateAvailable = input(false);

  readonly toggleTheme = output<void>();
  readonly updateApplication = output<void>();
}
