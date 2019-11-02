import { PlayerColor } from '@models/player-color';

export class Player {
  playerNumber: number;
  name: string;
  color: PlayerColor;

  constructor(num: number) {
    this.playerNumber = num;
  }
}
