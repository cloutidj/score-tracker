import { Injectable, Signal, computed, signal } from '@angular/core';
import { Player } from '@player/models/player';
import { playerFromSnapshot, toPlayerSnapshot } from '@player/models/player-snapshot';
import { GameSession } from '@game/game-session';
import { HealthPointsConfig } from './models/health-points-config';
import { HealthPointsPlayerState } from './models/health-points-player-state';
import { HealthPointsSnapshot } from './models/health-points-snapshot';

/**
 * Signal-driven state for health-points tracking: every player starts at a shared life total and
 * takes signed damage/heal at any time — no turn order, no rounds. A player is eliminated at 0,
 * and the last one standing is the winner. Unlike the other types this counts *down* and derives
 * a winner (not a highest-total leader), so it owns that logic rather than reusing `LeaderState`.
 *
 * Root-provided {@link GameSession}; see docs/ARCHITECTURE.md#persistence.
 */
@Injectable({ providedIn: 'root' })
export class HealthPointsService implements GameSession {
  private readonly _players = signal<HealthPointsPlayerState[]>([]);
  private readonly _gameInitialized = signal(false);

  readonly players: Signal<HealthPointsPlayerState[]> = this._players.asReadonly();
  readonly gameInitialized: Signal<boolean> = this._gameInitialized.asReadonly();

  /** Players still in the game (life above zero). */
  readonly activePlayers = computed(() => this._players().filter((p) => !p.eliminated()));

  /**
   * The winner, or `null` while the game is undecided: the sole survivor, but only once at least
   * one player has been eliminated — so a fresh game with everyone alive shows no winner.
   */
  readonly winner = computed<Player | null>(() => {
    const players = this._players();
    const active = players.filter((p) => !p.eliminated());
    const anyEliminated = active.length < players.length;
    return anyEliminated && active.length === 1 ? active[0].player : null;
  });

  startGame(players: Player[], config: HealthPointsConfig): void {
    this._players.set(players.map((p) => new HealthPointsPlayerState(p, config.startingLife)));
    this._gameInitialized.set(true);
  }

  /**
   * Discards the current game and returns to setup. The host observes `gameInitialized` → false
   * and clears the persisted snapshot.
   */
  reset(): void {
    this._players.set([]);
    this._gameInitialized.set(false);
  }

  /** Apply a signed change to a player's life (damage < 0, heal > 0); a no-op change is ignored. */
  adjust(player: Player, delta: number): void {
    if (delta === 0) {
      return;
    }
    this._players.update((list) =>
      list.map((p) => (p.player.playerNumber === player.playerNumber ? p.adjust(delta) : p)),
    );
  }

  /** Correct a past change (by its position in the player's history). */
  editEntry(player: Player, index: number, delta: number): void {
    this._players.update((list) =>
      list.map((p) => (p.player.playerNumber === player.playerNumber ? p.edit(index, delta) : p)),
    );
  }

  /** Remove a change from a player's history (e.g. a double-tapped quick button). */
  removeEntry(player: Player, index: number): void {
    this._players.update((list) =>
      list.map((p) => (p.player.playerNumber === player.playerNumber ? p.remove(index) : p)),
    );
  }

  /** Build the JSON-safe snapshot from the live signals. */
  toSnapshot(): HealthPointsSnapshot {
    const players = this._players();
    return {
      players: players.map((p) => toPlayerSnapshot(p.player)),
      startingLife: players[0]?.startingLife ?? 0,
      deltas: players.map((p) => [...p.entries()]),
    };
  }

  /** Rebuild the model instances from a snapshot and set the signals (game becomes live). */
  fromSnapshot(snap: HealthPointsSnapshot): void {
    this._players.set(
      snap.players.map(
        (p, i) =>
          new HealthPointsPlayerState(playerFromSnapshot(p), snap.startingLife, snap.deltas[i] ?? []),
      ),
    );
    this._gameInitialized.set(true);
  }
}
