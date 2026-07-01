import { Signal, computed } from '@angular/core';

/** The two leader-tracking signals shared by the scoring services. */
export interface LeaderState {
  /** Highest current total; pairs with {@link LeaderState.scored} to flag the leader(s) in the UI. */
  leadingTotal: Signal<number>;
  /** True once any player has scored, so a 0–0 start shows no "leader". */
  scored: Signal<boolean>;
}

/**
 * Derives `leadingTotal` (highest total) and `scored` (has anyone entered anything) from a
 * signal of per-player score items. `total` reads each item's running total and `hasEntry`
 * reports whether that player has scored yet — both vary by scoring mode, so callers supply
 * them while the leader math stays in one place.
 */
export function leaderState<T>(
  items: Signal<readonly T[]>,
  total: (item: T) => number,
  hasEntry: (item: T) => boolean,
): LeaderState {
  return {
    leadingTotal: computed(() => {
      const totals = items().map(total);
      return totals.length ? Math.max(...totals) : 0;
    }),
    scored: computed(() => items().some(hasEntry)),
  };
}
