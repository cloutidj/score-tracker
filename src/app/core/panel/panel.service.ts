import { Injectable, signal } from '@angular/core';

/**
 * Tracks which contextual panel (Saved Players, Rule Sets, …) is currently
 * open, by its {@link PanelDescriptor.id}. Only one panel is open at a time —
 * opening one closes any other — so the shared toggle-icon buttons can read a
 * single source of truth for their lit "you are here" state.
 */
@Injectable({ providedIn: 'root' })
export class PanelService {
  private readonly _openPanel = signal<string | null>(null);
  private readonly _previousPanel = signal<string | null>(null);

  /** The currently open panel's id, or `null` when none is open. */
  readonly openPanel = this._openPanel.asReadonly();

  /**
   * The id that was open immediately before the current one, or `null`. Lets
   * `PanelHostComponent` tell a switch between two panels apart from an
   * open/close and derive which direction to animate the switch.
   */
  readonly previousPanel = this._previousPanel.asReadonly();

  /** Toggle a panel: open it if closed, close it if it's already the open one. */
  toggle(id: string): void {
    this.setOpen(this._openPanel() === id ? null : id);
  }

  /** Open a panel unconditionally — unlike {@link toggle}, never closes it. */
  open(id: string): void {
    this.setOpen(id);
  }

  /** Close whatever panel is open. */
  close(): void {
    this.setOpen(null);
  }

  /** Writes `_openPanel`, recording its prior value first so both update in the same tick. */
  private setOpen(next: string | null): void {
    this._previousPanel.set(this._openPanel());
    this._openPanel.set(next);
  }
}
