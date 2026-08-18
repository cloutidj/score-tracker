import { Injectable, Signal, signal } from '@angular/core';
import { Player } from '@player/models/player';
import { playerFromSnapshot, toPlayerSnapshot } from '@player/models/player-snapshot';
import { GameSession } from '@game/game-session';
import { LeaderState } from '@game-types/_shared/models/leader-state';
import { FreeFormPlayerScores } from './models/free-form-player-scores';
import { FreeFormSnapshot } from './models/free-form-snapshot';

/**
 * Signal-driven state for free-form scoring: any player can be given points at any time,
 * and each player's total is the sum of their entries — no turn order, no rounds.
 *
 * Root-provided {@link GameSession}; see docs/ARCHITECTURE.md#persistence.
 */
@Injectable({ providedIn: 'root' })
export class FreeFormScoringService implements GameSession {
  private readonly _scores = signal<FreeFormPlayerScores[]>([]);
  private readonly _gameInitialized = signal(false);

  readonly scores: Signal<FreeFormPlayerScores[]> = this._scores.asReadonly();
  readonly gameInitialized: Signal<boolean> = this._gameInitialized.asReadonly();

  private readonly _leaders = LeaderState.from(
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

  /** Returns to player selection; the host clears the persisted snapshot once `gameInitialized` goes false. */
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

  toSnapshot(): FreeFormSnapshot {
    const scores = this._scores();
    return {
      players: scores.map((s) => toPlayerSnapshot(s.player)),
      scores: scores.map((s) => [...s.entries()]),
    };
  }

  /** Rebuilds the model instances from the snapshot; the game becomes live. */
  fromSnapshot(snap: FreeFormSnapshot): void {
    this._scores.set(
      snap.players.map((p, i) => new FreeFormPlayerScores(playerFromSnapshot(p), snap.scores[i] ?? [])),
    );
    this._gameInitialized.set(true);
  }
}
