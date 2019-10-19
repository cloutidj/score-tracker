import { Player } from '@models/player';

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
  public scores: RoundScore[];

  public total(): number {
    return this.scores.reduce((p, c) => p + c.score, 0);
  }

  public addRoundScore(round: number, score: number) {
    this.scores.push(new RoundScore(round, score));
  }

  constructor(player: Player) {
    this.player = player;
    this.scores = [];
  }
}

export class PerRoundScoringGame {
  public scores: PlayerScores[];
  public currentRound: number;
  public currentPlayer: Player;
  private readonly _lastPlayer: number;
  private readonly players: Player[];

  public addScore(score: number) {
    const playerScores = this.scores.find(s => s.player === this.currentPlayer);
    playerScores.addRoundScore(this.currentRound, score);
    this.nextPlayer();
  }

  private nextPlayer(): void {
    const currentPlayerIndex = this.players.findIndex(p => p === this.currentPlayer);
    if (currentPlayerIndex === this._lastPlayer) {
      this.currentRound++;
      this.currentPlayer = this.players[ 0 ];
    } else {
      this.currentPlayer = this.players[ currentPlayerIndex + 1 ];
    }
  }

  constructor(playerList: Player[]) {
    this.scores = [];
    this.players = playerList;
    playerList.forEach(p => this.scores.push(new PlayerScores(p)));
    this.currentPlayer = this.players[ 0 ];
    this.currentRound = 1;
    this._lastPlayer = this.players.length - 1;
  }
}
