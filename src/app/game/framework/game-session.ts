import { InjectionToken, Signal } from '@angular/core';

/**
 * The live state of one in-progress game, owned by a concrete game type; the core
 * treats it as a black box. Deliberately assumes **neither rounds nor turns** — those
 * live inside the concrete session, never in the core.
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

/** Injected by a `GameType.gameComponent` that needs the host-owned session instance. */
export const GAME_SESSION = new InjectionToken<GameSession>('GAME_SESSION');
