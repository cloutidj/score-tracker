import { InjectionToken, Signal, Type } from '@angular/core';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { Player } from '@models/player';

/**
 * The live state of one in-progress game, owned by a concrete game type. The core
 * (see {@link GameSessionStore} and the play host) treats it as a black box: it
 * gates the UI on {@link gameInitialized}, persists/rehydrates it by delegating to
 * {@link toSnapshot}/{@link fromSnapshot}, and ends it via {@link reset}.
 *
 * Deliberately assumes **neither rounds nor turns** — those concepts live inside a
 * concrete session (e.g. {@link PerRoundScoringService}), never in the core. That is
 * what lets future types (a free-form track, an end-game category sheet) plug in
 * without touching the host.
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

/**
 * Optional contract supplied to a {@link GameType.configComponent}. The host provides it
 * through the config component's injector ({@link GAME_CONFIG_CONTEXT}); the component
 * edits the seeded {@link config} and calls {@link complete} to start the game, or
 * {@link back} to return to player selection.
 */
export interface GameConfigContext<TConfig = unknown> {
  readonly players: Player[];
  /** Seed value from {@link GameType.defaultConfig}. */
  readonly config: TConfig;
  complete(config: TConfig): void;
  back(): void;
}

/**
 * Describes a game type to the core: the Home card metadata, the components that render
 * its setup/game UI, and the factories the core uses to create or rehydrate its session.
 * Registering one of these (via {@link GAME_TYPE}) — plus its component(s) — is all it
 * takes to add a game type; the core supplies routing, the Home card, persistence, and
 * the tool-overlay shell.
 */
export interface GameType<TConfig = unknown> {
  /** Stable id: the `/play/:gameType` route segment and the persistence-key namespace. */
  readonly id: string;
  readonly title: string;
  readonly description: string;
  /** Font Awesome glyph name (registered in `icon-library.ts`) for the Home card. */
  readonly icon: IconName;

  /** Optional second setup step rendering/editing `TConfig`; omit for player-only setup. */
  readonly configComponent?: Type<unknown>;
  /** Seed config for the config step; required when {@link configComponent} is set. */
  readonly defaultConfig?: () => TConfig;

  /** The in-game UI. Resolves {@link GAME_SESSION} from its injector if it needs the session. */
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

/** Injected by a {@link GameType.gameComponent} that needs the host-owned session instance. */
export const GAME_SESSION = new InjectionToken<GameSession>('GAME_SESSION');

/** Injected by a {@link GameType.configComponent} to read the seed and report completion. */
export const GAME_CONFIG_CONTEXT = new InjectionToken<GameConfigContext>('GAME_CONFIG_CONTEXT');
