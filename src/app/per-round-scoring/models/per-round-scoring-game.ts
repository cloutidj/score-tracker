import { Player } from '@models/player';
import { ChartDataSets } from 'chart.js';
import { PlayerScores } from './player-scores';
import { ChartData } from '@models/chart-data';

export class PerRoundScoringGame {
  public scores: PlayerScores[];
  public currentRound: number;
  public currentPlayer: Player;
  public readonly lineChartData: ChartData;
  public readonly barChartData: ChartData;
  private readonly _lastPlayer: number;
  private readonly players: Player[];
  private readonly lineChartDataSets: ChartDataSets[];
  private readonly lineChartLabels: string[];
  private readonly barChartDataSets: ChartDataSets[];

  constructor(playerList: Player[]) {
    this.scores = [];
    this.lineChartDataSets = [];
    this.barChartDataSets = [];

    this.players = playerList;
    playerList.forEach(p => {
      const playerScores = new PlayerScores(p);
      this.scores.push(playerScores);
      this.lineChartDataSets.push(playerScores.lineChartSeries);
      this.barChartDataSets.push(playerScores.barChartSeries);
    });

    this.currentPlayer = this.players[ 0 ];
    this.currentRound = 1;
    this._lastPlayer = this.players.length - 1;

    this.lineChartLabels = [ 'Start' ];
    this.lineChartData = {
      chartData: this.lineChartDataSets,
      labels: this.lineChartLabels
    };

    this.barChartData = {
      chartData: this.barChartDataSets,
      labels: [ 'Score Totals' ]
    };
  }

  public addScore(score: number) {
    this.findPlayerScores(this.currentPlayer).addRoundScore(this.currentRound, score);
    this.nextPlayer();
  }

  public modifyScore(player: Player, round: number, newScore: number): void {
    this.findPlayerScores(player).modifyRoundScore(round, newScore);
  }

  private findPlayerScores(player: Player): PlayerScores {
    return this.scores.find(s => s.player === player);
  }

  private nextPlayer(): void {
    const currentPlayerIndex = this.players.findIndex(p => p === this.currentPlayer);
    if (currentPlayerIndex === this._lastPlayer) {
      this.currentRound++;
      this.currentPlayer = this.players[ 0 ];
    } else {
      if (currentPlayerIndex === 0) {
        this.lineChartLabels.push(this.currentRoundLabel());
        this.currentPlayer = this.players[ currentPlayerIndex + 1 ];
      }
    }
  }

  private currentRoundLabel(): string {
    return `Round #${this.currentRound}`;
  }
}
