import { EventEmitter, Injectable } from '@angular/core';
import { PerRoundScoringGame } from './models/per-round-scoring-game';
import { Player } from '@models/player';
import { ChartData } from '@models/chart-data';
import { PlayerScores } from './models/player-scores';

export enum ScoreChangeType {
  Add, Modify
}

@Injectable()
export class PerRoundScoringService {
  private _game: PerRoundScoringGame;
  public gameInitialized = false;
  public scoreChangeEvent = new EventEmitter<ScoreChangeType>();

  public startGame(players: Player[]): void {
    this._game = new PerRoundScoringGame(players);
    this.gameInitialized = true;
  }

  public get currentPlayer(): Player {
    return this._game.currentPlayer;
  }

  public get playerList(): string[] {
    return this.gameInitialized ? this._game.scores.map(sc => sc.player.name) : [];
  }

  public get roundList(): string[] {
    // Chart labels include game start which should be removed here
    return this._game.lineChartData.labels.slice(1);
  }

  public get scoreList(): PlayerScores[] {
    return this._game.scores;
  }

  public get lineChartData(): ChartData {
    return this._game.lineChartData;
  }

  public get barChartData(): ChartData {
    return this._game.barChartData;
  }

  public addScore(score: number): void {
    this._game.addScore(score);
    this.scoreChangeEvent.emit(ScoreChangeType.Add);
  }

  public modifyScore(player: Player, round: number, newScore: number): void {
    this._game.modifyScore(player, round, newScore);
    this.scoreChangeEvent.emit(ScoreChangeType.Modify);
  }
}
