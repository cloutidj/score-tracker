import { Player } from '@models/player';
import { ChartDataSets } from 'chart.js';

export class RoundScore {
  public round: number;
  public score: number;

  constructor(round: number, score: number) {
    this.round = round;
    this.score = score;
  }
}

export class PlayerScores {
  public player: Player;
  private readonly _scores: RoundScore[];
  public readonly lineChartSeries: ChartDataSets;
  public readonly barChartSeries: ChartDataSets;

  public total(): number {
    return this._scores.reduce((p, c) => p + c.score, 0);
  }

  public hasScoreForRound(round: number): boolean {
    const roundScore = this.getRoundScore(round);
    return !!roundScore && roundScore.score !== null;
  }

  public roundScore(round: number): number {
    const roundScore = this.getRoundScore(round);
    return roundScore ? roundScore.score : null;
  }

  public addRoundScore(round: number, score: number) {
    this._scores.push(new RoundScore(round, score));
    this.lineChartSeries.data.push((this.lineChartSeries.data[ round - 1 ] as number) + score);
    this.updateBarTotal();
  }

  public modifyRoundScore(round: number, newScore: number): void {
    this.getRoundScore(round).score = newScore;
    let runningTotal = 0;
    let index = 1;
    this._scores.forEach(sc => {
      runningTotal += sc.score;
      this.lineChartSeries.data[ index ] = runningTotal;
      index++;
    });
    this.updateBarTotal();
  }

  private updateBarTotal(): void {
    this.barChartSeries.data[ 0 ] = this.total();
  }

  private getRoundScore(round: number): RoundScore {
    return this._scores.find(s => s.round === round);
  }

  constructor(player: Player) {
    this.player = player;
    this._scores = [];
    this.lineChartSeries = {
      label: player.name,
      data: [ 0 ]
    };
    this.barChartSeries = {
      label: player.name,
      data: [ this.total() ]
    };
  }
}
