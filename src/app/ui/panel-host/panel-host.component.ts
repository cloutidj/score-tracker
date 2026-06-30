import { Component, computed, effect, inject } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { SavedPlayersComponent } from '@player/saved-players/saved-players.component';
import { ScoringConfigManagerComponent } from '@game-types/end-game-scoring/config-manager/scoring-config-manager.component';
import { PanelId, PanelService } from '@core/panel.service';

/** Accessible name for each panel's `role="dialog"` (no visible header). */
const PANEL_TITLES: Record<PanelId, string> = {
  players: 'Saved Players',
  ruleSets: 'Rule Sets',
};

/**
 * Layered host for the app's contextual panels (Saved Players, Rule Sets). It
 * overlays the **content region only** — it mounts inside `.shell-content`, below
 * the toolbar, so the toolbar (and its lit toggle) stay visible while a panel is
 * open and the route/game underneath stays mounted (no remount).
 *
 * The panel has no header of its own: the toolbar stays visible, so its lit
 * toggle icon (plus Esc) is the close affordance — a second in-panel bar would
 * just duplicate the app toolbar. Re-earns the affordances the retired
 * full-screen `MatDialog` gave for free: a focus trap (`cdkTrapFocus` +
 * auto-capture), Esc-to-close, and focus returned to the trigger on close.
 */
@Component({
  selector: 'st-panel-host',
  imports: [A11yModule, SavedPlayersComponent, ScoringConfigManagerComponent],
  templateUrl: './panel-host.component.html',
  styleUrl: './panel-host.component.scss',
})
export class PanelHostComponent {
  private readonly panelService = inject(PanelService);

  /** The currently open panel id, or `null` when none is open. */
  protected readonly openPanel = this.panelService.openPanel;

  /** Accessible name for the open panel, or `null` when none is open. */
  protected readonly title = computed<string | null>(() => {
    const id = this.openPanel();
    return id ? PANEL_TITLES[id] : null;
  });

  /** The element that held focus before the panel opened, to restore on close. */
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    // Remember the trigger when a panel opens and hand focus back to it when the
    // panel closes — the focus-trap auto-capture moves focus into the panel, so
    // without this it would be lost to <body> on close.
    effect(() => {
      const open = this.openPanel() !== null;
      if (open) {
        this.previouslyFocused ??= document.activeElement as HTMLElement | null;
      } else if (this.previouslyFocused) {
        this.previouslyFocused.focus();
        this.previouslyFocused = null;
      }
    });
  }

  protected close(): void {
    this.panelService.close();
  }
}
