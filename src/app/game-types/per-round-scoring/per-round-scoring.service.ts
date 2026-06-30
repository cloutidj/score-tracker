import { Injectable, Signal, computed, signal } from '@angular/core';
import { ChartDataset } from 'chart.js';
import { Player } from '@player/models/player';
import { PlayerColor } from '@player/models/player-color';
import { GameSession } from '@game/game-type';
import { GameRound } from './models/game-round';
import { PlayerScores, RoundScore } from './models/player-scores';

export interface ChartSeries<TType extends 'line' | 'bar'> {
  datasets: ChartDataset<TType>[];
  labels: string[];
}

/**
 * Plain, JSON-safe snapshot of the live game. The runtime state is class instances with
 * methods (and previously a player *reference*), none of which survive `JSON.parse`, so we
 * serialize to this flat shape and rebuild the instances in {@link fromSnapshot}.
 */
export interface PerRoundSessionSnapshot {
  players: { name: string; playerNumber: number; color: ColorSnapshot }[];
  roundScores: { round: number; score: number }[][]; // parallel to players
  gameRounds: number[]; // roundIds; labels re-derived
  currentRound: number;
  currentPlayerIndex: number;
}

interface ColorSnapshot {
  red: number;
  green: number;
  blue: number;
  name: string;
}

/**
 * Signal-driven game state for per-round scoring. State lives in signals; chart data is
 * `computed` from them, so adding/editing a score re-renders the tables and charts with no
 * manual change-detection plumbing (the legacy `EventEmitter<ScoreChangeType>` is gone).
 *
 * Root-provided so the in-progress game survives navigation and Saved Players overlays.
 * The reference {@link GameSession}: the play host persists/rehydrates it via
 * {@link toSnapshot}/{@link fromSnapshot} and ends it via {@link reset}. `currentPlayer` is
 * derived from an *index* (not a `Player` reference) so the state is JSON-serializable and
 * round-trips cleanly through persistence.
 */
@Injectable({ providedIn: 'root' })
export class PerRoundScoringService implements GameSession {
  private readonly _scores = signal<PlayerScores[]>([]);
  private readonly _gameRounds = signal<GameRound[]>([]);
  private readonly _currentPlayerIndex = signal(0);
  private readonly _currentRound = signal(1);
  private readonly _gameInitialized = signal(false);

  readonly scores: Signal<PlayerScores[]> = this._scores.asReadonly();
  readonly gameRounds: Signal<GameRound[]> = this._gameRounds.asReadonly();
  readonly gameInitialized: Signal<boolean> = this._gameInitialized.asReadonly();

  readonly currentPlayer = computed<Player | null>(
    () => this._scores()[this._currentPlayerIndex()]?.player ?? null,
  );

  readonly playerList = computed(() => this._scores().map((s) => s.player.name));

  readonly lineChartData = computed<ChartSeries<'line'>>(() => ({
    labels: ['Start', ...this._gameRounds().map((r) => r.label)],
    datasets: this._scores().map((ps) => ps.toLineDataset()),
  }));

  readonly barChartData = computed<ChartSeries<'bar'>>(() => ({
    labels: ['Score Totals'],
    datasets: this._scores().map((ps) => ps.toBarDataset()),
  }));

  startGame(players: Player[]): void {
    this._scores.set(players.map((p) => new PlayerScores(p)));
    this._gameRounds.set([]);
    this._currentRound.set(1);
    this._currentPlayerIndex.set(0);
    this._gameInitialized.set(true);
  }

  /**
   * Discards the current game and returns to player selection. The host observes
   * `gameInitialized` → false and clears the persisted snapshot.
   */
  reset(): void {
    this._scores.set([]);
    this._gameRounds.set([]);
    this._currentRound.set(1);
    this._currentPlayerIndex.set(0);
    this._gameInitialized.set(false);
  }

  addScore(score: number): void {
    if (this._scores().length === 0) {
      return;
    }
    const round = this._currentRound();
    const index = this._currentPlayerIndex();
    this._scores.update((scores) =>
      scores.map((ps, i) => (i === index ? ps.addRoundScore(round, score) : ps)),
    );
    this.advancePlayer();
  }

  modifyScore(player: Player, round: number, newScore: number): void {
    this._scores.update((scores) =>
      scores.map((ps) =>
        ps.player.playerNumber === player.playerNumber ? ps.modifyRoundScore(round, newScore) : ps,
      ),
    );
  }

  private advancePlayer(): void {
    const lastIndex = this._scores().length - 1;
    const index = this._currentPlayerIndex();

    if (index === lastIndex) {
      this._currentRound.update((r) => r + 1);
      this._currentPlayerIndex.set(0);
    } else {
      // The first player of a round starting their turn means a new round has begun;
      // record it (and its label) for the table + line-chart axis.
      if (index === 0) {
        this._gameRounds.update((rounds) => [...rounds, new GameRound(this._currentRound())]);
      }
      this._currentPlayerIndex.set(index + 1);
    }
  }

  /** Build the JSON-safe snapshot from the live signals. */
  toSnapshot(): PerRoundSessionSnapshot {
    const scores = this._scores();
    return {
      players: scores.map((ps) => ({
        name: ps.player.name,
        playerNumber: ps.player.playerNumber,
        color: {
          red: ps.player.color.red,
          green: ps.player.color.green,
          blue: ps.player.color.blue,
          name: ps.player.color.name,
        },
      })),
      roundScores: scores.map((ps) =>
        ps.toRoundScores().map((s) => ({ round: s.round, score: s.score })),
      ),
      gameRounds: this._gameRounds().map((r) => r.roundId),
      currentRound: this._currentRound(),
      currentPlayerIndex: this._currentPlayerIndex(),
    };
  }

  /** Rebuild the model instances from a snapshot and set the signals (game becomes live). */
  fromSnapshot(snap: PerRoundSessionSnapshot): void {
    const scores = snap.players.map((p, i) => {
      const color = new PlayerColor(p.color.red, p.color.green, p.color.blue, p.color.name);
      const player = Object.assign(new Player(p.playerNumber), { name: p.name, color });
      const rounds = (snap.roundScores[i] ?? []).map((s) => new RoundScore(s.round, s.score));
      return new PlayerScores(player, rounds);
    });

    this._scores.set(scores);
    this._gameRounds.set(snap.gameRounds.map((id) => new GameRound(id)));
    this._currentRound.set(snap.currentRound);
    this._currentPlayerIndex.set(snap.currentPlayerIndex);
    this._gameInitialized.set(true);
  }
}
