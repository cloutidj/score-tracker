export class GameRound {
  readonly roundId: number;
  readonly label: string;

  constructor(round: number) {
    this.roundId = round;
    this.label = `Round #${round}`;
  }
}
