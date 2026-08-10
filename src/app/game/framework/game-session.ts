import { Signal } from '@angular/core';

/**
 * The live state of one in-progress game, owned by a concrete game type; the core
 * (`PlayHostComponent`) treats it as a black box so it can hold whichever type's session is
 * active without importing any concrete session service. Deliberately assumes **neither
 * rounds nor turns** — those live inside the concrete session, never in the core.
 * A game type's own session service implements this directly, so its game component
 * gets `reset()` etc. by injecting that concrete service — no separate DI token needed.
 * See docs/ARCHITECTURE.md#game-type-plugin-system.
 */
export interface GameSession {
  /** `true` once a game is live; the host shows the game component, the core persists. */
  readonly gameInitialized: Signal<boolean>;
  /** A plain, JSON-safe snapshot the core writes to storage. Shape is the type's own. */
  toSnapshot(): unknown;
  /** Rehydrate from a snapshot produced by {@link toSnapshot}; may throw on bad data. */
  fromSnapshot(snapshot: unknown): void;
  /** Discard the current game (`gameInitialized` → false); the core clears storage. */
  reset(): void;
}
