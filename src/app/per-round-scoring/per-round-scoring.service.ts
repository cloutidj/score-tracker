import { Injectable, Signal, computed, signal } from '@angular/core';
import { ChartDataset } from 'chart.js';
import { Player } from '@models/player';
import { GameRound } from './models/game-round';
import { PlayerScores } from './models/player-scores';

export interface ChartSeries<TType extends 'line' | 'bar'> {
  datasets: ChartDataset<TType>[];
  labels: string[];
}

/**
 * Signal-driven game state for per-round scoring. State lives in signals; chart data is
 * `computed` from them, so adding/editing a score re-renders the tables and charts with no
 * manual change-detection plumbing (the legacy `EventEmitter<ScoreChangeType>` is gone).
 *
 * Provided per `PerRoundScoringComponent` instance (not root) so each game starts fresh.
 */
@Injectable()
export class PerRoundScoringService {
  private readonly _scores = signal<PlayerScores[]>([]);
  private readonly _gameRounds = signal<GameRound[]>([]);
  private readonly _currentPlayer = signal<Player | null>(null);
  private readonly _currentRound = signal(1);
  private readonly _gameInitialized = signal(false);

  readonly scores: Signal<PlayerScores[]> = this._scores.asReadonly();
  readonly gameRounds: Signal<GameRound[]> = this._gameRounds.asReadonly();
  readonly currentPlayer: Signal<Player | null> = this._currentPlayer.asReadonly();
  readonly gameInitialized: Signal<boolean> = this._gameInitialized.asReadonly();

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
    this._currentPlayer.set(players[0] ?? null);
    this._gameInitialized.set(true);
  }

  addScore(score: number): void {
    const current = this._currentPlayer();
    if (!current) {
      return;
    }
    const round = this._currentRound();
    this._scores.update((scores) =>
      scores.map((ps) => (ps.player === current ? ps.addRoundScore(round, score) : ps)),
    );
    this.advancePlayer(current);
  }

  modifyScore(player: Player, round: number, newScore: number): void {
    this._scores.update((scores) =>
      scores.map((ps) => (ps.player === player ? ps.modifyRoundScore(round, newScore) : ps)),
    );
  }

  private advancePlayer(current: Player): void {
    const scores = this._scores();
    const currentIndex = scores.findIndex((s) => s.player === current);
    const lastIndex = scores.length - 1;

    if (currentIndex === lastIndex) {
      this._currentRound.update((r) => r + 1);
      this._currentPlayer.set(scores[0].player);
    } else {
      // The first player of a round starting their turn means a new round has begun;
      // record it (and its label) for the table + line-chart axis.
      if (currentIndex === 0) {
        this._gameRounds.update((rounds) => [...rounds, new GameRound(this._currentRound())]);
      }
      this._currentPlayer.set(scores[currentIndex + 1].player);
    }
  }
}
