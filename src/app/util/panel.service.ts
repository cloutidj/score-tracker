import { Injectable, signal } from '@angular/core';

/**
 * Contextual surfaces that overlay the main content area (below the toolbar).
 * Grows as features contribute panels; if it gets large, consider a registry
 * (mirroring `GAME_TYPE`) so a feature can add a panel without editing here.
 */
export type PanelId = 'players' | 'ruleSets';

/**
 * Tracks which contextual panel (Saved Players, Rule Sets, …) is currently
 * open. Only one panel is open at a time — opening one closes any other — so
 * the shared toggle-icon buttons can read a single source of truth for their
 * lit "you are here" state.
 */
@Injectable({ providedIn: 'root' })
export class PanelService {
  private readonly _openPanel = signal<PanelId | null>(null);

  /** The currently open panel, or `null` when none is open. */
  readonly openPanel = this._openPanel.asReadonly();

  /** Toggle a panel: open it if closed, close it if it's already the open one. */
  toggle(id: PanelId): void {
    this._openPanel.update((current) => (current === id ? null : id));
  }

  /** Close whatever panel is open. */
  close(): void {
    this._openPanel.set(null);
  }
}
