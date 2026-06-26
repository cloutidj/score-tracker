export class GameRound {
  roundId: number;
  label: string;

  constructor(round: number) {
    this.roundId = round;
    this.label = `Round #${round}`;
  }
}
