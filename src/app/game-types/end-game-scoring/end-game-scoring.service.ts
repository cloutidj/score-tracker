import { Injectable, Signal, computed, signal } from '@angular/core';
import { Player } from '@player/models/player';
import {
  PlayerSnapshot,
  playerFromSnapshot,
  toPlayerSnapshot,
} from '@player/models/player-snapshot';
import { GameSession } from '@game/game-type';
import { ScoringConfig } from './models/scoring-config';
import { CategoryValues, PlayerScoreBreakdown, computePlayerScore } from './scoring-engine';

/** A player's entered category values plus the computed breakdown for the chosen config. */
export interface PlayerSheet {
  player: Player;
  values: CategoryValues;
  breakdown: PlayerScoreBreakdown;
}

/**
 * Plain, JSON-safe snapshot of the live game. The chosen {@link ScoringConfig} is embedded
 * whole, so a resumed game keeps scoring even if the source config is later edited or
 * deleted; players are flattened to primitives (rebuilt on restore) and values are kept by
 * `playerNumber`.
 */
export interface EndGameSnapshot {
  config: ScoringConfig;
  players: PlayerSnapshot[];
  values: Record<number, CategoryValues>;
}

/**
 * Signal-driven state for end-game scoring: players fill in per-category values and each
 * player's final score is computed from the config's rules via the pure
 * {@link computePlayerScore} engine — no rounds, no turns, score anyone in any order. The
 * config is chosen at setup (via the descriptor's config-component) rather than fixed by
 * the type.
 *
 * Root-provided and a {@link GameSession}: the play host persists/rehydrates it via
 * {@link toSnapshot}/{@link fromSnapshot} and ends it via {@link reset}.
 */
@Injectable({ providedIn: 'root' })
export class EndGameScoringService implements GameSession {
  private readonly _config = signal<ScoringConfig | null>(null);
  private readonly _players = signal<Player[]>([]);
  /** Entered values keyed by `playerNumber` → category id → value. */
  private readonly _values = signal<Record<number, CategoryValues>>({});
  private readonly _gameInitialized = signal(false);

  readonly config: Signal<ScoringConfig | null> = this._config.asReadonly();
  readonly gameInitialized: Signal<boolean> = this._gameInitialized.asReadonly();

  /** Per-player entered values + computed breakdown, in player order. */
  readonly scores = computed<PlayerSheet[]>(() => {
    const config = this._config();
    if (!config) {
      return [];
    }
    const values = this._values();
    return this._players().map((player) => {
      const playerValues = values[player.playerNumber] ?? {};
      return { player, values: playerValues, breakdown: computePlayerScore(config, playerValues) };
    });
  });

  /** Highest current total; pairs with {@link scored} to flag the leader(s) in the UI. */
  readonly leadingTotal = computed(() => {
    const totals = this.scores().map((sheet) => sheet.breakdown.total);
    return totals.length ? Math.max(...totals) : 0;
  });

  /** True once any player has entered any category value, so a 0–0 start shows no "leader". */
  readonly scored = computed(() =>
    Object.values(this._values()).some((forPlayer) => Object.keys(forPlayer).length > 0),
  );

  startGame(players: Player[], config: ScoringConfig): void {
    this._config.set(config);
    this._players.set(players);
    this._values.set({});
    this._gameInitialized.set(true);
  }

  /**
   * Discards the current game and returns to setup. The host observes `gameInitialized` →
   * false and clears the persisted snapshot.
   */
  reset(): void {
    this._config.set(null);
    this._players.set([]);
    this._values.set({});
    this._gameInitialized.set(false);
  }

  /** Set a player's entered value for one category (replaces any previous entry). */
  setValue(player: Player, categoryId: string, value: number): void {
    this._values.update((all) => ({
      ...all,
      [player.playerNumber]: { ...(all[player.playerNumber] ?? {}), [categoryId]: value },
    }));
  }

  /** Build the JSON-safe snapshot from the live signals (only called while a game is live). */
  toSnapshot(): EndGameSnapshot {
    return {
      config: this._config()!,
      players: this._players().map((player) => toPlayerSnapshot(player)),
      values: this._values(),
    };
  }

  /** Rebuild the model instances from a snapshot and set the signals (game becomes live). */
  fromSnapshot(snap: EndGameSnapshot): void {
    this._config.set(snap.config);
    this._players.set(snap.players.map((p) => playerFromSnapshot(p)));
    this._values.set(snap.values ?? {});
    this._gameInitialized.set(true);
  }
}
