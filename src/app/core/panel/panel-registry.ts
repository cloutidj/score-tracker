import { Injectable, inject } from '@angular/core';
import { IndexedPanelDescriptor, PANEL } from './panel';

/**
 * Root registry of the {@link PanelDescriptor}s the app knows about. Populated declaratively
 * through the {@link PANEL} multi-provider, so adding a panel never touches this class.
 * The bottom nav renders a button per `all()`; the panel host resolves the open one with
 * `byId()`. Both return {@link IndexedPanelDescriptor}s — the registration order, stamped
 * on once here — so callers comparing two panels' positions (e.g. switch-direction math)
 * don't each need their own O(n) scan over `all()`.
 */
@Injectable({ providedIn: 'root' })
export class PanelRegistry {
  private readonly indexed: readonly IndexedPanelDescriptor[] = inject(PANEL).map(
    (panel, index) => ({ ...panel, index }),
  );

  private readonly byIdMap = new Map(this.indexed.map((panel) => [panel.id, panel]));

  all(): readonly IndexedPanelDescriptor[] {
    return this.indexed;
  }

  byId(id: string): IndexedPanelDescriptor | undefined {
    return this.byIdMap.get(id);
  }
}
