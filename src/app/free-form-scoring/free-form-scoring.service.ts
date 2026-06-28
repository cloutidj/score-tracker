import { Injectable, Signal, computed, signal } from '@angular/core';
import { Player } from '@models/player';
import { PlayerColor } from '@models/player-color';
import { GameSession } from '@game/game-type';
import { FreeFormPlayerScores } from './models/free-form-player-scores';

/**
 * Plain, JSON-safe snapshot of the live game. Scores are flat number arrays (parallel to
 * `players`) and the player instances are flattened to primitives, since neither survives
 * `JSON.parse`; {@link FreeFormScoringService.fromSnapshot} rebuilds the model instances.
 */
export interface FreeFormSnapshot {
  players: { name: string; playerNumber: number; color: ColorSnapshot }[];
  scores: number[][]; // parallel to players
}

interface ColorSnapshot {
  red: number;
  green: number;
  blue: number;
  name: string;
}

/**
 * Signal-driven state for free-form scoring: any player can be given points at any time,
 * and each player's total is the sum of their entries — no turn order, no rounds. The
 * second registered {@link GameType}, and the first to exercise a *free-form* turn model
 * through the Phase 5 seam (the core assumes neither rounds nor turns, so this needed no
 * core changes).
 *
 * Root-provided and a {@link GameSession}: the play host persists/rehydrates it via
 * {@link toSnapshot}/{@link fromSnapshot} and ends it via {@link reset}, exactly like the
 * per-round reference.
 */
@Injectable({ providedIn: 'root' })
export class FreeFormScoringService implements GameSession {
  private readonly _scores = signal<FreeFormPlayerScores[]>([]);
  private readonly _gameInitialized = signal(false);

  readonly scores: Signal<FreeFormPlayerScores[]> = this._scores.asReadonly();
  readonly gameInitialized: Signal<boolean> = this._gameInitialized.asReadonly();

  /** Highest current total; pairs with {@link scored} to flag the leader(s) in the UI. */
  readonly leadingTotal = computed(() => {
    const totals = this._scores().map((s) => s.total());
    return totals.length ? Math.max(...totals) : 0;
  });

  /** True once any player has at least one entry, so a 0–0 start shows no "leader". */
  readonly scored = computed(() => this._scores().some((s) => s.count() > 0));

  startGame(players: Player[]): void {
    this._scores.set(players.map((p) => new FreeFormPlayerScores(p)));
    this._gameInitialized.set(true);
  }

  /**
   * Discards the current game and returns to player selection. The host observes
   * `gameInitialized` → false and clears the persisted snapshot.
   */
  reset(): void {
    this._scores.set([]);
    this._gameInitialized.set(false);
  }

  /** Add a score (positive or negative) to any player's running total. */
  addScore(player: Player, score: number): void {
    this._scores.update((list) =>
      list.map((s) => (s.player.playerNumber === player.playerNumber ? s.add(score) : s)),
    );
  }

  /** Correct an existing entry (by its position in the player's history). */
  editScore(player: Player, index: number, newScore: number): void {
    this._scores.update((list) =>
      list.map((s) => (s.player.playerNumber === player.playerNumber ? s.edit(index, newScore) : s)),
    );
  }

  /** Remove an entry from a player's history (e.g. one entered by mistake). */
  removeScore(player: Player, index: number): void {
    this._scores.update((list) =>
      list.map((s) => (s.player.playerNumber === player.playerNumber ? s.remove(index) : s)),
    );
  }

  /** Build the JSON-safe snapshot from the live signals. */
  toSnapshot(): FreeFormSnapshot {
    const scores = this._scores();
    return {
      players: scores.map((s) => ({
        name: s.player.name,
        playerNumber: s.player.playerNumber,
        color: {
          red: s.player.color.red,
          green: s.player.color.green,
          blue: s.player.color.blue,
          name: s.player.color.name,
        },
      })),
      scores: scores.map((s) => [...s.entries()]),
    };
  }

  /** Rebuild the model instances from a snapshot and set the signals (game becomes live). */
  fromSnapshot(snap: FreeFormSnapshot): void {
    this._scores.set(
      snap.players.map((p, i) => {
        const color = new PlayerColor(p.color.red, p.color.green, p.color.blue, p.color.name);
        const player = Object.assign(new Player(p.playerNumber), { name: p.name, color });
        return new FreeFormPlayerScores(player, snap.scores[i] ?? []);
      }),
    );
    this._gameInitialized.set(true);
  }
}
