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

  /** The currently open panel's id, or `null` when none is open. */
  readonly openPanel = this._openPanel.asReadonly();

  /** Toggle a panel: open it if closed, close it if it's already the open one. */
  toggle(id: string): void {
    this._openPanel.update((current) => (current === id ? null : id));
  }

  /** Open a panel unconditionally — unlike {@link toggle}, never closes it. */
  open(id: string): void {
    this._openPanel.set(id);
  }

  /** Close whatever panel is open. */
  close(): void {
    this._openPanel.set(null);
  }
}
