import { InjectionToken, Signal, Type } from '@angular/core';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { Player } from '@player/models/player';

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
 * Contract supplied to a {@link GameType.setupComponent}. The host provides it through the
 * setup component's injector ({@link GAME_SETUP_CONTEXT}); the component owns its whole setup
 * screen (player selection plus any config it needs) and calls {@link start} to launch the
 * game with the chosen players and config.
 */
export interface GameSetupContext<TConfig = unknown> {
  /** Launch the game for these players with the setup screen's chosen config. */
  start(players: Player[], config: TConfig): void;
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

  /**
   * Optional self-owned setup screen: renders its own player selection and any config UI,
   * then launches via {@link GAME_SETUP_CONTEXT}'s `start`. Omit for the default player-only
   * setup (the host renders `st-player-selection` and starts with an `undefined` config).
   */
  readonly setupComponent?: Type<unknown>;

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

/** Injected by a {@link GameType.setupComponent} to launch the game once setup is complete. */
export const GAME_SETUP_CONTEXT = new InjectionToken<GameSetupContext>('GAME_SETUP_CONTEXT');
