import { EventEmitter, Injectable } from '@angular/core';
import { Player } from '@models/player';
import { ChartData } from '@models/chart-data';
import { PlayerScores } from '../models/player-scores';
import { GameRound } from '../models/game-round';

export enum ScoreChangeType {
  Add, Modify
}

@Injectable()
export class PerRoundScoringService {
  private _scores: PlayerScores[];
  private _gameRounds: GameRound[];
  private _currentRound: number;
  private _currentPlayer: Player;
  private _lineChartData: ChartData;
  private _barChartData: ChartData;
  private _lastPlayerIndex: number;
  private _gameInitialized = false;

  private _scoreChangeEvent = new EventEmitter<ScoreChangeType>();

  public gameInitialized(): boolean {
    return this._gameInitialized;
  }

  public scoreChangeEvent(): EventEmitter<ScoreChangeType> {
    return this._scoreChangeEvent;
  }

  public startGame(players: Player[]): void {
    this._scores = [];
    this._gameRounds = [];

    this._lineChartData = {
      chartData: [],
      labels: [ 'Start' ],
      colors: []
    };

    this._barChartData = {
      chartData: [],
      labels: [ 'Score Totals' ],
      colors: []
    };

    players.forEach(p => {
      const playerScores = new PlayerScores(p);
      this._scores.push(playerScores);
      this._lineChartData.chartData.push(playerScores.lineChartSeries);
      this._lineChartData.colors.push(playerScores.lineChartColor);
      this._barChartData.chartData.push(playerScores.barChartSeries);
      this._barChartData.colors.push(playerScores.barChartColor);
    });

    this._currentPlayer = this._scores[ 0 ].player;
    this._currentRound = 1;
    this._lastPlayerIndex = this._scores.length - 1;

    this._gameInitialized = true;
  }

  public currentPlayer(): Player {
    return this._currentPlayer;
  }

  public playerList(): string[] {
    return this._gameInitialized ? this._scores.map(sc => sc.player.name) : [];
  }

  public roundList(): GameRound[] {
    return this._gameRounds;
  }

  public scoreList(): PlayerScores[] {
    return this._scores;
  }

  public lineChartData(): ChartData {
    return this._lineChartData;
  }

  public barChartData(): ChartData {
    return this._barChartData;
  }

  public addScore(score: number): void {
    this.findPlayerScores(this.currentPlayer()).addRoundScore(this._currentRound, score);
    this.nextPlayer();
    this._scoreChangeEvent.emit(ScoreChangeType.Add);
  }

  public modifyScore(player: Player, round: number, newScore: number): void {
    this.findPlayerScores(player).modifyRoundScore(round, newScore);
    this._scoreChangeEvent.emit(ScoreChangeType.Modify);
  }

  private findPlayerScores(player: Player): PlayerScores {
    return this._scores.find(s => s.player === player);
  }

  private nextPlayer(): void {
    const currentPlayerIndex = this._scores.findIndex(s => s.player === this.currentPlayer());
    if (currentPlayerIndex === this._lastPlayerIndex) {
      this._currentRound++;
      this._currentPlayer = this._scores[ 0 ].player;
    } else {
      if (currentPlayerIndex === 0) {
        const gameRound = new GameRound(this._currentRound);
        this._gameRounds.push(gameRound);
        this._lineChartData.labels.push(gameRound.label);
      }
      this._currentPlayer = this._scores[ currentPlayerIndex + 1 ].player;
    }
  }
}
