import { Injectable, inject } from '@angular/core';
import { PANEL, PanelDescriptor } from './panel';

/**
 * Root registry of the {@link PanelDescriptor}s the app knows about. Populated declaratively
 * through the {@link PANEL} multi-provider, so adding a panel never touches this class.
 * The bottom nav renders a button per `all()`; the panel host resolves the open one with `byId()`.
 */
@Injectable({ providedIn: 'root' })
export class PanelRegistry {
  private readonly panels = inject(PANEL);

  all(): readonly PanelDescriptor[] {
    return this.panels;
  }

  byId(id: string): PanelDescriptor | undefined {
    return this.panels.find((panel) => panel.id === id);
  }
}
