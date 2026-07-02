import { InjectionToken, Type } from '@angular/core';
import { Player } from '@player/models/player';
import { GameSession } from './game-session';

/**
 * Describes a game type to the core: the Home card metadata, the components that render
 * its setup/game UI, and the factories the core uses to create or rehydrate its session.
 * Registering one (via {@link GAME_TYPE}) is all it takes to add a game type.
 * See docs/ARCHITECTURE.md#game-type-plugin-system.
 */
export interface GameType<TConfig = unknown> {
  /** Stable id: the `/play/:gameType` route segment and the persistence-key namespace. */
  readonly id: string;
  readonly title: string;
  readonly description: string;
  /** ng-icon name (registered in `icon-library.ts`) for the Home card. */
  readonly icon: string;

  /**
   * Optional self-owned setup screen: renders its own player selection and any config UI,
   * then launches via `GAME_SETUP_CONTEXT`'s `start`. Omit for the default player-only
   * setup (the host renders `st-player-selection` and starts with an `undefined` config).
   */
  readonly setupComponent?: Type<unknown>;

  /** The in-game UI. Resolves `GAME_SESSION` from its injector if it needs the session. */
  readonly gameComponent: Type<unknown>;

  /**
   * Start a fresh session for these players. Runs in an injection context, so it may
   * `inject()` a root service (today's reference) or construct a session directly.
   */
  createSession(players: Player[], config: TConfig): GameSession;

  /**
   * Rebuild a session from a persisted snapshot. Runs in an injection context. Returns
   * `null` (or throws — the host catches and clears) if the snapshot can't be restored.
   */
  restoreSession(snapshot: unknown): GameSession | null;
}

/**
 * Multi-provider token holding every registered {@link GameType}. Add a type with
 * `{ provide: GAME_TYPE, useValue: myGameType, multi: true }` — no edit to the registry.
 */
export const GAME_TYPE = new InjectionToken<GameType[]>('GAME_TYPE');
