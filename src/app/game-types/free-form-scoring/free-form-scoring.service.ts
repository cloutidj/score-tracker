import { Injectable, Signal, signal } from '@angular/core';
import { Player } from '@player/models/player';
import {
  PlayerSnapshot,
  playerFromSnapshot,
  toPlayerSnapshot,
} from '@player/models/player-snapshot';
import { GameSession } from '@game/game-type';
import { leaderState } from '@game-types/leader-state';
import { FreeFormPlayerScores } from './models/free-form-player-scores';

/**
 * Plain, JSON-safe snapshot of the live game. Scores are flat number arrays (parallel to
 * `players`) and the player instances are flattened to primitives, since neither survives
 * `JSON.parse`; {@link FreeFormScoringService.fromSnapshot} rebuilds the model instances.
 */
export interface FreeFormSnapshot {
  players: PlayerSnapshot[];
  scores: number[][]; // parallel to players
}

/**
 * Signal-driven state for free-form scoring: any player can be given points at any time,
 * and each player's total is the sum of their entries — no turn order, no rounds.
 *
 * Root-provided and a {@link GameSession}: the play host persists/rehydrates it via
 * {@link toSnapshot}/{@link fromSnapshot} and ends it via {@link reset}.
 */
@Injectable({ providedIn: 'root' })
export class FreeFormScoringService implements GameSession {
  private readonly _scores = signal<FreeFormPlayerScores[]>([]);
  private readonly _gameInitialized = signal(false);

  readonly scores: Signal<FreeFormPlayerScores[]> = this._scores.asReadonly();
  readonly gameInitialized: Signal<boolean> = this._gameInitialized.asReadonly();

  private readonly _leaders = leaderState(
    this._scores,
    (s) => s.total(),
    (s) => s.count() > 0,
  );
  readonly leadingTotal = this._leaders.leadingTotal;
  readonly scored = this._leaders.scored;

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
      players: scores.map((s) => toPlayerSnapshot(s.player)),
      scores: scores.map((s) => [...s.entries()]),
    };
  }

  /** Rebuild the model instances from a snapshot and set the signals (game becomes live). */
  fromSnapshot(snap: FreeFormSnapshot): void {
    this._scores.set(
      snap.players.map((p, i) => new FreeFormPlayerScores(playerFromSnapshot(p), snap.scores[i] ?? [])),
    );
    this._gameInitialized.set(true);
  }
}
