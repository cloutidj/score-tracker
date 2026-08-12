import { InjectionToken, Type } from '@angular/core';

/**
 * Describes one contextual panel (Home, Styles, Saved Players, Rule Sets, …) reachable from
 * the bottom nav and rendered by `PanelHostComponent`. Registering one (via {@link PANEL}) is
 * all it takes to add a panel — mirrors the `GameType`/`GAME_TYPE` plugin-registration pattern.
 */
export interface PanelDescriptor {
  /** Stable id: the bottom-nav button and `PanelService`'s open/close target. */
  readonly id: string;
  /** Header title / `role="dialog"` accessible name, shown by `PanelHostComponent`. */
  readonly title: string;
  /** Bottom-nav button icon (ng-icon name). */
  readonly icon: string;
  /** Bottom-nav button's accessible label (the nav is icon-only, no visible text). */
  readonly navLabel: string;
  /** The panel's body content. */
  readonly component: Type<unknown>;
}

/**
 * Multi-provider token holding every registered {@link PanelDescriptor}. Add a panel with
 * `{ provide: PANEL, useValue: myPanel, multi: true }` — no edit to the registry or the
 * framework components that render panels.
 */
export const PANEL = new InjectionToken<PanelDescriptor[]>('PANEL');

/**
 * A {@link PanelDescriptor} as resolved by `PanelRegistry`, stamped with its position among
 * `PANEL`'s registration order — which matches the bottom nav's left-to-right button order.
 * Registrations never supply this themselves; the registry computes it once so consumers
 * (e.g. `PanelHostComponent`'s switch-direction math) can compare two panels' positions
 * without re-scanning `all()`.
 */
export interface IndexedPanelDescriptor extends PanelDescriptor {
  readonly index: number;
}
